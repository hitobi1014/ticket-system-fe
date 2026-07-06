import type { ButtonItem, CreateRowsRequest, CreateSeatRequest, FloorItem } from '@/types';
import Row from '@/components/seat/Row.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { IconArmchair, IconEyeOff, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import { clsx } from 'clsx';
import { findSeatContextByRowId } from '@/lib/seatUtils.ts';
import { toast } from 'sonner';
import { RemoveSeatDialog } from '@/components/dialog/RemoveSeatDialog.tsx';
import { useState } from 'react';

interface SectionCardProps {
  item: FloorItem;
  selectedRowId: number | null;
  selectedSectionId: number | null;
  selectedAisleId: number | null;

  onSelectedSectionId: (id: number | null) => void;
  onSelectedAisleId: (id: number | null) => void;
  onSelectedRowId: (id: number | null) => void;
}

export default function SectionCard({
  item,
  selectedRowId,
  selectedSectionId,
  selectedAisleId,
  onSelectedSectionId,
  onSelectedAisleId,
  onSelectedRowId,
}: SectionCardProps) {
  const { floors, addRow, removeRow, addSeat, removeSeat, toggleSeatVisible } = useFloorStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  const handleSelectSection = (sectionId: number) => {
    if (selectedSectionId === sectionId) return;
    onSelectedSectionId(sectionId);
    onSelectedAisleId(null);
  };

  const handleSelectAisle = (id: number) => {
    if (selectedAisleId === id) return;
    onSelectedAisleId(id);
    onSelectedSectionId(null);
  };

  const handleAddRow = async (sectionId: number) => {
    const rowName = window.prompt('추가 할 열 이름을 입력해주세요.');
    if (rowName === null || rowName === '') {
      alert(`열 이름을 다시 확인해주세요. 빈 값은 입력할 수 없습니다. \n 입력한 값: ${rowName}`);
      return;
    }

    const req: CreateRowsRequest = {
      rowName: rowName,
    };
    try {
      await addRow(sectionId, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '행 추가에 실패했습니다.');
    }
  };

  const handleRemoveRow = async (rowId: number) => {
    const isRemove = window.confirm(`선택한 row:${rowId}를 삭제하시겠습니까?`);
    if (!isRemove) return;

    try {
      await removeRow(rowId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '행 삭제에 실패했습니다.');
    }
  };

  /**
   * 입력 받은 좌석 수 만큼 해당 열에 좌석 추가
   */
  const handleAddSeat = async () => {
    if (selectedRowId === null) {
      alert('선택된 row가 없습니다.');
      return;
    }
    const addSeatCount = Number(window.prompt('추가하실 좌석 수를 입력해주세요'));
    if (isNaN(addSeatCount) || addSeatCount === 0) {
      alert(
        `입력값이 올바르지 않습니다. 1개 이상의 좌석수를 입력해주세요 \n 입력값 :${addSeatCount}`,
      );
      return;
    }

    const req: CreateSeatRequest = {
      addSeatCount: addSeatCount,
    };

    try {
      await addSeat(selectedRowId, req);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '좌석 추가에 실패했습니다.');
    }
  };

  const handleRemoveSeat = async (removeSeatCnt: number) => {
    if (selectedRowId == null) {
      alert('값 없음');
      return;
    }

    try {
      await removeSeat(selectedRowId, removeSeatCnt);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '좌석 삭제에 실패했습니다.');
    }
  };

  const handleToggleSeatVisible = async () => {
    if (selectedSeatIds.size === 0) {
      toast.error('선택된 좌석이 없습니다.');
      return;
    }

    try {
      await toggleSeatVisible([...selectedSeatIds]);
      setSelectedSeatIds(new Set()); // 선택 초기화
      toast.success(`${selectedSeatIds.size}개 좌석의 표시 상태가 변경되었습니다.`);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '좌석 표시 상태 변경에 실패했습니다.');
    }
  };

  const handleSeatClick = (seatId: number) => {
    // row 선택 모드가 아닐 때만 좌석 선택 가능
    if (selectedRowId === null) return;

    setSelectedSeatIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        newSet.delete(seatId);
      } else {
        newSet.add(seatId);
      }
      return newSet;
    });
  };

  // 열 편집 버튼
  const sectionEditButtons: ButtonItem[] = [
    {
      variant: 'secondary',
      text: '열 추가',
      size: 'xs',
      icon: <IconPlus stroke={2} />,
      onClick: () => {
        handleAddRow(item.id);
      },
    },
    {
      variant: 'secondary',
      text: '열 삭제',
      size: 'xs',
      icon: <IconMinus stroke={2} />,
      disabled: selectedRowId === undefined,
      onClick: () => {
        handleRemoveRow(selectedRowId!);
      },
    },
    {
      variant: 'secondary',
      text: '좌석 추가',
      size: 'xs',
      icon: <IconArmchair stroke={2} />,
      disabled: selectedRowId === undefined,
      onClick: () => {
        handleAddSeat();
      },
    },
    {
      dialog: (
        <RemoveSeatDialog
          title="좌석 삭제"
          buttonText="좌석 삭제"
          icon={<IconTrash stroke={2} />}
          variant="secondary"
          size="xs"
          disabled={selectedRowId === undefined}
          rowId={selectedRowId ?? undefined}
          rowName={findSeatContextByRowId(floors, selectedRowId!)?.row.rowName ?? '열 설정x'}
          currentSeatCount={findSeatContextByRowId(floors, selectedRowId!)?.row.seats.length ?? 0}
          sectionName={findSeatContextByRowId(floors, selectedRowId!)?.section.name ?? '구역 설정x'}
          onConfirm={handleRemoveSeat}
        />
      ),
    },
    {
      variant: 'secondary',
      text: `빈 좌석 ${selectedSeatIds.size > 0 ? `(${selectedSeatIds.size})` : '설정'}`,
      size: 'xs',
      icon: <IconEyeOff stroke={2} />,
      disabled: selectedSeatIds.size === 0,
      onClick: handleToggleSeatVisible,
    },
  ];

  if (item.kind === 'aisle') {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleSelectAisle(item.id);
        }}
        className={clsx(
          'text-content-primary bg-surface-secondary flex cursor-pointer items-center justify-center self-stretch rounded-md px-3',
          {
            'ring-text-content-primary ring-2': selectedAisleId === item.id,
          },
        )}
      >
        <div className="h-2/4 w-px bg-mist-500" />
      </div>
    );
  }

  /* Section */
  return (
    <div
      key={item.id}
      onClick={(e) => {
        e.stopPropagation();
        handleSelectSection(item.id);
      }}
      className={clsx(
        'bg-surface-secondary text-content-primary flex flex-col gap-y-2 rounded-md p-4',
        {
          'ring-text-content-primary ring-2': selectedSectionId === item.id,
        },
      )}
    >
      <div
        className="flex items-center justify-between"
        onClick={(e) => {
          e.stopPropagation();
          handleSelectSection(item.id);
          onSelectedRowId(null); // row 선택 해제
        }}
      >
        <p>{item.name}</p>
        <p>{item.rows.flatMap((r) => r.seats).length}석</p>
      </div>
      {selectedSectionId === item.id && <FunctionButtons buttons={sectionEditButtons} />}
      <div className="flex flex-col gap-y-2">
        {item.rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            isSelected={selectedRowId === row.id}
            onClick={(rowId) => {
              handleSelectSection(item.id);
              onSelectedRowId(rowId);
            }}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClick}
            isEditMode={selectedRowId === row.id}
          />
        ))}
      </div>
    </div>
  );
}
