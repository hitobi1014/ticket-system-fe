export const customVariants = {
  close: 'bg-gray-800 text-content-secondary rounded-md hover:bg-gray-900',
  confirm: 'bg-surface-primary text-content-secondary rounded-md hover:bg-surface-primary-hover', // 승인, 확인, 배정 등 긍정 관련된 기능
  cancel: 'bg-surface-danger text-content-secondary rounded-md hover:bg-surface-danger-hover]', // 취소, 부정 관련된 기능
  modify: 'bg-sky-800 text-content-secondary rounded-md hover:bg-sky-900', // 수정 관련된 기능
  primary: 'border border-surface-secondary text-content-primary hover:bg-surface-primary-hover',
  secondary: 'bg-surface-primary border border-surface-secondary text-content-primary',
  dialog: 'border text-content-primary border-mist-500 hover:bg-mist-800',
  // 페이지: primary/secondary/danger
} as const;

export const customSize = {
  // custom
  base: 'px-4 h-8',
} as const;
