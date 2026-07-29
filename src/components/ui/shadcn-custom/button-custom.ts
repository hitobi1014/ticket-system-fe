export const customVariants = {
  close: 'bg-gray-800 text-secondary rounded-md hover:bg-gray-900 hover:text-text-foreground',
  confirm:
    'bg-primary text-secondary rounded-md hover:bg-primary-foreground hover:text-text-foreground', // 승인, 확인, 배정 등 긍정 관련된 기능
  cancel: 'bg-destructive text-danger font-bold rounded-md hover:bg-destructive-foreground', // 취소, 부정 관련된 기능
  modify: 'bg-sky-800 text-secondary rounded-md hover:bg-sky-900', // 수정 관련된 기능
  primary:
    'border border-primary text-primary hover:bg-primary-foreground hover:text-text-foreground',
  secondary: 'bg-primary border border-primary text-primary',
  dialog: 'border text-primary border-primary hover:bg-mist-800',
  // 페이지: primary/secondary/danger
} as const;

export const customSize = {
  // custom
  base: 'px-4 h-8',
} as const;
