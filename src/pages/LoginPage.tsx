import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/members', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ loginId, password });
      navigate('/members', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="bg-surface-secondary rounded-lg p-8 w-full max-w-sm flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-lg font-semibold text-content-primary">Orchestra</h1>
          <p className="text-sm text-content-secondary">관리자 로그인</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
          <Input
            placeholder="아이디"
            aria-label="disabled"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoFocus
            required
          />
          <Input
            type="password"
            aria-label="disabled"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-1" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
