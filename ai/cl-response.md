# CSS 색상 변수 시스템 리팩토링 — 완료 결과

다크모드를 사용하지 않는다는 전제로, `@theme`/`:root`/`@theme inline`/`.dark` 4단 구조를 **`@theme` 단일 블록**으로 통합했습니다. `surface-*` 커스텀 토큰은 전부 삭제하고 의미가 겹치는 shadcn 토큰으로 흡수시켰으며, 그 과정에서 실제 사용 중인 클래스명을 프로젝트 전체에서 일괄 변경했습니다.

## 1. `src/index.css` 최종 구조

```
@theme {
  --font-*                 (기존 유지)
  --radius, --radius-*     (기존 유지)
  --color-background ~ --color-sidebar-ring   (shadcn 표준 토큰, 리터럴 값 직접 선언)
  --color-content-primary/secondary/danger    (surface와 안 겹치는 커스텀 색상만 잔존)
}
```

- `:root`, `@theme inline`, `.dark` 블록 완전히 제거.
- `@custom-variant dark (&:is(.dark *));` 선언은 **의도적으로 유지**했습니다. 이걸 지우면 Tailwind가 `dark:`를 기본값인 `prefers-color-scheme: dark` 미디어쿼리로 해석하게 되어, `select.tsx`/`button.tsx` 등에 이미 박혀 있는 `dark:` variant 클래스들이 OS 다크모드 사용자에게 **의도치 않게 활성화**될 뻔했습니다. `.dark` 클래스를 코드 어디서도 붙이지 않으므로 이 한 줄만 남겨두면 해당 `dark:` 클래스들은 계속 죽은 채로 안전하게 무시됩니다.

## 2. 커스텀 색상 → shadcn 토큰 매핑

| 이전 (`@theme`) | 원래 값 | 변경 후 | 새 값 | 비고 |
|---|---|---|---|---|
| `surface-primary` | mist-900 `oklch(21.8% .008 224)` | `primary` | `oklch(0.205 0 0)` | 값 거의 동일, 육안상 차이 미미 |
| `surface-primary-hover` | mist-700 `oklch(37.8% .015 216)` | `primary-foreground` | `oklch(0.985 0 0)` | **색상 크게 밝아짐** (중간톤→거의 흰색) |
| `surface-secondary` | mist-700 (위와 동일) | `secondary` | `oklch(0.97 0 0)` | **크게 밝아짐** |
| `surface-accent` | mist-500 `oklch(56% .021 214)` | `accent` | `oklch(0.97 0 0)` | **크게 밝아짐** |
| `surface-danger` | amber-300 (주황/노랑 계열) | `destructive` | `oklch(0.577 .245 27)` (빨강) | **색상(hue) 자체가 주황→빨강으로 변경** |
| `surface-danger-hover` | amber-400 | `destructive-foreground` *(신규 추가)* | `oklch(0.985 0 0)` | **크게 밝아짐** |
| `content-accent` | mist-500 (surface-accent와 동일 값이라 통합 대상) | `accent` | `oklch(0.97 0 0)` | **크게 밝아짐** |

**유지된 커스텀 토큰** (shadcn 값과 안 겹쳐서 그대로 둠): `content-primary`(mist-50), `content-secondary`(mist-300), `content-danger`(red-950). 이 3개는 className도 변경하지 않았습니다.

> ⚠️ 요청하신 대로 매핑은 전부 반영했지만, shadcn의 `secondary`/`accent`/`primary-foreground`/`destructive-foreground`가 전부 거의 흰색(`oklch(0.97~0.985 0 0)`)이라, 기존에 mist 계열 중간톤 배경/hover였던 UI 요소(사이드바, 다이얼로그 배경, 버튼 hover, 배지 등)가 이번 변경으로 **눈에 띄게 밝아집니다.** 구조 정리 수준이 아니라 실제 배색이 바뀌는 변경이니, 스크린샷으로 꼭 확인해 주세요.

## 3. 함께 수정한 기존 버그 2건

1. **`bg-primary`/`bg-secondary` 계열 유틸리티가 아예 생성되지 않던 버그** — `@theme inline`에 `--color-primary`/`--color-secondary` base 매핑이 누락되어 있었습니다. 단일 `@theme` 블록으로 합치면서 자연스럽게 포함시켜 해결됨. `Button`/`Badge`의 default·secondary variant, `Field`의 invalid 상태가 이제 정상적으로 배경색이 나옵니다.
2. **라이트 모드 사이드바 배경 미표시 버그** — 기존 `--sidebar: var(--color-secondary)`가 존재하지 않는 변수를 참조해 무효 값이었습니다. `--color-sidebar: var(--color-secondary)`로 고쳐 정상화했습니다 (같은 `@theme` 블록 안에서 참조하므로 이제 유효).

