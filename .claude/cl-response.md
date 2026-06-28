# 좌석 안내(찾기) 페이지 구현 가이드

## 요약

비로그인 사용자도 접근 가능한 좌석 안내 페이지 구축을 위한 상세 가이드입니다. 기존 좌석배정 컴포넌트를 재사용하되, 읽기 전용으로 분리하여 구현합니다.

---

## 1. 페이지 구조 설계

### 1.1 라우트 설정 (이미 완료)

**파일:** `src/router.tsx`

```tsx
{
  path: '/seats/view',
  title: '좌석안내',
  Icon: IconSearch,
  element: <SeatViewPage />,
  isPublic: true,  // ← 비로그인 접근 가능
}
```

✅ **현재 상태:** 라우트는 이미 public으로 설정되어 있음
📍 **위치:** `src/router.tsx:39-45`

---

### 1.2 페이지 레이아웃 구조

**파일:** `src/pages/SeatViewPage.tsx` (현재 빈 구현)

```tsx
// 현재 구현
export default function SeatViewPage() {
  return <div>좌석찾기</div>;
}
```

**목표 구조:**

```
SeatViewPage
├── PageHeader (공연장명 + 공연일)
├── 회원 검색바 (Input + IconSearch)
├── Tabs (층별 탭)
│   ├── TabsList (1층, 2층, ...)
│   └── TabsContent (각 층)
│       └── SeatGrid (읽기 전용) ← 새로 생성
│           ├── StageBar
│           ├── 좌석 그리드 (AssignRow 재사용)
│           └── StageBar
```

---

## 2. 컴포넌트 분리 전략

### 2.1 `SeatGrid.tsx` 생성 (읽기 전용)

**목적:** `SeatAssignGrid`에서 편집 관련 기능을 제거하고 순수 뷰 컴포넌트로 추출

**위치:** `src/components/seat/SeatGrid.tsx` (신규 생성)

**현재 `SeatAssignGrid` 구조 분석:**

| 기능 | 편집 모드 전용 | 읽기 모드 필요 | 비고 |
|------|---------------|---------------|------|
| 층 탭 렌더링 | ❌ | ✅ | TabsContent 유지 |
| 일괄편집 토글 | ✅ | ❌ | 제거 |
| 좌석배정 버튼 | ✅ | ❌ | 제거 |
| 선택된 좌석 표시 | ✅ | ❌ | 제거 |
| StageBar | ❌ | ✅ | 유지 |
| AssignRow | ❌ | ✅ | Props 수정 필요 |
| 좌석 클릭 핸들러 | ✅ | ✅ | 동작 변경 (조회용) |

**분리 방식:**

```tsx
// src/components/seat/SeatGrid.tsx
interface SeatGridProps {
  floor: Floor;
  stagePosition: StagePosition;
  onSeatClick?: (seatId: number) => void; // optional, 조회용
}

export default function SeatGrid({
  floor,
  stagePosition,
  onSeatClick,
}: SeatGridProps) {
  return (
    <TabsContent value={String(floor.id)} className="h-screen flex flex-col gap-y-4">
      {/* 일괄편집 UI 제거 */}
      <div className={cn(
        'flex gap-2 flex-1 overflow-hidden',
        stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
      )}>
        {(stagePosition === 'front' || stagePosition === 'left') && (
          <StageBar position={stagePosition} />
        )}
        <div className="flex flex-col gap-y-2 flex-1 no-scrollbar overflow-auto px-2">
          {floor.rows.map((floorRow) => (
            <div key={floorRow.id} className="flex gap-x-4">
              {floorRow.items.map((item) =>
                item.kind === 'aisle' ? (
                  <div key={item.id} className="flex items-center justify-center px-3 self-stretch text-content-primary bg-surface-secondary rounded-md">
                    <div className="w-px h-2/4 bg-surface-accent" />
                  </div>
                ) : (
                  <AssignRow
                    key={item.id}
                    section={item}
                    isBulkEditMode={false} // 항상 false
                    selectedSeatIds={new Set()} // 빈 Set
                    onSeatClick={onSeatClick ?? (() => {})} // 기본 no-op
                  />
                ),
              )}
            </div>
          ))}
        </div>
        {(stagePosition === 'back' || stagePosition === 'right') && (
          <StageBar position={stagePosition} />
        )}
      </div>
    </TabsContent>
  );
}
```

**변경 사항:**
- ✅ `isBulkEditMode`, `setIsBulkEditMode` props 제거
- ✅ `selectedSeatIds`, `setSelectedSeatIds` props 제거
- ✅ `setIsModalOpen` props 제거
- ✅ `onSeatClick`을 optional로 변경 (조회 모드에선 사용 X)
- ✅ 일괄편집 UI (Toggle, Button, 선택 카운트) 제거

---

### 2.2 `AssignRow` 수정 필요 여부

**현재 구현:** `src/components/seat/AssignRow.tsx`

