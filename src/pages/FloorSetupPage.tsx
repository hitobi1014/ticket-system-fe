import useSeatStore from '@/store/seatStore.ts';
import { useState } from 'react';
import type { CreateFloorRequest } from '@/types';

export default function FloorSetupPage() {
  const { floors, addFloor, removeFloor } = useSeatStore();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(
    floors.length > 0 ? floors[0].id : null,
  );

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
    const newId = floors.reduce((max, f) => Math.max(max, f.id ?? 0), 0);
    const req: CreateFloorRequest = {
      id: newId,
      name: name.trim(),
    };
    addFloor(req);
    setSelectedFloorId(req.id);
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
          <p>
            {selectedFloor.name} 선택됨 - 구역 {selectedFloor.items.length}개
          </p>
        ) : (
          <p>층을 추가해주세요.</p>
        )}
      </div>
    </div>
  );
}
