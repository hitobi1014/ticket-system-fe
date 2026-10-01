import type { MemberWithSeats } from '@/types';

const mockMemberWithSeatsById: Record<number, MemberWithSeats> = {
  1: {
    member: {
      id: 1,
      name: '김민준',
      instrument: { abbr: 'Vn1', name: '1st 바이올린' },
      point: 12,
      allocatedTickets: 2,
      seq: 1,
      rank: 1,
    },
    seats: [
      {
        seatId: 101,
        floorName: '2F',
        sectionName: '나',
        rowName: 'C',
        seatNumber: 14,
        guestName: '김민준',
      },
      {
        seatId: 102,
        floorName: '2F',
        sectionName: '나',
        rowName: 'C',
        seatNumber: 15,
        guestName: '김이나',
      },
    ],
  },
};

export function getMockMemberWithSeats(memberId: number): MemberWithSeats {
  return (
    mockMemberWithSeatsById[memberId] ?? {
      member: {
        id: memberId,
        name: '알 수 없음',
        instrument: { abbr: 'Vn1', name: '1st 바이올린' },
        point: 0,
        allocatedTickets: 0,
        seq: 0,
        rank: 0,
      },
      seats: [],
    }
  );
}