```tsx
interface AssignRowProps {
  section: Section;
  isBulkEditMode: boolean;
  selectedSeatIds?: Set<number>;
  onSeatClick: (seatId: number) => void;
}
```

**분석:**
- `isBulkEditMode`는 UI에서 직접 사용하지 않음 (제거 가능)
- `selectedSeatIds`는 ring 스타일에만 사용 (`ring-2 ring-content-accent`)
- `onSeatClick`은 Button의 onClick에 바인딩

**결론:**
✅ **수정 불필요** - 읽기 전용 모드에서 `isBulkEditMode=false`, `selectedSeatIds={new Set()}`로 호출하면 정상 동작

**좌석 클릭 동작 차이:**

| 모드 | 클릭 이벤트 | 동작 |
|------|-------------|------|
| **배정 모드** | `onSeatClick(seatId)` | 모달 열기 or 선택 토글 |
| **조회 모드** | `onSeatClick(seatId)` | 회원 정보 하이라이트 (검색바 연동) |

---

## 3. 회원 검색 기능 구현

### 3.1 검색 UI 배치

**위치:** PageHeader 바로 아래, Tabs 위

```tsx
// SeatViewPage.tsx 내부
const [searchQuery, setSearchQuery] = useState('');

<div className="px-4 py-3 bg-surface-secondary">
  <div className="relative max-w-md">
    <IconSearch
      className="absolute left-3 top-1/2 -translate-y-1/2 text-content-primary"
      stroke={1.5}
      size={20}
    />
    <Input
      type="text"
      placeholder="회원 이름 또는 악기로 검색"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
</div>
```

**Input 컴포넌트:**
- 위치: `src/components/ui/input.tsx` (shadcn/ui)
- 스타일: Tailwind 기반, `cn()` 유틸로 커스터마이징

---

### 3.2 검색 로직

**방식 1: 클라이언트 필터링 (권장)**

```tsx
import useMemberStore from '@/store/memberStore';

const { members } = useMemberStore();
const [searchQuery, setSearchQuery] = useState('');

// 검색 쿼리에 따라 회원 필터링
const filteredMembers = members.filter((member) => {
  const query = searchQuery.toLowerCase();
  return (
    member.name.toLowerCase().includes(query) ||
    member.instrument.name.toLowerCase().includes(query) ||
    member.instrument.abbr.toLowerCase().includes(query)
  );
});
```

**방식 2: 좌석 하이라이트 (선택적)**

검색된 회원이 배정된 좌석을 시각적으로 강조:

```tsx
const [highlightedMemberIds, setHighlightedMemberIds] = useState<Set<number>>(new Set());

useEffect(() => {
  if (searchQuery.trim() === '') {
    setHighlightedMemberIds(new Set());
  } else {
    const ids = new Set(filteredMembers.map(m => m.id));
    setHighlightedMemberIds(ids);
  }
}, [searchQuery, filteredMembers]);

// AssignRow에 전달
<AssignRow
  section={item}
  isBulkEditMode={false}
  selectedSeatIds={new Set()}
  highlightedMemberIds={highlightedMemberIds} // ← 새 prop 추가
  onSeatClick={(seatId) => {
    // 좌석의 회원 정보 표시
    const seat = findSeatById(seatId);
    if (seat?.assignedMemberId) {
      setSearchQuery(members.find(m => m.id === seat.assignedMemberId)?.name ?? '');
    }
  }}
/>
```

**AssignRow 수정 (선택적):**

```tsx
// 좌석 버튼에 하이라이트 스타일 추가
className={clsx(
  'w-10 h-10 bg-surface-primary text-content-primary border-0 text-sm',
  {
    'ring-2 ring-content-accent ring-offset-1': selectedSeatIds.has(seat.id),
    'ring-2 ring-yellow-400 ring-offset-2': highlightedMemberIds?.has(seat.assignedMemberId ?? -1),
  },
)}
```

---

### 3.3 검색 결과 표시 (옵션)

검색창 아래 매칭된 회원 목록 표시:

```tsx
{searchQuery && filteredMembers.length > 0 && (
  <div className="px-4 py-2 bg-surface-primary">
    <p className="text-sm text-content-primary mb-2">
      검색 결과: {filteredMembers.length}명
    </p>
    <div className="flex flex-wrap gap-2">
      {filteredMembers.map((member) => (
        <button
          key={member.id}
          className="px-3 py-1 rounded-md text-sm"
          style={{
            backgroundColor: member.color ?? '#f0fdfa',
            color: getContrastTextColor(member.color ?? '#f0fdfa'),
          }}
          onClick={() => {
            // 해당 회원의 좌석으로 스크롤
            const firstSeat = findFirstSeatByMemberId(member.id);
            if (firstSeat) {
              document.getElementById(`seat-${firstSeat.id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }}
        >
          {member.instrument.abbr} {member.name}
        </button>
      ))}
    </div>
  </div>
)}
```

---

## 4. 데이터 로딩 전략

### 4.1 공연장 정보 (Venue)

**Store:** `src/store/venueStore.ts`

```tsx
import useVenueStore from '@/store/venueStore';

