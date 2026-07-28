export const customVariants = {
  close: 'bg-gray-800 text-content-secondary rounded-md hover:bg-gray-900',
  confirm: 'bg-primary text-content-secondary rounded-md hover:bg-primary-foreground', // 승인, 확인, 배정 등 긍정 관련된 기능
  cancel:
    'bg-destructive text-content-danger font-bold rounded-md hover:bg-destructive-foreground', // 취소, 부정 관련된 기능
  modify: 'bg-sky-800 text-content-secondary rounded-md hover:bg-sky-900', // 수정 관련된 기능
  primary: 'border border-content-primary text-content-primary hover:bg-primary-foreground',
  secondary: 'bg-primary border border-content-primary text-content-primary',
  dialog: 'border text-content-primary border-content-primary hover:bg-mist-800',
  // 페이지: primary/secondary/danger
} as const;

export const customSize = {
  // custom
  base: 'px-4 h-8',
} as const;
