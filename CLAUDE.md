orchestra-front 개발 지침

### 기술 스택
| 분류 | 기술 |
|------|------|
| UI 프레임워크 | React 19 + TypeScript |
| 번들러 | Vite |
| CSS | Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui (커스터마이징) |
| 상태관리 | Zustand |
| 라우팅 | react-router-dom v7 |
| 토스트 알림 | sonner |
| 아이콘 | @tabler/icons-react, lucide-react |
| Linter | ESLint (typescript-eslint strict) |

---

### 디렉토리 구조
```
src/
├── components/
│   ├── common/        # 공통 컴포넌트 (PageHeader, FunctionButtons 등)
│   ├── dialog/        # 다이얼로그 컴포넌트
│   ├── member/        # 회원 관련 컴포넌트
│   ├── seat/          # 좌석 관련 컴포넌트
│   ├── seat-assign/   # 좌석배정 관련 컴포넌트
│   └── ui/            # shadcn/ui 기반 기본 UI 컴포넌트
├── constant/          # 상수 (env.ts, venue.ts 등)
├── hooks/             # 커스텀 훅
├── lib/               # 유틸리티 (api.ts, utils.ts 등)
├── mocks/             # 목데이터 (개발/테스트용)
├── pages/             # 페이지 컴포넌트
├── store/             # Zustand 스토어
├── types/             # 타입 정의
└── router.tsx         # 라우터 설정
```

---

### 코드 패턴 지침

#### 라우팅
- `react-router-dom`의 `createBrowserRouter` 사용
- `Layout` 컴포넌트로 공통 레이아웃 감싸기
- 라우트 메타 정보(`title`, `icon`)는 `handle` 프로퍼티 활용
- 기본 경로 `/`는 `/members`로 redirect

#### 상태관리 (Zustand)
- 스토어 파일: `src/store/{도메인}Store.ts`
- `create<StoreInterface>()` 형태로 타입 명시
- 스토어 내 API 호출은 `async` 함수로 정의
- `isLoading` 상태로 로딩 관리
- 파생 데이터(getter)는 스토어 내 메서드로 분리

#### API 호출
- `src/lib/api.ts`의 `fetchApi<T>()` 래퍼 사용
- REST 엔드포인트 prefix를 상수로 분리 (예: `const memberURIPrefix = '/members'`)
- 에러 응답 시 `toast.error(e instanceof Error ? e.message : '기본메시지')` 패턴
- 성공 응답 시 `toast.success(...)` 사용
- 204 응답 또는 빈 응답 body는 `undefined as T`로 처리

#### 타입 정의
- 서버 응답 타입과 요청(Request) 타입 분리 (예: `Member` vs `CreateMemberRequest`)
- `src/types/` 하위 도메인별 파일로 분리, `index.ts`에서 barrel export
- 파생 데이터 요약 인터페이스는 별도 정의 (예: `TicketSummary`)

#### 컴포넌트
- 페이지 컴포넌트: `export default function PageName()`
- 공통 컴포넌트: `export default function ComponentName()`
- Props 인터페이스: `interface ComponentNameProps {}` 형태로 export
- shadcn/ui 커스텀: `src/components/ui/` 에서 수정, 직접 shadcn 원본 사용 지양
- 아이콘: `@tabler/icons-react` 우선 사용, `stroke={1.5}` or `stroke={2}` 명시

#### 경로 alias
- `@/` → `src/` (tsconfig paths 기반)
- 임포트 시 상대경로(`../`) 지양, `@/` 사용

#### ESLint 규칙
- `@typescript-eslint/no-unused-vars`: error (단, catch 변수 `_` prefix는 허용)
- `react-refresh/only-export-components`: warn
- TypeScript strict 모드 적용

#### UI/스타일
- Tailwind CSS v4 유틸리티 클래스 우선
- `cn()` 유틸 (`clsx` + `tailwind-merge`)으로 조건부 클래스 처리
- 커스텀 색상 토큰: `bg-surface-secondary`, `text-mist-*` 등 디자인 시스템 토큰 사용
- 스크롤바 숨김: `no-scrollbar` 유틸 클래스 사용