const { venue, fetchVenue } = useVenueStore();

useEffect(() => {
  fetchVenue();
}, []);
```

**필요 데이터:**
- `venue.name` - 공연장명
- `venue.performanceDate` - 공연일
- `venue.stagePosition` - 무대 위치 ('front' | 'back' | 'left' | 'right')

---

### 4.2 층 정보 (Floor)

**Store:** `src/store/floorStore.ts`

```tsx
import useFloorStore from '@/store/floorStore';

const { floors, fetchFloor } = useFloorStore();

useEffect(() => {
  fetchFloor();
}, []);
```

**데이터 구조:**
```
floors: Floor[]
└── Floor
    ├── id, name
    └── rows: FloorRow[]
        └── items: (Section | Aisle)[]
            └── Section
                └── rows: Row[]
                    └── seats: Seat[]
                        ├── id, seatNumber
                        ├── assignedMemberId
                        └── visible
```

---

### 4.3 회원 정보 (Member)

**Store:** `src/store/memberStore.ts`

```tsx
import useMemberStore from '@/store/memberStore';

const { members, fetchMembers } = useMemberStore();

useEffect(() => {
  fetchMembers();
}, []);
```

**필요 데이터:**
- `member.name` - 회원 이름
- `member.instrument.abbr` - 악기 약어 (Vn, Va, ...)
- `member.color` - 좌석 배경색 (hex)

---

### 4.4 비로그인 상태에서의 데이터 접근

**현재 API 설정:** `src/lib/api.ts`

```tsx
const token = localStorage.getItem('token');
if (token) {
  headers.Authorization = `Bearer ${token}`;
}