## 4. `src/components/ui/` (shadcn 커스텀) 확인 결과

- `src/components/ui/shadcn-custom/button-custom.ts`: `surface-*`/`content-accent` 토큰 사용하던 4개 variant(`confirm`, `cancel`, `primary`, `secondary`) className 교체. 추가로 `cancel` variant에 있던 **기존 오타**(`hover:bg-surface-danger-hover]` — 끝에 불필요한 `]` 문자)도 함께 제거했습니다.
- `src/components/ui/sonner.tsx`, `src/components/ui/sidebar.tsx`: className이 아니라 **raw `var(--popover)`, `var(--border)`, `var(--sidebar-border)`, `var(--sidebar-accent)` 형태**로 변수를 직접 참조하고 있었습니다. 이번에 `--color-` 접두사 없는 변수 자체를 없앴기 때문에, 이 raw 참조들을 `var(--color-popover)` 등으로 함께 수정하지 않았다면 조용히 깨졌을 부분입니다 (총 5곳 수정).
- 그 외 `dark:` variant를 쓰는 `tabs/select/toggle/input-group/context-menu/badge/input/field/button/combobox/textarea.tsx`는 위 1번 항목 설명대로 `@custom-variant dark`를 유지해서 손대지 않았습니다.

## 5. 변경된 파일 (총 28개)

`src/index.css` 외 27개 파일에서 className을 일괄 치환했습니다: `Layout.tsx`, `app-sidebar.tsx`, `common/PageHeader.tsx`, `dialog/AddSectionDialog.tsx`, `dialog/AlertDialogCustom.tsx`, `dialog/AssignMemberModal.tsx`, `dialog/MemberInfoDialog.tsx`, `dialog/RemoveSeatDialog.tsx`, `dialog/SyncResultDialog.tsx`, `dialog/VenueInfoDialog.tsx`, `member/MemberInfoCard.tsx`, `seat-assign/SeatAssignGrid.tsx`, `seat-assign/SeatAssignSidebar.tsx`, `seat/AssignRow.tsx`, `seat/Row.tsx`, `seat/SeatGrid.tsx`, `seat/SeatMinimap.tsx`, `seat/SectionCard.tsx`, `ui/shadcn-custom/button-custom.ts`, `ui/sidebar.tsx`, `ui/sonner.tsx`, `pages/FloorSetupPage.tsx`, `pages/LoginPage.tsx`, `pages/MembersPage.tsx`, `pages/SeatAssignPage.tsx`, `pages/SeatViewPage.tsx`.

색상 값 자체를 바꾸지 않은 `content-primary`/`content-secondary`/`content-danger` 사용처는 건드리지 않았습니다.

## 6. 검증

- `npx @tailwindcss/cli -i src/index.css -o out.css` 컴파일 성공. `bg-primary`, `text-primary-foreground`, `hover:bg-primary-foreground`, `bg-secondary`, `bg-accent`, `bg-destructive`, `hover:bg-destructive-foreground`, `bg-content-primary`, `bg-sidebar` 전부 정상 생성 확인 (버그 수정 반영됨).
- `npx tsc --noEmit`: 기존에도 있던 `tsconfig.json`의 `baseUrl` deprecation 경고만 존재, 이번 변경으로 인한 타입 에러 없음.
- `npx eslint src`: 기존부터 있던 것과 동일한 7개 warning + `use-mobile.ts`의 기존 에러 1개(이번 변경과 무관)만 존재. `surface`/`content` 관련 새로운 lint 이슈 없음.
- 개발 서버에서 육안 확인은 아직 안 했습니다. **로그인 페이지, 멤버 관리 테이블, 좌석 배정 사이드바/다이얼로그** 정도를 열어서 위 매핑 표의 "크게 밝아짐" 항목들이 의도한 결과인지 확인을 권장합니다.

## 7. 남은 확인 필요 사항 (참고, 이번엔 안 건드림)

- `src/components/seat/SectionCard.tsx:215,235`의 `ring-text-content-primary`는 애초부터 존재하지 않는 클래스명(`ring-text-*`는 Tailwind 문법에 없음)이라 원래도 동작하지 않던 것으로 보입니다. 이번 리팩토링 범위 밖이라 그대로 뒀습니다.
