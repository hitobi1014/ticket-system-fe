import type { CreateRowsRequest, CreateSeatRequest, FloorItem, Section } from '@/types';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import Row from '@/components/seat/Row.tsx';
import { useState } from 'react';
import useFloorStore from '@/store/floorStore.ts';

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
  const [isRowEditMode, setRowIsEditMode] = useState<boolean>(false);

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

  if (item.kind === 'aisle') {
    return (
      <div
        key={item.id}
        className="border-2 border-dashed bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          handleSelectAisle(item.id);
        }}
      >
        통로: {item.label}
      </div>
    );
  }

  return (
    /* Section */
    <div
      key={item.id}
      onClick={() => {
        handleSelectSection(item.id);
      }}
    >
      <h1 className="bg-amber-300">
        {item.name} (좌석수: {item.rows.flatMap((r) => r.seats).length})
      </h1>
      {selectedSectionId === item.id ? (
        <>
          <ButtonGroup>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddRow(item.id);
              }}
            >
              열 추가
            </Button>
            <Button
              disabled={selectedRowId === null}
              onClick={(e) => {
                e.stopPropagation();
                handleAddSeat();
              }}
            >
              좌석 추가
            </Button>
            <Button
              disabled={selectedRowId === null}
              onClick={(e) => {
                e.stopPropagation();
                setRowIsEditMode(!isRowEditMode);
              }}
            >
              열 편집모드: {isRowEditMode ? 'O' : 'X'}
            </Button>
            <Button
              disabled={selectedRowId === null}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveRow(selectedRowId!);
              }}
            >
              열 삭제
            </Button>
          </ButtonGroup>
        </>
      ) : (
        ''
      )}
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
  );
}