// 401 응답 시 자동 리다이렉트
if (res.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

**문제점:**
❌ 비로그인 상태에서 API 호출 시 401 에러 → `/login`으로 강제 리다이렉트

**해결 방안:**

**옵션 1: API 엔드포인트 분리 (백엔드 수정 필요)**
```
GET /public/venue/first      (인증 불필요)
GET /public/floors           (인증 불필요)
GET /public/members          (인증 불필요)
```

**옵션 2: 401 에러 핸들링 수정**
```tsx
// api.ts 수정
if (res.status === 401) {
  // 공개 페이지에서는 리다이렉트 하지 않음
  if (window.location.pathname === '/seats/view') {
    throw new Error('인증이 필요합니다');
  }
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

**옵션 3: 토스트 메시지 표시 (권장)**
```tsx
// SeatViewPage.tsx
useEffect(() => {
  const loadData = async () => {
    try {
      await Promise.all([
        fetchVenue(),
        fetchFloor(),
        fetchMembers(),
      ]);
    } catch (error) {
      toast.error('좌석 정보를 불러올 수 없습니다. 관리자에게 문의하세요.');
    }
  };
  loadData();
}, []);
```

**⚠️ 중요:** 백엔드에서 `/seats/view` 관련 엔드포인트를 public으로 허용해야 함

---

## 5. PageHeader 설정

### 5.1 현재 구현

**파일:** `src/components/common/PageHeader.tsx`

```tsx
interface PageHeaderProps {
  title: string;
  icon: React.ReactNode;
}

export default function PageHeader({ title, icon }: PageHeaderProps) {
  const { logout } = useAuthStore();
  return (
    <div className="flex justify-between bg-surface-secondary border-b border-surface-accent py-2.5 px-4">
      <div className="flex items-center gap-x-2">
        <div className="text-content-primary">{icon}</div>
        <h2 className="text-content-primary text-lg font-medium">{title}</h2>
      </div>
      <div className="flex items-center gap-x-2 text-content-primary cursor-pointer" onClick={logout}>
        <IconLogout stroke={2} />
        로그아웃
      </div>
    </div>
  );
}
```

**문제점:**
❌ 로그아웃 버튼이 항상 표시됨 (비로그인 사용자에게 불필요)

---

### 5.2 수정 방안

**옵션 1: PageHeader 수정 (조건부 렌더링)**

```tsx
import useAuthStore from '@/store/authStore';

export default function PageHeader({ title, icon }: PageHeaderProps) {
  const { logout, isAuthenticated } = useAuthStore();

  return (
    <div className="flex justify-between bg-surface-secondary border-b border-surface-accent py-2.5 px-4">
      <div className="flex items-center gap-x-2">
        <div className="text-content-primary">{icon}</div>
        <h2 className="text-content-primary text-lg font-medium">{title}</h2>
      </div>
      {isAuthenticated && ( // ← 로그인 상태에서만 표시
        <div className="flex items-center gap-x-2 text-content-primary cursor-pointer" onClick={logout}>
          <IconLogout stroke={2} />
          로그아웃
        </div>
      )}
    </div>
  );
}
```

**옵션 2: 별도 PublicPageHeader 생성**

```tsx
// src/components/common/PublicPageHeader.tsx
interface PublicPageHeaderProps {
  title: string;
  subtitle?: string; // 공연일 표시
  icon: React.ReactNode;
}

export default function PublicPageHeader({ title, subtitle, icon }: PublicPageHeaderProps) {
  return (
    <div className="bg-surface-secondary border-b border-surface-accent py-2.5 px-4">
      <div className="flex items-center gap-x-2">
        <div className="text-content-primary">{icon}</div>
        <div>
          <h2 className="text-content-primary text-lg font-medium">{title}</h2>
          {subtitle && (
            <p className="text-content-primary text-sm opacity-70">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

**사용 예시:**
```tsx
// SeatViewPage.tsx
<PublicPageHeader
  title={venue?.name ?? '공연장'}
  subtitle={venue?.performanceDate ? new Date(venue.performanceDate).toLocaleDateString() : undefined}
  icon={<IconSearch stroke={1.5} />}
/>
```

---

### 5.3 공연일 포맷팅

**유틸 함수 생성:** `src/lib/dateUtils.ts`

```tsx
export function formatPerformanceDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date);
}

// 사용 예: "2024년 6월 28일 금요일"
```

---

## 6. 좌석 클릭 동작 설계

### 6.1 조회 모드 좌석 클릭 시나리오

**목적:** 특정 좌석을 클릭하면 해당 회원 정보를 강조

**구현 방법:**

```tsx
const handleSeatClick = (seatId: number) => {
  // 1. 좌석 정보 찾기
  const seatInfo = findSeatById(seatId);
  if (!seatInfo || !seatInfo.assignedMemberId) {
    toast.info('배정되지 않은 좌석입니다');
    return;
  }

  // 2. 회원 정보 찾기
  const member = members.find(m => m.id === seatInfo.assignedMemberId);
  if (!member) return;

  // 3. 검색창에 회원 이름 표시
  setSearchQuery(member.name);

  // 4. 토스트로 정보 표시
  toast.info(
    `${member.instrument.abbr} ${member.name} - ${seatInfo.sectionName} ${seatInfo.rowName} ${seatInfo.seatNumber}`,
    { duration: 3000 }
  );
};
```

**유틸 함수:** `findSeatById`

```tsx
function findSeatById(seatId: number) {
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind === 'section') {
          for (const row of item.rows) {
            const seat = row.seats.find(s => s.id === seatId);
            if (seat) {
              return {
                ...seat,
                floorName: floor.name,
                sectionName: item.name,
                rowName: row.rowName,
              };
            }
          }
        }
      }
    }
  }
  return null;
}
```

---

### 6.2 좌석 클릭 불가 처리 (선택적)

조회 전용 페이지에서 좌석 클릭을 완전히 비활성화하려면:

```tsx
// AssignRow.tsx 수정
<Button
  disabled={readOnly} // ← 새 prop 추가
  onClick={!readOnly ? () => onSeatClick(seat.id) : undefined}
  className={clsx(
    'w-10 h-10 text-sm',
    readOnly && 'cursor-default' // ← 포인터 스타일 제거
  )}
>
  {/* ... */}
</Button>
```

**SeatGrid에서 전달:**
```tsx
<AssignRow
  section={item}
  isBulkEditMode={false}
  selectedSeatIds={new Set()}
  onSeatClick={() => {}}
  readOnly={true} // ← 읽기 전용 모드
/>
```

---

## 7. 스타일링 가이드

### 7.1 Tailwind CSS 커스텀 토큰

**사용 가능한 색상 토큰:**
- `bg-surface-primary` - 기본 배경 (좌석 버튼)
- `bg-surface-secondary` - 보조 배경 (섹션 카드, 헤더)
- `bg-surface-accent` - 강조 배경 (Aisle 구분선)
- `text-content-primary` - 기본 텍스트
- `text-content-danger` - 경고 텍스트 (hover 시)

**좌석 색상 우선순위:**
1. 배정된 회원의 `member.color` (hex)
2. 기본값: `#f0fdfa` (연한 청록색)

---

### 7.2 반응형 레이아웃

**무대 위치에 따른 flex 방향:**

| stagePosition | flex-direction | StageBar 위치 |
|---------------|----------------|--------------|
| `front` | `flex-col` | 상단 |
| `back` | `flex-col` | 하단 |
| `left` | `flex-row` | 좌측 |
| `right` | `flex-row` | 우측 |

**구현 코드:**
```tsx
<div className={cn(
  'flex gap-2 flex-1 overflow-hidden',
  stagePosition === 'left' || stagePosition === 'right' ? 'flex-row' : 'flex-col',
)}>
  {(stagePosition === 'front' || stagePosition === 'left') && <StageBar position={stagePosition} />}
  {/* 좌석 그리드 */}
  {(stagePosition === 'back' || stagePosition === 'right') && <StageBar position={stagePosition} />}
</div>
```

---

### 7.3 스크롤 처리

**좌석 그리드 스크롤:**
```tsx
<div className="flex flex-col gap-y-2 flex-1 no-scrollbar overflow-auto px-2">
  {/* 좌석 행 렌더링 */}
</div>
```

- `overflow-auto` - 자동 스크롤
- `no-scrollbar` - 스크롤바 숨김 (Tailwind 유틸)
- `flex-1` - 남은 공간 채우기

---

## 8. 접근성 (Accessibility) 개선

### 8.1 키보드 네비게이션

**검색 입력창:**
```tsx
<Input
  type="text"
  placeholder="회원 이름 또는 악기로 검색"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && filteredMembers.length > 0) {
      // 첫 번째 검색 결과 좌석으로 이동
      const firstSeat = findFirstSeatByMemberId(filteredMembers[0].id);
      if (firstSeat) {
        document.getElementById(`seat-${firstSeat.id}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }}
  aria-label="회원 검색"
  autoFocus
/>
```

---

### 8.2 스크린 리더 지원

**좌석 버튼 aria-label:**
```tsx
<Button
  aria-label={`${section.name} ${row.rowName} ${seat.seatNumber}번 좌석, ${
    seat.assignedMemberId
      ? `${assignedSeatMemberName(seat.assignedMemberId)}님 배정`
      : '미배정'
  }`}
>
  {/* ... */}
</Button>
```

---

## 9. 에러 처리 및 로딩 상태

### 9.1 로딩 스피너

```tsx
import useVenueStore from '@/store/venueStore';
import useFloorStore from '@/store/floorStore';
import useMemberStore from '@/store/memberStore';

export default function SeatViewPage() {
  const { venue, isLoading: venueLoading } = useVenueStore();
  const { floors, isLoading: floorsLoading } = useFloorStore();
  const { members, isLoading: membersLoading } = useMemberStore();

  const isLoading = venueLoading || floorsLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-content-primary" />
      </div>
    );
  }

  return (
    {/* 메인 UI */}
  );
}
```

---

### 9.2 빈 데이터 처리

```tsx
{floors.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-screen gap-4">
    <IconArmchair2 className="text-content-primary opacity-30" size={64} stroke={1.5} />
    <p className="text-content-primary text-lg">좌석 정보가 없습니다</p>
  </div>
) : (
  {/* Tabs UI */}
)}
```

---

## 10. 구현 체크리스트

### Phase 1: 기본 구조
- [ ] `SeatGrid.tsx` 컴포넌트 생성 (읽기 전용)
  - [ ] `SeatAssignGrid`에서 편집 UI 제거
  - [ ] Props 타입 정의 (`onSeatClick` optional)
  - [ ] `AssignRow` 재사용 (`isBulkEditMode=false`)
  - [ ] `StageBar` 배치 로직 복사

### Phase 2: SeatViewPage 구현
- [ ] `SeatViewPage.tsx` 기본 레이아웃
  - [ ] PageHeader (공연장명 + 공연일)
  - [ ] Tabs (층별 탭)
  - [ ] SeatGrid 렌더링
- [ ] 데이터 로딩
  - [ ] `useVenueStore` 연동
  - [ ] `useFloorStore` 연동
  - [ ] `useMemberStore` 연동
  - [ ] 로딩 스피너 추가

### Phase 3: 회원 검색 기능
- [ ] 검색 UI 구현
  - [ ] Input + IconSearch
  - [ ] 검색어 상태 관리 (`useState`)
- [ ] 검색 로직
  - [ ] 회원 필터링 (이름/악기)
  - [ ] 검색 결과 표시
- [ ] 검색 결과 하이라이트 (선택적)
  - [ ] 좌석 ring 스타일 추가
  - [ ] 스크롤 이동 기능

### Phase 4: 좌석 클릭 동작
- [ ] `findSeatById` 유틸 함수 작성
- [ ] `handleSeatClick` 구현
  - [ ] 회원 정보 토스트 표시
  - [ ] 검색창 자동 채우기
- [ ] 좌석 클릭 비활성화 옵션 (선택적)

### Phase 5: 스타일링 & 접근성
- [ ] Tailwind 커스텀 토큰 적용
- [ ] 반응형 레이아웃 검증
- [ ] aria-label 추가
- [ ] 키보드 네비게이션 구현

### Phase 6: 에러 처리
- [ ] 401 에러 핸들링 (api.ts 수정)
- [ ] 빈 데이터 UI
- [ ] 토스트 메시지 추가

### Phase 7: 백엔드 연동 (필요 시)
- [ ] Public API 엔드포인트 확인
  - [ ] `GET /public/venue/first`
  - [ ] `GET /public/floors`
  - [ ] `GET /public/members`
- [ ] CORS 설정 확인

---

## 11. 주요 파일 경로 참조

| 파일 | 경로 | 역할 |
|------|------|------|
| `SeatViewPage.tsx` | `src/pages/SeatViewPage.tsx` | 좌석 안내 페이지 메인 |
| `SeatGrid.tsx` | `src/components/seat/SeatGrid.tsx` | 읽기 전용 좌석 그리드 (신규) |
| `SeatAssignGrid.tsx` | `src/components/seat-assign/SeatAssignGrid.tsx` | 편집 가능 좌석 그리드 (기존) |
| `AssignRow.tsx` | `src/components/seat/AssignRow.tsx` | 좌석 행 컴포넌트 |
| `StageBar.tsx` | `src/components/seat-assign/StageBar.tsx` | 무대 표시 바 |
| `PageHeader.tsx` | `src/components/common/PageHeader.tsx` | 페이지 헤더 |
| `input.tsx` | `src/components/ui/input.tsx` | shadcn Input 컴포넌트 |
| `venueStore.ts` | `src/store/venueStore.ts` | 공연장 정보 스토어 |
| `floorStore.ts` | `src/store/floorStore.ts` | 층/좌석 정보 스토어 |
| `memberStore.ts` | `src/store/memberStore.ts` | 회원 정보 스토어 |
| `api.ts` | `src/lib/api.ts` | API 호출 래퍼 |
| `uiUtils.ts` | `src/lib/uiUtils.ts` | UI 유틸 (getContrastTextColor) |

---

## 12. 참고 코드 스니펫

### 12.1 완전한 SeatViewPage 예시

```tsx
import { useEffect, useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { toast } from 'sonner';
import useVenueStore from '@/store/venueStore';
import useFloorStore from '@/store/floorStore';
import useMemberStore from '@/store/memberStore';
import PageHeader from '@/components/common/PageHeader';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SeatGrid from '@/components/seat/SeatGrid';

export default function SeatViewPage() {
  const { venue, fetchVenue, isLoading: venueLoading } = useVenueStore();
  const { floors, fetchFloor, isLoading: floorsLoading } = useFloorStore();
  const { members, fetchMembers, isLoading: membersLoading } = useMemberStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  const isLoading = venueLoading || floorsLoading || membersLoading;

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchVenue(), fetchFloor(), fetchMembers()]);
      } catch (error) {
        toast.error('좌석 정보를 불러올 수 없습니다');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (floors.length > 0 && selectedFloorId === null) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.instrument.name.toLowerCase().includes(query) ||
      member.instrument.abbr.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-content-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title={venue?.name ?? '좌석 안내'}
        icon={<IconSearch stroke={1.5} />}
      />

      {/* 검색바 */}
      <div className="px-4 py-3 bg-surface-secondary">
        <div className="relative max-w-md">
          <IconSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-content-primary"
            stroke={1.5}
            size={20}
          />
          <Input
            type="text"
            placeholder="회원 이름 또는 악기로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        {searchQuery && filteredMembers.length > 0 && (
          <p className="text-sm text-content-primary mt-2">
            검색 결과: {filteredMembers.length}명
          </p>
        )}
      </div>

      {/* 좌석 그리드 */}
      {floors.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-content-primary text-lg">좌석 정보가 없습니다</p>
        </div>
      ) : (
        <Tabs
          className="flex flex-col flex-1 overflow-hidden px-4"
          value={String(selectedFloorId)}
          onValueChange={(v) => setSelectedFloorId(Number(v))}
        >
          <TabsList className="bg-transparent flex gap-x-2">
            {floors.map((floor) => (
              <TabsTrigger
                key={floor.id}
                value={String(floor.id)}
                className="cursor-pointer text-content-primary text-base"
              >
                {floor.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {floors.map((floor) => (
            <SeatGrid
              key={floor.id}
              floor={floor}
              stagePosition={venue?.stagePosition ?? 'front'}
            />
          ))}
        </Tabs>
      )}
    </div>
  );
}
```

---

### 12.2 findSeatById 유틸 함수

```tsx
// src/lib/seatUtils.ts
import type { Floor } from '@/types';

interface SeatDetail {
  id: number;
  seatNumber: string;
  assignedMemberId: number | null;
  floorName: string;
  sectionName: string;
  rowName: string;
}

export function findSeatById(floors: Floor[], seatId: number): SeatDetail | null {
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind === 'section') {
          for (const row of item.rows) {
            const seat = row.seats.find((s) => s.id === seatId);
            if (seat) {
              return {
                ...seat,
                floorName: floor.name,
                sectionName: item.name,
                rowName: row.rowName,
              };
            }
          }
        }
      }
    }
  }
  return null;
}

