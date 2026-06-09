export const customVariants = {
  close: 'bg-gray-800 text-white rounded-md hover:bg-gray-900',
  confirm: 'bg-emerald-800 text-white rounded-md hover:bg-emerald-900', // 승인, 확인, 배정 등 긍정 관련된 기능
  cancel: 'bg-red-500 text-white rounded-md hover:bg-red-700', // 취소, 부정 관련된 기능
  modify: 'bg-sky-800 text-white rounded-md hover:bg-sky-900', // 수정 관련된 기능
} as const;

export const customSize = {
  // custom
  base: 'px-4 h-8',
} as const;
