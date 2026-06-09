import type { Floor, Section, Seat, VenueConfig, Rows } from '@/types';
import { mockMembers } from '@/mocks/members.ts';

// =====================
// 좌석 생성 헬퍼 함수
// =====================

// 회원별 배정 좌석 ID 풀 생성
// ex) member 1 → allocatedTickets: 3 → seatId 0,1,2 배정
function buildMemberSeatMap(): Map<number, number> {
  // seatId -> memberId
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

function createSeats(count: number = 1): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: seatIdCnt,
    seatNumber: i,
    assignedMemberId: memberSeatMap.get(seatIdCnt++) ?? null,
    visible: true,
  }));
}

let rowIdCnt = 0;
function createRows(addRowCount: number = 1): Rows[] {
  const rows: Rows[] = [];

  Array.from({ length: addRowCount }, (_, i) =>
    rows.push({
      id: rowIdCnt++,
      rowName: i.toString(),
      seats: createSeats(5),
    }),
  );
  return rows;
}

function createSection(id: number, name: string): Section {
  return {
    kind: 'section',
    id,
    name,
    rows: createRows(3),
  };
}

// =====================
// 1층 좌석 구조
// =====================
const floor1Sections: Section[] = [
  // 가구역: 회원 1~4 배정
  createSection(1, '가구역'),
  // 나구역: 회원 5~8 배정
  createSection(2, '나구역'),
  // 다구역: 회원 9~10 배정, row 3~4는 빈좌석
  createSection(3, '다구역'),
];

// =====================
// 2층 좌석 구조 (전체 빈좌석)
// =====================
const floor2Sections: Section[] = [
  createSection(4, '가구역'),
  createSection(5, '나구역'),
  createSection(6, '다구역'),
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
      { kind: 'aisle', id: 101, label: '101통로' },
      floor1Sections[1],
      { kind: 'aisle', id: 102, label: '102통로' },
      floor1Sections[2],
    ],
  },
  {
    id: 2,
    name: '2층',
    items: [
      floor2Sections[0],
      { kind: 'aisle', id: 201 },
      floor2Sections[1],
      { kind: 'aisle', id: 202 },
      floor2Sections[2],
    ],
  },
];

// =====================
// 공연장 설정
// =====================
export const mockVenueConfig: VenueConfig = {
  id: 1,
  name: '오케스트라 공연장',
  floors: mockFloors,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
