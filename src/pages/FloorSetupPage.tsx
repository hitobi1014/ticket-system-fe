import useFloorStore from '../store/floorStore.ts';
import { useState } from 'react';
import type { CreateFloorRequest, Section } from '@/types';

export default function FloorSetupPage() {
  const { floors, addFloor, removeFloor, addSection, removeSection } = useFloorStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const selectedFloor = floors.find((x) => x.id === selectedFloorId) ?? null;
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

  const handleRemoveSection = (sectionName:string, sectionId: number) => {
    if (sectionId === null) return;

    const isRemove = window.confirm(`${sectionName} 구역을 정말 삭제하시겠습니까?`);
    if (!isRemove) return;

    removeSection(sectionId);
  }

  const handleSelectSection = (sectionId: number) => {
    setSelectedSectionId(null);
    setSelectedSectionId(sectionId);
  }

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
            <button onClick={() => handleAddSection()}>구역추가</button>
            {/* 구역인지 통로인지 구분*/}
            {selectedFloor.items.map((item) => {
              if (item.kind === 'aisle') {
                return <div key={item.id}>통로</div>;
              }

              return (
                /* Section */
                <div key={item.id} onClick={() => handleSelectSection(item.id)}>
                  <h1 className="bg-amber-300">{item.name}</h1>
                  <h1>총 좌석 수: ex)500</h1> {/*TODO 추후 Seat까지 개발완료되면 수정하기*/}
                  <button onClick={() => handleRemoveSection(item.name, item.id)}>구역 삭제</button>
                  <br />
                  {selectedSectionId ? (
                    <>
                      {/*TODO 선택했을때 기존에 선택된 구역은 해제 => 화면 x*/}
                      <button>열 추가 선택된 구역:{item.name} </button>
                      {item.rows.map((row) => {
                        return (
                          <div>
                            <h1>id: {row.id}</h1>
                            <h1>rowNumber: {row.rowNumber}</h1>
                          </div>
                        );
                      })}
                    </>
                  ): ''}
                </div>
              );
            })}
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
