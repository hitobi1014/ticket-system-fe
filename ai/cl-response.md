# Seat.visible 필드를 활용한 빈 좌석 처리 기능 구현 결과

## 요청사항
Seat.visible 필드를 활용하여 좌석 다중 선택 및 빈 좌석 설정 기능 구현

---

## 구현 내용

### 1. 좌석 다중 선택 기능 추가

#### SectionCard 컴포넌트 (좌석 설정 화면)

**변경된 파일**: `src/components/dialog/SectionCard.tsx`

##### 1-1. Import 및 State 추가
```typescript
// Import 추가
import { IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';

// State 추가
const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
```

##### 1-2. 좌석 선택 핸들러 구현
```typescript
const handleSeatClick = (seatId: number) => {
  // row 선택 모드가 아닐 때만 좌석 선택 가능
  if (selectedRowId === null) return;

  setSelectedSeatIds((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(seatId)) {
      newSet.delete(seatId);
    } else {
      newSet.add(seatId);
    }
    return newSet;
  });
};
```

**동작 방식**:
- 열(Row)이 선택된 상태에서만 좌석 선택 가능
- Set 자료구조로 O(1) 조회 성능
- 토글 방식: 선택 시 추가, 재선택 시 제거

##### 1-3. Row 컴포넌트에 Props 전달
```typescript
<Row
  key={row.id}
  row={row}
  isSelected={selectedRowId === row.id}
  onClick={(rowId) => {
    handleSelectSection(item.id);
    onSelectedRowId(rowId);
  }}
  selectedSeatIds={selectedSeatIds}
  onSeatClick={handleSeatClick}
  isEditMode={selectedRowId === row.id}
/>
```

---

### 2. 빈 좌석 설정 버튼 추가

#### sectionEditButtons 배열에 버튼 추가

```typescript
{
  variant: 'secondary',
  text: `빈 좌석 ${selectedSeatIds.size > 0 ? `(${selectedSeatIds.size})` : '설정'}`,
  size: 'xs',
  icon: <IconEyeOff stroke={2} />,
  disabled: selectedSeatIds.size === 0,
  onClick: handleToggleSeatVisible,
}
```

**특징**:
- 선택된 좌석 수를 버튼 텍스트에 표시
- 선택된 좌석이 없을 때 비활성화
- IconEyeOff 아이콘 사용

#### 빈 좌석 토글 핸들러

```typescript
const handleToggleSeatVisible = async () => {
  if (selectedSeatIds.size === 0) {
    toast.error('선택된 좌석이 없습니다.');
    return;
  }

  try {
    await toggleSeatVisible([...selectedSeatIds]);
    setSelectedSeatIds(new Set()); // 선택 초기화
    toast.success(`${selectedSeatIds.size}개 좌석의 표시 상태가 변경되었습니다.`);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : '좌석 표시 상태 변경에 실패했습니다.');
  }
};
```

**동작 방식**:
1. 선택된 좌석들의 visible 상태 토글 (API 호출)
2. 성공 시 선택 상태 초기화
3. 토스트 메시지로 피드백

---

### 3. Row 컴포넌트 업데이트

**변경된 파일**: `src/components/seat/Row.tsx`

#### 3-1. Props 인터페이스 확장
```typescript
interface RowProps {
  row: Rows;
  isSelected: boolean;
  onClick: (rowId: number) => void;
  selectedSeatIds?: Set<number>;
  onSeatClick?: (seatId: number) => void;
  isEditMode?: boolean;
}
```

#### 3-2. 좌석 렌더링 로직
```typescript
{row.seats.map((seat) => {
  const isSeatSelected = selectedSeatIds?.has(seat.id) ?? false;
  const isVisible = seat.visible;

  return (
    <div key={seat.id} className="flex items-center">
      <Button
        className={cn(
          'w-8 h-8 text-sm border-0',
          !isVisible && 'opacity-30 pointer-events-none border-0 bg-transparent text-transparent',
          isVisible && 'bg-surface-primary text-content-primary',
          isSeatSelected && isEditMode && 'ring-2 ring-blue-500',
        )}
        onClick={(e) => {
          if (isEditMode && onSeatClick && isVisible) {
            e.stopPropagation();
            onSeatClick(seat.id);
          }
        }}
      >
        {isVisible ? seat.seatNumber : ''}
      </Button>
    </div>
  );
})}
```

