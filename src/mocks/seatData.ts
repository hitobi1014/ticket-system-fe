import type { Floor, Section, Seat, Venue, Rows } from '@/types';
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
// 1층 — 약 500석 (4개 FloorRow)
// =====================
// FloorRow 1: VIP 프리미엄석 (앞쪽) - 약 144석
const floor1Row1 = [
  createSection('VIP-가구역', 6, 12), // 6열 × 12~16석 ≈ 72석
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '101통로' },
  createSection('VIP-나구역', 6, 12), // 6열 × 12~16석 ≈ 72석
];

// FloorRow 2: 중앙 좌측 - 약 176석
const floor1Row2 = [
  createSection('가구역', 8, 10), // 8열 × 10~14석 ≈ 88석
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '102통로' },
  createSection('나구역', 8, 12), // 8열 × 12~16석 ≈ 96석
];

// FloorRow 3: 중앙 우측 - 약 176석
const floor1Row3 = [
  createSection('다구역', 8, 12), // 8열 × 12~16석 ≈ 96석
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '103통로' },
  createSection('라구역', 8, 10), // 8열 × 10~14석 ≈ 88석
];

// FloorRow 4: 뒤쪽 입석 - 약 4석
const floor1Row4 = [
  createSection('마구역', 1, 4), // 1열 × 4석 (입석/스탠딩)
];

// =====================
// 2층 — 약 400석 (4개 FloorRow)
// =====================
// FloorRow 1: 좌측 - 약 60석
const floor2Row1 = [
  createSection('가구역', 6, 10), // 6열 × 10~14석 ≈ 60석
];

// FloorRow 2: 중앙 좌 - 약 112석
const floor2Row2 = [
  createSection('나구역', 7, 14), // 7열 × 14~18석 ≈ 112석
];

// FloorRow 3: 중앙 우 - 약 112석
const floor2Row3 = [
  createSection('다구역', 7, 14), // 7열 × 14~18석 ≈ 112석
];

// FloorRow 4: 우측 - 약 60석
const floor2Row4 = [
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '201통로' },
  createSection('라구역', 6, 10), // 6열 × 10~14석 ≈ 60석
];

// =====================
// 3층 발코니 — 약 200석 (3개 FloorRow)
// =====================
// FloorRow 1: 좌측 - 약 48석
const floor3Row1 = [
  createSection('좌구역', 4, 8), // 4열 × 8~12석 ≈ 40석
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '301통로' },
];

// FloorRow 2: 중앙 - 약 96석
const floor3Row2 = [
  createSection('중구역', 5, 16), // 5열 × 16~20석 ≈ 90석
];

// FloorRow 3: 우측 + 특별석 - 약 56석
const floor3Row3 = [
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '302통로' },
  createSection('우구역', 4, 8), // 4열 × 8~12석 ≈ 40석
  { kind: 'aisle' as const, id: aisleIdCnt++, label: '303통로' },
  createSection('특별석', 4, 6), // 4열 × 6~10석 ≈ 32석
];

// =====================
// 층 데이터
// =====================
let floorRowIdCnt = 1;

export const mockFloors: Floor[] = [
  {
    id: 1,
    name: '1층',
    rows: [
      { id: floorRowIdCnt++, items: floor1Row1 },
      { id: floorRowIdCnt++, items: floor1Row2 },
      { id: floorRowIdCnt++, items: floor1Row3 },
      { id: floorRowIdCnt++, items: floor1Row4 },
    ],
  },
  {
    id: 2,
    name: '2층',
    rows: [
      { id: floorRowIdCnt++, items: floor2Row1 },
      { id: floorRowIdCnt++, items: floor2Row2 },
      { id: floorRowIdCnt++, items: floor2Row3 },
      { id: floorRowIdCnt++, items: floor2Row4 },
    ],
  },
  {
    id: 3,
    name: '3층 발코니',
    rows: [
      { id: floorRowIdCnt++, items: floor3Row1 },
      { id: floorRowIdCnt++, items: floor3Row2 },
      { id: floorRowIdCnt++, items: floor3Row3 },
    ],
  },
];