export function findFirstSeatByMemberId(floors: Floor[], memberId: number): SeatDetail | null {
  for (const floor of floors) {
    for (const floorRow of floor.rows) {
      for (const item of floorRow.items) {
        if (item.kind === 'section') {
          for (const row of item.rows) {
            const seat = row.seats.find((s) => s.assignedMemberId === memberId);
            if (seat) {
              return {
                ...seat,
                floorName: floor.name,
                sectionName: item.name,
                rowName: row.rowName,
              };
            }
          }
        }
      }
    }
  }
  return null;
}
```

---

## 13. 추가 고려사항

### 13.1 성능 최적화

**문제:** 대규모 좌석 데이터 렌더링 시 성능 저하

**해결:**
1. **가상 스크롤링** (react-window)
2. **메모이제이션** (React.memo, useMemo)
   ```tsx
   const SeatGridMemo = React.memo(SeatGrid);
   const AssignRowMemo = React.memo(AssignRow);
   ```

---

### 13.2 모바일 대응

**터치 이벤트 고려:**
```tsx
<Button
  onTouchStart={(e) => e.preventDefault()} // 터치 딜레이 제거
  onClick={() => onSeatClick(seat.id)}
>
  {/* ... */}
</Button>
```

**반응형 검색바:**
```tsx
<div className="relative max-w-md w-full md:w-96">
  <Input className="text-base md:text-sm" />
