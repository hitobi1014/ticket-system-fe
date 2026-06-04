import useFloorStore from '../store/floorStore.ts';
import { useState } from 'react';
import type {
  Aisle,
  CreateFloorRequest,
  CreateRowsRequest,
  CreateSeatRequest,
  Section,
} from '@/types';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import Row from '@/components/seat/Row.tsx';

export default function FloorSetupPage() {
  const {
    floors,
    addFloor,
    removeFloor,
    addSection,
    removeSection,
    addAisle,
    addRow,
    removeRow,
    addSeat,
    removeSeat,
  } = useFloorStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [isRowEditMode, setRowIsEditMode] = useState<boolean>(false);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? null;
  const selectedSection = selectedFloor?.items.find(
    (item): item is Section => item.kind === 'section' && item.id === selectedSectionId,
  );

  const handleRemoveFloor = (id: number) => {
    const isRemove = window.confirm(`정말로 삭제하시겠습니까? ${id}`); // id말고 name 확인하며 물어보기

    // TODO 추후확인 해당 층에 Section 있으면 경고 메시지
    if (!isRemove) return;
    removeFloor(id);

    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    if (selectedFloorId === id) {
      const remaining = floors.filter((f) => f.id !== id);
      setSelectedFloorId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddFloor = () => {
    const name = window.prompt('층 이름을 입력하세요.'); // TODO 나중에 모달로 입력 바꾸기
    if (!name?.trim()) return;
    const newId = floors.reduce((max, f) => Math.max(max, f.id), 0) + 1;
    const req: CreateFloorRequest = {
      id: newId,
      name: name.trim(),
    };
    addFloor(req);
    setSelectedFloorId(req.id);
  };

  const handleAddSection = () => {
    if (!selectedFloor) return;
    const sectionName = window.prompt('구역명을 입력하세요.');
    if (!sectionName?.trim()) {
      alert('구역명은 빈 값으로 입력할 수 없습니다.');
      return;
    }
    const maxSectionId = floors
      .flatMap((f) => f.items)
      .filter((item): item is Section => item.kind === 'section')
      .reduce((max, section) => Math.max(max, section.id), 0);

    addSection(selectedFloor.id, {
      id: maxSectionId + 1,
      name: sectionName,
    });
  };

  const handleRemoveSection = (sectionName: string, sectionId: number) => {
    if (sectionId === null) return;

    const isRemove = window.confirm(`${sectionName} 구역을 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    removeSection(sectionId);
  };

  const handleSelectSection = (sectionId: number) => {
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
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

    const reqs: CreateSeatRequest[] = Array.from({ length: addSeatCount }, (_, i) => ({
      id: maxSeatId + i,
      seatNumber: i,
    }));
    addSeat(selectedRowId, reqs);
  };

  const handleRemoveSeat = (seatId: number) => {
    const isRemove = window.confirm(
      `선택된 좌석을 삭제하시겠습니까? 선택된 열-좌석: ${selectedRowId}-${seatId}`,
    );
    if (!isRemove) return;

    removeSeat(seatId);
  };

  const handleAddAisle = () => {
    if (!selectedFloor) return;
    const aisleLabel = window.prompt('통로명 입력(선택)');

    const maxAisleId = floors
      .flatMap((f) => f.items)
      .filter((item): item is Aisle => item.kind === 'aisle')
      .reduce((max, aisle) => Math.max(max, aisle.id), 0);

    addAisle(selectedFloor.id, {
      id: maxAisleId + 1,
      kind: 'aisle',
      label: aisleLabel ?? '',
    });
  };
  return (
    <div>
      <button onClick={() => handleAddFloor()}>층 추가</button>
      <div>
        {/* 1층 탭바 */}
        {floors.map((floor) => (
          <>
            <button
              key={floor.id}
              onClick={() => setSelectedFloorId(floor.id)}
              className={selectedFloorId === floor.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}
            >
              {floor.name}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFloor(floor.id);
                }}
              ></span>
            </button>
          </>
        ))}
      </div>

      {/* 2) 메인 영역 - 선택한 층의 구역/좌석 */}
      <div className="mt-4">
        {selectedFloor ? (
          <>
            <div className="flex items-center">
              <ButtonGroup>
                <Button onClick={() => handleAddSection()}>구역추가</Button>
                <Button onClick={() => handleAddAisle()}>통로추가</Button>
              </ButtonGroup>
              <span className="ml-2 bg-gray-400 text-white">
                선택된 구역: {selectedSection?.name}
              </span>
            </div>
            {/* 구역인지 통로인지 구분*/}
            <div className="flex">
              {selectedFloor.items.map((item) => {
                if (item.kind === 'aisle') {
                  return (
                    <div key={item.id} className="border-2 bg-gray-100">
                      통로: {item.label}
                    </div>
                  );
                }

                return (
                  /* Section */
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSection(item.id);
                    }}
                  >
                    <h1 className="bg-amber-300">{item.name} / 총 좌석수: ex)500</h1>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSection(item.name, item.id);
                      }}
                    >
                      구역 삭제
                    </button>
                    <br />
                    {selectedSectionId === item.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddRow(item.id);
                          }}
                        >
                          열 추가
                        </button>
                        <ButtonGroup>
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
                        {item.rows.map((row) => (
                          <Row
                            row={row}
                            isEditMode={isRowEditMode}
                            isSelected={selectedRowId === row.id}
                            onSelect={setSelectedRowId}
                            onRemoveSeat={handleRemoveSeat}
                          />
                        ))}
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })}
            </div>
            <p>
              {selectedFloor.name} 선택됨 - 구역 {selectedFloor.items.length}개
            </p>
          </>
        ) : (
          <p>층을 추가해주세요.</p>
        )}
      </div>
    </div>
  );
}
