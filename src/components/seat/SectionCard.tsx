import type { ButtonItem, CreateRowsRequest, CreateSeatRequest, FloorItem, Section } from '@/types';
import Row from '@/components/seat/Row.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { IconArmchair, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import { clsx } from 'clsx';
import { findSeatContextByRowId } from '@/lib/seatUtils.ts';

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
  const { floors, addRow, removeRow, addSeat, removeSeat } = useFloorStore();

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

  const handleAddRow = (sectionId: number) => {
    const rowName = window.prompt('추가 할 열 이름을 입력해주세요.');
    if (rowName === null || rowName === '') {
      alert(`열 이름을 다시 확인해주세요. 빈 값은 입력할 수 없습니다. \n 입력한 값: ${rowName}`);
      return;
    }

    const maxRowId = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .reduce((max, row) => Math.max(max, row.id), 0);

    const req: CreateRowsRequest = {
      id: maxRowId + 1,
      rowName: rowName,
    };
    addRow(sectionId, req);
  };

  const handleRemoveRow = (rowId: number) => {
    const isRemove = window.confirm(`선택한 row:${rowId}를 삭제하시겠습니까?`);
    if (!isRemove) return;
    removeRow(rowId);
  };

  /**
   * 입력 받은 좌석 수 만큼 해당 열에 좌석 추가
   */
  const handleAddSeat = () => {
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

    const maxSeatId = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .filter((row) => row.id === selectedRowId)
      .flatMap((r) => r.seats)
      .reduce((max, seat) => Math.max(max, seat.id), 0);

    const maxSeatNumber = floors
      .flatMap((f) => f.rows.flatMap((r) => r.items))
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .filter((row) => row.id === selectedRowId)
      .flatMap((r) => r.seats)
      .reduce((max, seat) => Math.max(max, seat.seatNumber), 0);

    const reqs: CreateSeatRequest[] = Array.from({ length: addSeatCount }, (_, i) => ({
      id: maxSeatId + i + 1,
      seatNumber: maxSeatNumber + i + 1,
    }));
    addSeat(selectedRowId, reqs);
  };

  const handleRemoveSeat = (removeSeatCnt: number) => {
    if (selectedRowId == null) {
      alert('값 없음');
      return;
    }
    removeSeat(selectedRowId, removeSeatCnt);
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
      variant: 'secondary',
      text: '좌석 삭제',
      size: 'xs',
      icon: <IconTrash stroke={2} />,
      disabled: selectedRowId === undefined,
      onClick: () => {
        handleAddSeat();
      },
      dialog: {
        dialogTitle: '좌석 삭제',
        type: 'removeSeat',
        rowId: selectedRowId ?? undefined,
        rowName: findSeatContextByRowId(floors, selectedRowId!)?.row.rowName ?? '열 설정x',
        currentSeatCount: findSeatContextByRowId(floors, selectedRowId!)?.row.seats.length ?? 0,
        sectionName: findSeatContextByRowId(floors, selectedRowId!)?.section.name ?? '구역 설정x',
        onClick: handleRemoveSeat,
      },
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
          'text-content-primary bg-surface-secondary rounded-md flex items-center justify-center self-stretch px-3 cursor-pointer',
          {
            'ring-2 ring-text-content-primary': selectedAisleId === item.id,
          },
        )}
      >
        <div className="w-px h-2/4 bg-mist-500" />
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
        'bg-surface-secondary rounded-md text-content-primary flex flex-col gap-y-2 p-4',
        {
          'ring-2 ring-text-content-primary': selectedSectionId === item.id,
        },
      )}
    >
      <div
        className="flex justify-between items-center"
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
          />
        ))}
      </div>
    </div>
  );
}