</div>
```

---

### 13.3 프린트 스타일

```css
/* src/index.css */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

```tsx
// 검색바, 헤더 프린트 시 숨김
<div className="no-print">
  <PageHeader ... />
  <div className="px-4 py-3">
    <Input ... />
  </div>
</div>
```

---

## 14. 테스트 시나리오

### 14.1 기능 테스트

| 시나리오 | 예상 결과 |
|---------|----------|
| 비로그인 상태에서 `/seats/view` 접근 | 페이지 정상 로드 (리다이렉트 X) |
| 공연장 정보 표시 | 헤더에 `venue.name` 표시 |
| 층 탭 클릭 | 해당 층 좌석 그리드 표시 |
| 회원 이름 검색 | 매칭된 회원의 좌석 하이라이트 |
| 좌석 클릭 (배정됨) | 회원 정보 토스트 표시 |
| 좌석 클릭 (미배정) | "미배정 좌석" 메시지 |
| 빈 데이터 상태 | "좌석 정보가 없습니다" 표시 |

---

### 14.2 UI/UX 테스트

| 항목 | 체크 사항 |
|------|----------|
| 무대 위치 반영 | `front/back/left/right` 각각 정상 렌더링 |
| 좌석 색상 | `member.color`가 버튼 배경에 적용 |
| 텍스트 대비 | `getContrastTextColor` 작동 확인 |
| 스크롤 | 대량 좌석 데이터에서 스크롤 부드러움 |
| 반응형 | 모바일/태블릿에서 레이아웃 깨지지 않음 |

