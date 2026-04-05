export const CATEGORY_MAP: Record<string, string> = {
  'Tất cả': '',
  'Phân bón': 'FERTILIZER',
  'Thuốc BVTV': 'PESTICIDE',
  'Hạt giống': 'SEED',
  'Dụng cụ': 'TOOL',
  'Khác': 'OTHER',
};

export const CATEGORY_LABEL: Record<string, string> = {
  FERTILIZER: 'Phân bón',
  PESTICIDE: 'Thuốc BVTV',
  SEED: 'Hạt giống',
  TOOL: 'Dụng cụ',
  OTHER: 'Khác',
};

export const CATEGORIES = Object.keys(CATEGORY_MAP);