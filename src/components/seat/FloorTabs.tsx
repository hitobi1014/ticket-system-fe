import type { Floor } from '@/types';
import useFloorStore from '@/store/floorStore.ts';

interface FloorProps {
  floor: Floor;
  selectedFloorId: number | null;
  // set
  onSelectedFloorId: (id: number | null) => void;
}

export default function FloorTabs({ floor, onSelectedFloorId, selectedFloorId }: FloorProps) {
  const { floors, removeFloor } = useFloorStore();

  const handleRemoveFloor = (id: number) => {
    const isRemove = window.confirm(`정말로 삭제하시겠습니까? ${id}`); // id말고 name 확인하며 물어보기

    // TODO 추후확인 해당 층에  Section 있으면 경고 메시지
    if (!isRemove) return;
    removeFloor(id);

    // 삭제한 층이 현재 선택된 층이면 -> 첫 번째 층으로 이동
    if (selectedFloorId === id) {
      const remaining = floors.filter((f) => f.id !== id);
      onSelectedFloorId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div>
      <button
        onClick={() => onSelectedFloorId(floor.id)}
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
    </div>
  );
}
