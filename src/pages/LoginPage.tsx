import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Instrument, type InstrumentAbbr, INSTRUMENTS, type NonValidateMember } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { getMembers, nonValidateMembers, isAuthenticated, login, isLoading } = useAuthStore();

  const [part, setPart] = useState<Instrument>();
  const [filteredMembers, setFilteredMembers] = useState<NonValidateMember[]>([]);
  const [memberId, setMemberId] = useState<number>();
  const [memberCode, setMemberCode] = useState('');

  useEffect(() => {
    if (nonValidateMembers.length === 0) {
      getMembers().catch((e) =>
        toast.error(e instanceof Error ? e.message : '회원 목록을 불러오지 못했습니다.'),
      );
    }
  }, [getMembers, nonValidateMembers]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/members', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (memberId == null || memberCode.trim() === '') {
      toast.error('회원 입력 정보가 잘못됐습니다.');
      return;
    }
    try {
      await login({ memberId, memberCode });
      navigate('/members', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    }
  };

  const handlePartChange = (value: string) => {
    setMemberId(undefined);
    const abbr = value as InstrumentAbbr;
    setPart({ abbr, name: INSTRUMENTS[abbr] });
    const findMembers = nonValidateMembers.filter((member) => member.instrumentAbbr === value);
    if (findMembers.length === 0) {
      toast.error(`해당 파트에 등록된 회원이 없습니다. 데이터 확인이 필요합니다. ${value}`);
      setFilteredMembers([]);
      return;
    }
    setFilteredMembers(findMembers);
  };

  return (
    <div className="bg-surface-primary flex min-h-screen items-center justify-center">
      <div className="bg-surface-secondary flex w-full max-w-sm flex-col gap-y-6 rounded-lg p-8">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-content-primary text-lg font-semibold">Orchestra</h1>
          <p className="text-content-secondary text-sm">로그인</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
          <Field>
            <FieldLabel className="text-content-primary">파트</FieldLabel>
            <Select value={part?.abbr ?? ''} onValueChange={handlePartChange}>
              <SelectTrigger className="bg-surface-primary text-content-primary w-45 border-0">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent className="bg-surface-primary text-content-primary">
                <SelectGroup>
                  {Object.entries(INSTRUMENTS).map(([abbr, name]) => (
                    <SelectItem key={abbr} value={abbr}>
                      <p className="w-8">{abbr}</p>
                      <p>[{name}]</p>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel className="text-content-primary">이름</FieldLabel>
            <Select
              value={memberId != null ? String(memberId) : ''}
              onValueChange={(v) => setMemberId(Number(v))}
            >
              <SelectTrigger className="bg-surface-primary text-content-primary w-45 border-0">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent className="bg-surface-primary text-content-primary">
                <SelectGroup>
                  {filteredMembers.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Input
            type="password"
            className="text-content-primary"
            aria-label="disabled"
            placeholder="비밀번호"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            required
          />
          <Button type="submit" className="mt-1 w-full" disabled={isLoading.login}>
            {isLoading.login ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
