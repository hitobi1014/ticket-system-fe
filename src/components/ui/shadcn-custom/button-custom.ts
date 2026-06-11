export const customVariants = {
  close: 'bg-gray-800 text-[var(--text-primary)] rounded-md hover:bg-gray-900',
  confirm: 'bg-emerald-800 text-[var(--text-primary)] rounded-md hover:bg-emerald-900', // 승인, 확인, 배정 등 긍정 관련된 기능
  cancel:
    'bg-[var(--color-danger)] text-[var(--text-primary)] rounded-md hover:bg-[var(--color-danger-hover)]', // 취소, 부정 관련된 기능
  modify: 'bg-sky-800 text-[var(--text-primary)] rounded-md hover:bg-sky-900', // 수정 관련된 기능
  primary: 'border border-[var(--color-secondary)] text-[var(--color-mist-50)]',
  secondary:
    'bg-[var(--color-primary)] border border-[var(--color-secondary)] text-[var(--color-mist-50)]',
  dialog: 'border text-[var(--text-primary)] border-mist-500 hover:bg-mist-800',
  // 페이지: primary/secondary/danger
} as const;

export const customSize = {
  // custom
  base: 'px-4 h-8',
} as const;