---

## 15. 구현 우선순위 (권장)

### 우선순위 1 (필수)
1. `SeatGrid.tsx` 컴포넌트 생성
2. `SeatViewPage.tsx` 기본 레이아웃 (헤더 + 탭 + 그리드)
3. 데이터 로딩 (venue, floors, members)
4. 읽기 전용 좌석 그리드 렌더링

### 우선순위 2 (중요)
5. 회원 검색 기능 (Input + 필터링)
6. PageHeader 로그아웃 버튼 조건부 렌더링
7. 로딩/에러 상태 처리

### 우선순위 3 (선택)
8. 좌석 클릭 시 회원 정보 표시
9. 검색 결과 하이라이트
10. 접근성 개선 (aria-label, 키보드 네비게이션)

### 우선순위 4 (부가)
11. 성능 최적화 (메모이제이션)
12. 모바일 최적화
13. 프린트 스타일

---

## 16. 예상 이슈 및 해결책

### 이슈 1: 비로그인 상태에서 API 401 에러

**원인:** `api.ts`의 401 핸들러가 `/login`으로 강제 리다이렉트

**해결:**
```tsx
// api.ts 수정
if (res.status === 401) {
  const publicPaths = ['/seats/view'];
  if (!publicPaths.some(path => window.location.pathname.startsWith(path))) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else {
    throw new Error('인증이 필요한 데이터입니다');
  }
}
```

---

### 이슈 2: 검색 결과 없을 때 빈 화면

**원인:** 검색어 입력 시 모든 좌석이 숨겨짐

**해결:**
```tsx
{searchQuery && filteredMembers.length === 0 && (
  <div className="px-4 py-2 text-content-primary">
    "{searchQuery}"에 대한 검색 결과가 없습니다
  </div>
)}
```

---

### 이슈 3: 층 탭이 초기화되지 않음

**원인:** `selectedFloorId` 초기값이 `null`

**해결:**
```tsx
useEffect(() => {
  if (floors.length > 0 && !selectedFloorId) {
    setSelectedFloorId(floors[0].id);
  }
}, [floors]);
```

---

## 17. 추가 개선 아이디어

### 17.1 QR 코드 생성

각 좌석마다 QR 코드 생성 → 모바일로 스캔 시 `/seats/view?seat={seatId}` 자동 이동

```tsx
import QRCode from 'qrcode.react';

<QRCode
  value={`${window.location.origin}/seats/view?seat=${seat.id}`}
  size={64}
/>
```

---

### 17.2 좌석 범례 (Legend)

색상별 회원 정보 요약 표시

