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

export const getTokenStorage = (): ITokenStorage | null => tokenStorage;