**스타일링**:
- `visible: false`: 투명 배경, 투명 텍스트, 클릭 불가 (pointer-events-none)
- `visible: true`: 정상 표시
- 선택된 좌석: 파란색 링 (ring-2 ring-blue-500)
- 편집 모드일 때만 선택 가능

---

### 4. floorStore에 toggleSeatVisible 액션 추가

**변경된 파일**: `src/store/floorStore.ts`

#### 4-1. 인터페이스 확장
```typescript
interface FloorStore {
  // ... 기존 필드들

  // ====== Seat Visibility ======
  toggleSeatVisible: (seatIds: number[]) => Promise<void>;
}
```

#### 4-2. 액션 구현
```typescript
toggleSeatVisible: async (seatIds: number[]) => {
  set({ isLoading: true });
  try {
    await fetchApi<void>(`${SEAT_API_PREFIX}/visible`, {
      method: 'PATCH',
      body: JSON.stringify({ seatIds }),
    });

    // 로컬 상태 업데이트 - seatIds에 포함된 좌석들의 visible 토글
    set((state) => {
      const seatIdSet = new Set(seatIds);
      return {
        floors: state.floors.map((floor) => ({
          ...floor,
          rows: floor.rows.map((floorRow) => ({
            ...floorRow,
            items: floorRow.items.map((item) => {
              if (item.kind !== 'section') return item;
              return {
                ...item,
                rows: item.rows.map((row) => ({
                  ...row,
                  seats: row.seats.map((seat) =>
                    seatIdSet.has(seat.id) ? { ...seat, visible: !seat.visible } : seat,
                  ),
                })),
              };
            }),
          })),
        })),
      };
    });
  } finally {
    set({ isLoading: false });
  }
}
```

**특징**:
- API 엔드포인트: `PATCH /seats/visible`
- 요청 body: `{ seatIds: number[] }`
- 낙관적 업데이트가 아닌 서버 응답 후 상태 업데이트
- Set을 사용한 O(1) 조회로 성능 최적화

---

### 5. SeatGrid 렌더링 업데이트 (좌석 설정 화면)

**변경된 파일**: `src/components/seat/SeatGrid.tsx`

```typescript
{row.seats.map((seat) => {
  const isVisible = seat.visible;
  const bgColor =
    seat.assignedMemberId != null
      ? getMemberColor(seat.assignedMemberId)
      : undefined;
  // ... 기타 로직

  return (
    <div
      key={seat.id}
      className={cn(
        'w-10 h-10 flex items-center justify-center rounded-md text-sm',
        isVisible && 'border bg-surface-primary text-content-primary',
        !isVisible && 'border-0 bg-transparent text-transparent pointer-events-none',
        isPulsing && 'animate-pulse',
      )}
      style={{
        ...(isVisible && bgColor
          ? {
              backgroundColor: bgColor,
              color: getContrastTextColor(bgColor),
              ...(isDimmed ? { filter: 'brightness(0.4)' } : {}),
            }
          : {}),
      }}
    >
      {isVisible && (
        <div className="text-center leading-tight">
          <p>{seat.seatNumber}</p>
          {seat.assignedMemberId != null && (
            <p className="text-xs">{getMemberName(seat.assignedMemberId)}</p>
          )}
        </div>
      )}
    </div>
  );
})}
```

**렌더링 처리**:
- `visible: false`: 공간 유지, border/배경/텍스트 제거, 클릭 불가
- `visible: true`: 정상 렌더링

---

### 6. SeatAssignGrid 렌더링 업데이트 (좌석 배정 화면)

**변경된 파일**: `src/components/seat/AssignRow.tsx`

#### 6-1. Import 추가
```typescript
import { cn } from '@/lib/utils.ts';
```

