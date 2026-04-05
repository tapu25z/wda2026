export interface ITokenStorage {
  getAccessToken: () => Promise<string | null> | string | null;
  getRefreshToken: () => Promise<string | null> | string | null;
  saveTokens: (access: string, refresh: string) => Promise<void> | void;
  clearTokens: () => Promise<void> | void;
}

let tokenStorage: ITokenStorage | null = null;

export const setTokenStorage = (storage: ITokenStorage): void => {
  tokenStorage = storage;
};

export const getTokenStorage = (): ITokenStorage | null => {
  if (!tokenStorage) {
    // BUG FIX: warn rõ hơn để dev dễ trace nguyên nhân
    console.warn(
      '[Agri-Scan] ⚠️ TokenStorage chưa được cấu hình!\n' +
      'Hãy gọi setTokenStorage() ở file khởi tạo App:\n' +
      '  - Web: trong AuthProvider (useAuth.tsx)\n' +
      '  - Mobile: trước khi render App root (App.tsx hoặc màn login đầu tiên)'
    );
  }
  return tokenStorage;
};
