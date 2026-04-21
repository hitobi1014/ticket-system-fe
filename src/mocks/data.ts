import type {Member, Floor, Section, Seat, VenueConfig} from '@/types';

// =====================
// 회원 데이터 (10명)
// =====================
export const mockMembers: Member[] = [
  {id: 1, name: '김철수', allocatedTickets: 5, color: '#FF6B6B'},
  {id: 2, name: '이영희', allocatedTickets: 5, color: '#4ECDC4'},
  {id: 3, name: '박민수', allocatedTickets: 5, color: '#45B7D1'},
  {id: 4, name: '정수진', allocatedTickets: 5, color: '#96CEB4'},
  {id: 5, name: '최동현', allocatedTickets: 5, color: '#FFEAA7'},
  {id: 6, name: '강미영', allocatedTickets: 5, color: '#DDA0DD'},
  {id: 7, name: '윤재호', allocatedTickets: 5, color: '#98D8C8'},
  {id: 8, name: '한소희', allocatedTickets: 5, color: '#F7DC6F'},
  {id: 9, name: '임태준', allocatedTickets: 5, color: '#BB8FCE'},
  {id: 10, name: '서유나', allocatedTickets: 5, color: '#85C1E9'},
];

// =====================
// 좌석 생성 헬퍼 함수
// =====================
let seatIdCounter = 1;

function createSeats(
  cols: number,
  rows: number,
  assignmentMap: Map<number, number> // row -> memberId
): Seat[] {
  const seats: Seat[] = [];
  for (let row = 1; row <= rows; row++) {
    const memberId = assignmentMap.get(row) ?? null;
    for (let col = 1; col <= cols; col++) {
      seats.push({
        id: seatIdCounter++,
        row,
        col,
        assignedMemberId: memberId,
      });
    }
  }
  return seats;
}

function createSection(
  id: number,
  name: string,
  cols: number,
  rows: number,
  assignmentMap: Map<number, number>
): Section {
  return {
    kind: 'section',
    id,
    name,
    cols,
    rows,
    seats: createSeats(cols, rows, assignmentMap),
    visible: true,
  };
}

// =====================
// 1층 좌석 구조
// =====================
const floor1Sections: Section[] = [
  // 가구역: 회원 1~4 배정
  createSection(1, '가구역', 5, 4, new Map([
    [1, 1], [2, 2], [3, 3], [4, 4],
  ])),
  // 나구역: 회원 5~8 배정
  createSection(2, '나구역', 5, 4, new Map([
    [1, 5], [2, 6], [3, 7], [4, 8],
  ])),
  // 다구역: 회원 9~10 배정, row 3~4는 빈좌석
  createSection(3, '다구역', 5, 4, new Map([
    [1, 9], [2, 10],
  ])),
];

// =====================
// 2층 좌석 구조 (전체 빈좌석)
// =====================
const floor2Sections: Section[] = [
  createSection(4, '가구역', 5, 4, new Map()),
  createSection(5, '나구역', 5, 4, new Map()),
  createSection(6, '다구역', 5, 4, new Map()),
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
      {kind: 'aisle', id: 101},
      floor1Sections[1],
      {kind: 'aisle', id: 102},
      floor1Sections[2],
    ],
  },
  {
    id: 2,
    name: '2층',
    items: [
      floor2Sections[0],
      {kind: 'aisle', id: 201},
      floor2Sections[1],
      {kind: 'aisle', id: 202},
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