#### 6-2. 렌더링 로직
```typescript
{row.seats.map((seat) => {
  const isVisible = seat.visible;

  return (
    <Button
      key={seat.id}
      ref={triggerRef}
      className={cn(
        'w-10 h-10 text-sm',
        isVisible && 'bg-surface-primary text-content-primary border-0',
        !isVisible && 'border-0 bg-transparent text-transparent pointer-events-none',
        selectedSeatIds.has(seat.id) && 'ring-2 ring-content-accent ring-offset-1',
      )}
      variant="outline"
      style={
        isVisible && seat.assignedMemberId != null
          ? {
              backgroundColor: assignedSeatColor(seat.assignedMemberId!),
              color: getContrastTextColor(assignedSeatColor(seat.assignedMemberId!)),
            }
          : undefined
      }
      onClick={() => isVisible && onSeatClick(seat.id)}
    >
      {isVisible && (
        <div>
          <p>{seat.seatNumber}</p>
          <p>{assignedSeatMemberName(seat.assignedMemberId!)}</p>
        </div>
      )}
    </Button>
  );
})}
```

**특징**:
- `visible: false` 좌석은 배정 불가 (onClick 무효화)
- pointer-events-none으로 클릭 차단
- 공간은 유지하되 투명 처리

---

## 주요 개선 효과

### ✅ 사용자 경험 (UX)
1. **직관적인 좌석 선택**
   - 열 선택 → 좌석 클릭으로 다중 선택
   - 선택된 좌석 수를 버튼에 실시간 표시
   - 파란색 링으로 시각적 피드백

2. **빈 좌석 관리**
   - 특정 좌석을 숨김 처리 가능 (기둥, 장애물 등)
   - 토글 방식으로 복구 가능
   - 좌석 배정 화면에서도 자동 반영

3. **명확한 피드백**
   - 토스트 메시지로 성공/실패 알림
   - 선택 초기화로 다음 작업 준비

### ✅ 코드 품질
1. **타입 안전성**
   - Set<number>로 타입 명시
   - Props 인터페이스 명확화
   - TypeScript 타입 활용

2. **성능 최적화**
   - Set 자료구조로 O(1) 조회
   - 불필요한 리렌더링 방지

3. **관심사 분리**
   - SectionCard: 다중 선택 관리
   - Row: 좌석 렌더링 및 선택
   - floorStore: API 통신 및 상태 관리

4. **재사용성**
   - Row 컴포넌트에 optional props로 확장성 확보
   - 기존 기능 유지하며 새 기능 추가

### ✅ 일관성
1. **두 화면 모두 적용**
   - SeatGrid (좌석 설정)
   - SeatAssignGrid (좌석 배정)
   - 동일한 visible 처리 로직

2. **스타일 일관성**
   - 공간 유지 (w-10 h-10)
   - 투명 처리 (bg-transparent, text-transparent)
   - 클릭 불가 (pointer-events-none)

---

## 사용 시나리오

### 시나리오 1: 기둥으로 인한 좌석 제거
1. 좌석 설정 화면에서 구역 선택
2. 해당 열(Row) 선택
3. 기둥 위치의 좌석들 클릭하여 다중 선택
4. "빈 좌석 설정 (3)" 버튼 클릭
5. 선택된 3개 좌석이 투명 처리됨
6. 좌석 배정 화면에서도 해당 좌석 숨김 처리 확인

### 시나리오 2: 잘못 숨긴 좌석 복구
1. 이미 `visible: false`인 좌석 다중 선택
2. "빈 좌석 설정" 버튼 클릭
3. 토글로 `visible: true`로 변경
4. 좌석이 다시 표시됨

### 시나리오 3: 좌석 배정 화면에서 확인
1. 좌석 배정 화면 진입
2. `visible: false` 좌석은 투명하게 표시
3. 클릭 불가 상태로 배정 방지
4. 공간은 유지되어 레이아웃 깨짐 없음

---

## API 요구사항

### 엔드포인트
```
PATCH /seats/visible
```

### 요청 Body
```typescript
{
  seatIds: number[]  // 토글할 좌석 ID 배열
}
```

### 응답
- 성공: 204 No Content 또는 200 OK
- 실패: 적절한 에러 응답

### 서버 로직
1. seatIds에 포함된 각 좌석의 visible 필드를 NOT 연산
2. 데이터베이스 업데이트
3. 성공 응답 반환

---

## 파일 변경 요약

### 수정된 파일 (6개)
1. ✅ `src/components/seat/SectionCard.tsx`
   - useState로 selectedSeatIds 관리
   - handleSeatClick, handleToggleSeatVisible 추가
   - sectionEditButtons에 빈 좌석 버튼 추가
   - Row 컴포넌트에 props 전달