```tsx
<div className="flex flex-wrap gap-2 px-4 py-2 bg-surface-secondary">
  {members.map(member => (
    <div
      key={member.id}
      className="flex items-center gap-x-2 px-2 py-1 rounded-md text-sm"
      style={{ backgroundColor: member.color ?? '#f0fdfa' }}
    >
      <span>{member.instrument.abbr}</span>
      <span>{member.name}</span>
    </div>
  ))}
</div>
```

---

### 17.3 좌석 통계

배정/미배정 좌석 수 표시

```tsx
const totalSeats = floors.flatMap(f =>
  f.rows.flatMap(r =>
    r.items.filter(i => i.kind === 'section').flatMap(s => s.rows.flatMap(r => r.seats))
  )
).length;

const assignedSeats = floors.flatMap(f =>
  f.rows.flatMap(r =>
    r.items.filter(i => i.kind === 'section').flatMap(s =>
      s.rows.flatMap(r => r.seats.filter(seat => seat.assignedMemberId))
    )
  )
).length;

<div className="px-4 py-2 bg-surface-secondary">
  <p>배정: {assignedSeats} / 전체: {totalSeats}</p>
</div>
```

---

## 18. 최종 체크리스트

### 코드 품질
- [ ] ESLint 오류 없음
- [ ] TypeScript 타입 에러 없음
- [ ] 사용하지 않는 import 제거
- [ ] 콘솔 에러/경고 없음

### UI/UX
- [ ] 모든 층 탭에서 좌석 그리드 정상 표시
- [ ] 무대 위치 4가지 모두 테스트
- [ ] 검색 기능 동작 확인
- [ ] 로딩 스피너 표시
- [ ] 빈 데이터 상태 처리

### 접근성
- [ ] 키보드로 탭 이동 가능
- [ ] 검색창 Enter 키 동작
- [ ] aria-label 추가

### 성능
- [ ] 500+ 좌석 렌더링 시 지연 없음
- [ ] 검색 필터링 즉시 반영

### 보안
- [ ] 비로그인 상태 데이터 접근 확인
- [ ] XSS 취약점 없음 (사용자 입력 이스케이프)

---

## 19. 참고 자료

### 관련 파일 위치

| 컴포넌트 | 파일 경로 |
|---------|---------|
| 좌석배정 페이지 | `src/pages/SeatAssignPage.tsx` |
| 좌석배정 그리드 | `src/components/seat-assign/SeatAssignGrid.tsx` |
| 좌석 행 | `src/components/seat/AssignRow.tsx` |
| 무대 바 | `src/components/seat-assign/StageBar.tsx` |
| 페이지 헤더 | `src/components/common/PageHeader.tsx` |

### 유틸리티

| 함수 | 파일 | 용도 |
|------|------|------|
| `getContrastTextColor` | `src/lib/uiUtils.ts` | 배경색 기반 텍스트 색상 계산 |
| `cn` | `src/lib/utils.ts` | Tailwind 클래스 병합 |
| `fetchApi` | `src/lib/api.ts` | API 호출 래퍼 |

### 타입 정의

| 타입 | 파일 | 설명 |
|------|------|------|
| `Floor` | `src/types/seat.ts` | 층 구조 |
| `Section` | `src/types/seat.ts` | 구역 구조 |
| `Seat` | `src/types/seat.ts` | 좌석 구조 |
| `Member` | `src/types/member.ts` | 회원 구조 |
| `Venue` | `src/types/venue.ts` | 공연장 구조 |
| `StagePosition` | `src/types/venue.ts` | 무대 위치 ('front' | 'back' | 'left' | 'right') |

---

## 20. 완료 후 확인사항

### 기능 확인
- [ ] `/seats/view` URL 직접 접근 가능
- [ ] 비로그인 상태에서 페이지 로드 성공
- [ ] 공연장명, 공연일 헤더에 표시
- [ ] 층 탭 전환 시 좌석 그리드 변경
- [ ] 회원 검색 시 결과 필터링
- [ ] 좌석 색상 회원별로 다르게 표시

### 배포 전 체크
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 빌드 경고 없음
- [ ] 번들 크기 확인
- [ ] 백엔드 API 엔드포인트 public 설정 확인

---

## 요약

이 문서는 **좌석 안내(찾기) 페이지** 구축을 위한 완전한 가이드입니다.

**핵심 작업:**
1. `SeatGrid.tsx` 읽기 전용 컴포넌트 생성 (`SeatAssignGrid`에서 분리)
2. `SeatViewPage.tsx` 구현 (헤더 + 검색 + 탭 + 그리드)
3. 회원 검색 기능 추가 (이름/악기 필터링)
4. 비로그인 접근 허용 (API 401 핸들링 수정)

**기술 스택:**
- React 19 + TypeScript
- Zustand (상태관리)
- Tailwind CSS v4
- shadcn/ui
- react-router-dom v7

**참고 코드:**
- 좌석배정 페이지: `src/pages/SeatAssignPage.tsx:1-95`
- 좌석 그리드: `src/components/seat-assign/SeatAssignGrid.tsx:1-113`
- 좌석 행: `src/components/seat/AssignRow.tsx:1-74`
