import type { Floor, Section, Seat, VenueConfig, Rows } from '@/types';
import { mockMembers } from '@/mocks/members.ts';

function buildMemberSeatMap(): Map<number, number> {
  const map = new Map<number, number>();
  let seatId = 0;
  for (const member of mockMembers) {
    for (let i = 0; i < member.allocatedTickets; i++) {
      map.set(seatId++, member.id);
    }
  }
  return map;
}

const memberSeatMap = buildMemberSeatMap();
let seatIdCnt = 0;
let rowIdCnt = 0;
let sectionIdCnt = 1;
let aisleIdCnt = 101;

function createSeats(count: number): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: seatIdCnt,
    seatNumber: i + 1,
    assignedMemberId: memberSeatMap?.get(seatIdCnt++),
    visible: true,
  }));
}

// 열마다 좌석 수를 다르게 — 앞열 적고 뒷열 많은 자연스러운 배치
function createRows(rowCount: number, baseSeats: number): Rows[] {
  return Array.from({ length: rowCount }, (_, i) => {
    const variation = Math.floor(i / 2);
    const seatCount = Math.min(baseSeats + variation, baseSeats + 4);
    return {
      id: rowIdCnt++,
      rowName: String(i + 1),
      seats: createSeats(seatCount),
    };
  });
}

function createSection(name: string, rowCount: number, baseSeats: number): Section {
  return {
    kind: 'section',
    id: sectionIdCnt++,
    name,
    rows: createRows(rowCount, baseSeats),
  };
}

// =====================
// 1층 — 약 480석
// 가/나/다/라 4구역
// =====================
const floor1Sections: Section[] = [
  createSection('가구역', 10, 10), // 10열 × 10~14석 ≈ 120석
  createSection('나구역', 10, 14), // 10열 × 14~18석 ≈ 160석
  createSection('다구역', 10, 14), // 10열 × 14~18석 ≈ 160석
  createSection('라구역', 10, 10), // 10열 × 10~14석 ≈ 120석 (좌우 대칭)
];

// =====================
// 2층 — 약 360석
// 가/나/다 3구역
// =====================
const floor2Sections: Section[] = [
  createSection('가구역', 8, 12), // 8열 × 12~16석 ≈ 112석
  createSection('나구역', 8, 16), // 8열 × 16~20석 ≈ 144석
  createSection('다구역', 8, 12), // 8열 × 12~16석 ≈ 112석
];

// =====================
// 3층 발코니 — 약 180석
// 좌/중/우 3구역
// =====================
const floor3Sections: Section[] = [
  createSection('좌구역', 5, 10), // 5열 × 10~14석 ≈  60석
  createSection('중구역', 5, 14), // 5열 × 14~18석 ≈  80석
  createSection('우구역', 5, 10), // 5열 × 10~14석 ≈  60석
];

// =====================
// 층 데이터
// =====================
export const mockFloors: Floor[] = [
  {
    id: 1,
    name: '1층',
    items: [
      floor1Sections[0],
      { kind: 'aisle', id: aisleIdCnt++, label: '101통로' },
      floor1Sections[1],
      { kind: 'aisle', id: aisleIdCnt++, label: '102통로' },
      floor1Sections[2],
      { kind: 'aisle', id: aisleIdCnt++, label: '103통로' },
      floor1Sections[3],
    ],
  },
  {
    id: 2,
    name: '2층',
    items: [
      floor2Sections[0],
      { kind: 'aisle', id: aisleIdCnt++, label: '201통로' },
      floor2Sections[1],
      { kind: 'aisle', id: aisleIdCnt++, label: '202통로' },
      floor2Sections[2],
    ],
  },
  {
    id: 3,
    name: '3층 발코니',
    items: [
      floor3Sections[0],
      { kind: 'aisle', id: aisleIdCnt++, label: '301통로' },
      floor3Sections[1],
      { kind: 'aisle', id: aisleIdCnt++, label: '302통로' },
      floor3Sections[2],
    ],
  },
];

export const mockVenueConfig: VenueConfig = {
  id: 1,
  name: '상명아트센터 계당홀',
  floors: mockFloors,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
