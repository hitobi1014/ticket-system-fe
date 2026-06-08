// =====================
// 회원 데이터 (10명)
// =====================
import { INSTRUMENTS, type Member } from '@/types/member.ts';
import { faker } from '@faker-js/faker/locale/ko';

export const mockMembers: Member[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: faker.person.fullName(),
  instrument: faker.helpers.arrayElement(INSTRUMENTS),
  point: faker.number.int({ min: 5, max: 20 }),
  allocatedTickets: faker.number.int({ min: 0, max: 5 }),
  color: faker.color.rgb({ format: 'hex' }),
}));
