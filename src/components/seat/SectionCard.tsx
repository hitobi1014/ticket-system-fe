import type { ButtonItem, CreateRowsRequest, CreateSeatRequest, FloorItem, Section } from '@/types';
import Row from '@/components/seat/Row.tsx';
import useFloorStore from '@/store/floorStore.ts';
import { IconArmchair, IconPlus, IconTrash } from '@tabler/icons-react';
import FunctionButtons from '@/components/common/FunctionButtons.tsx';
import './SectionCard.css';

interface SectionCardProps {
  item: FloorItem;
  selectedRowId: number | null;
  selectedSectionId: number | null;
  selectedAisleId: number | null;
  isRowEditMode: boolean;

  onSelectedSectionId: (id: number | null) => void;
  onSelectedAisleId: (id: number | null) => void;
  onSelectedRowId: (id: number | null) => void;
}

export default function SectionCard({
  item,
  selectedRowId,
  selectedSectionId,
  selectedAisleId,
  isRowEditMode,
  onSelectedSectionId,
  onSelectedAisleId,
  onSelectedRowId,
}: SectionCardProps) {
  const { floors, addRow, removeRow, addSeat, removeSeat } = useFloorStore();
  const handleSelectSection = (sectionId: number) => {
    onSelectedSectionId(selectedSectionId === sectionId ? null : sectionId);
  };

  const handleSelectAisle = (id: number) => {
    onSelectedAisleId(selectedAisleId === id ? null : id);
  };

  const handleAddRow = (sectionId: number) => {
    const rowName = window.prompt('추가 할 열 이름을 입력해주세요.');
    if (rowName === null || rowName === '') {
      alert(`열 이름을 다시 확인해주세요. 빈 값은 입력할 수 없습니다. \n 입력한 값: ${rowName}`);
      return;
    }

    const maxRowId = floors
      .flatMap((f) => f.items)
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
      .flatMap((f) => f.items)
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .filter((row) => row.id === selectedRowId)
      .flatMap((r) => r.seats)
      .reduce((max, seat) => Math.max(max, seat.id), 0);

    const maxSeatNumber = floors
      .flatMap((f) => f.items)
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

  const handleRemoveSeat = (seatId: number) => {
    const findRow = floors
      .flatMap((f) => f.items)
      .filter((item): item is Section => item.kind === 'section')
      .flatMap((s) => s.rows)
      .find((row) => row.id === selectedRowId);

    // TODO 삭제할때 중앙 좌석 삭제할 필요?
    const isRemove = window.confirm(
      `선택된 좌석을 삭제하시겠습니까? 선택된 열-좌석: ${findRow?.rowName}-${seatId}`,
    );
    if (!isRemove) return;

    removeSeat(seatId);
  };

  // 열 편집 버튼
  const sectionEditButtons: ButtonItem[] = [
    {
      text: '열 추가',
      size: 'xs',
      icon: <IconPlus stroke={2} />,
      onClick: () => {
        handleAddRow(item.id);
      },
    },
    {
      text: '좌석 추가',
      size: 'xs',
      icon: <IconArmchair stroke={2} />,
      disabled: selectedRowId === null,
      onClick: () => {
        handleAddSeat();
      },
    },
    {
      text: '열 삭제',
      size: 'xs',
      icon: <IconTrash stroke={2} />,
      disabled: selectedRowId === null,
      onClick: () => {
        handleRemoveRow(selectedRowId!);
      },
    },
  ];

  /* 화면 렌더링 구역 */
  if (item.kind === 'aisle') {
    return (
      <div
        key={item.id}
        className="card flex items-center justify-center self-stretch px-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleSelectAisle(item.id);
        }}
      >
        <div className="w-px h-2/4 bg-mist-500" />
      </div>
    );
  }

  return (
    /* Section */
    /* TODO 열 클릭시 ring */
    <div
      key={item.id}
      className="card primary-color flex flex-col gap-y-2 p-4"
      onClick={() => {
        handleSelectSection(item.id);
      }}
    >
      <div className="flex justify-between items-center">
        <p>{item.name}</p>
        <p>{item.rows.flatMap((r) => r.seats).length}석</p>
      </div>
      {selectedSectionId === item.id && isRowEditMode ? (
        <FunctionButtons buttons={sectionEditButtons} />
      ) : (
        ''
      )}
      <div className="flex flex-col gap-y-2">
        {item.rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            isEditMode={isRowEditMode}
            isSelected={selectedRowId === row.id}
            onSelect={onSelectedRowId}
            onRemoveSeat={handleRemoveSeat}
          />
        ))}
      </div>
    </div>
  );
}