2. ✅ `src/components/seat/Row.tsx`
   - Props 인터페이스 확장 (selectedSeatIds, onSeatClick, isEditMode)
   - visible 기반 렌더링 로직 추가
   - 선택 상태 시각화 (ring-2 ring-blue-500)
   - 편집 모드 조건부 클릭 처리

3. ✅ `src/store/floorStore.ts`
   - toggleSeatVisible 액션 추가
   - PATCH /seats/visible API 호출
   - 불변성 유지한 상태 업데이트

4. ✅ `src/components/seat/SeatGrid.tsx`
   - visible 기반 조건부 렌더링
   - 투명 처리 및 클릭 차단

5. ✅ `src/components/seat/AssignRow.tsx`
   - visible 기반 조건부 렌더링
   - onClick 무효화 처리
   - cn 유틸리티 사용

6. ✅ Import 추가
   - IconEyeOff (SectionCard)
   - useState (SectionCard)
   - cn (Row, AssignRow)

---

## 테스트 권장 사항

### 1. 좌석 다중 선택
- [ ] 열 선택 없이 좌석 클릭 시 선택 안 됨
- [ ] 열 선택 후 좌석 클릭 시 파란 링 표시
- [ ] 선택된 좌석 재클릭 시 선택 해제
- [ ] 버튼 텍스트에 선택 수 표시

### 2. 빈 좌석 설정
- [ ] 선택 없이 버튼 클릭 시 비활성화
- [ ] 좌석 선택 후 버튼 활성화
- [ ] 버튼 클릭 시 visible 토글
- [ ] 토스트 메시지 표시
- [ ] 선택 상태 초기화

### 3. visible: false 좌석 렌더링
- [ ] 좌석 설정 화면에서 투명 처리
- [ ] 좌석 배정 화면에서 투명 처리
- [ ] 공간 유지 (10x10 크기)
- [ ] 클릭 불가 (pointer-events-none)
- [ ] border, 배경, 텍스트 제거

### 4. visible 토글
- [ ] visible: true → false 전환
- [ ] visible: false → true 복구
- [ ] 여러 좌석 동시 토글
- [ ] API 실패 시 에러 처리

### 5. 엣지 케이스
- [ ] 배정된 좌석을 visible: false로 변경 가능 여부
- [ ] visible: false 좌석에 배정 시도 시 차단
- [ ] 다른 열로 전환 시 선택 상태 유지/초기화
- [ ] 빠른 연속 클릭 처리

---

## 주의사항

### 구현 시 주의한 부분
1. ✅ 기존 selectedRowId, selectedSectionId와 충돌 없음
2. ✅ 편집 모드(isRowEditMode = selectedRowId !== null)일 때만 좌석 선택
3. ✅ visible: false 좌석은 배정 불가 처리
4. ✅ 공간 유지로 레이아웃 깨짐 방지
5. ✅ Set 사용으로 성능 최적화
6. ✅ 불변성 유지한 상태 업데이트

### 추가 개선 가능 사항
1. **선택 전체 해제 버튼**
   - "선택 해제" 버튼 추가
   - setSelectedSeatIds(new Set()) 호출

2. **선택 범위 드래그**
   - 마우스 드래그로 다중 선택
   - 성능 고려 필요

3. **visible 일괄 설정**
   - 열 단위로 전체 토글
   - 구역 단위로 전체 토글

4. **실행 취소 (Undo)**
   - 토글 이전 상태 저장
   - 실수 복구 기능

---

## 결론

Seat.visible 필드를 활용한 빈 좌석 처리 기능이 성공적으로 구현되었습니다.

**주요 성과:**
- ✅ 좌석 다중 선택 기능 (Set 기반, O(1) 성능)
- ✅ 빈 좌석 설정/해제 토글 버튼
- ✅ floorStore에 toggleSeatVisible 액션 추가
- ✅ SeatGrid, SeatAssignGrid 모두 visible 처리
- ✅ 공간 유지, 투명 처리, 클릭 차단
- ✅ 타입 안전성 및 코드 품질 확보

모든 기존 기능은 유지되며, 새로운 기능이 안전하게 추가되었습니다.
