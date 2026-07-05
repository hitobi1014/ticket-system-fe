- 여기서 요구하는 사항들의 답변은 항상 ai/cl-response.md에 작성해줘

## 요청사항

## 작업 목표

Seat.visible 필드를 활용한 빈 좌석 처리 기능 구현

## 현재 상태

- `Seat` 타입에 `visible: boolean` 필드 존재
- `SectionCard` 내 좌석 렌더링 시 visible 처리 로직 없음
- `sectionEditButtons` 배열에 빈 좌석 관련 버튼 없음

## 구현 요구사항

### 1. 좌석 다중 선택 기능

- `SectionCard` 또는 `Row` 컴포넌트에서 좌석 클릭 시 다중 선택 가능하게 구현
- 선택된 좌석 ID를 `Set<number>` 또는 `number[]`로 관리
- 선택된 좌석 시각적 표시 (기존 선택 스타일과 구분)

### 2. 빈 좌석 설정 버튼

- `sectionEditButtons` 배열에 `빈 좌석 설정` 버튼 추가
- 버튼 클릭 시 현재 선택된 좌석들의 `visible`을 `false`로 토글
- `visible: false`인 좌석 재선택 후 버튼 클릭 시 `visible: true`로 복구 (토글)
- `floorStore`에 `toggleSeatVisible(seatIds: number[])` 액션 추가
- 빈 좌석 처리됐을때 border border-surface-danger로 css 추가

### 3. 좌석 렌더링 처리

- `SeatGrid`(좌석 설정 화면)와 `SeatAssignGrid`(좌석 배정 화면) 두 곳 모두 적용
- `visible: false`인 좌석은 **공간은 유지**하되 border, 텍스트, 배경색 렌더링 제거
- 빈 좌석은 클릭 불가 처리 (`pointer-events-none`)

## 주의사항

- 기존 `selectedRowId`, `selectedSectionId` 상태와 충돌 없게 구현
- 다중 선택 상태는 편집 모드(`isRowEditMode`)일 때만 활성화
- `visible: false` 좌석은 좌석 배정 화면에서도 배정 불가 처리
