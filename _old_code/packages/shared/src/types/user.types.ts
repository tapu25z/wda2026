export enum UserRole {
  FARMER = 'FARMER',
  EXPERT = 'EXPERT',
  ADMIN = 'ADMIN',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  plan: SubscriptionPlan;
  planExpiresAt: Date | null;
  dailyImageCount: number;
  dailyPromptCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPasswordSet: boolean;
  isGoogleLinked?: boolean;      
  isFacebookLinked?: boolean; 
   lastResetDate: Date; 
    authProviders: AuthProvider[];  
}

export interface IUserCreate {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

// Dùng riêng cho luồng OAuth (không cần password)
export interface IOAuthUserCreate {
  email: string;
  fullName: string;
  avatar?: string;
  provider: AuthProvider;
  providerId: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: UserRole;
  plan: SubscriptionPlan;
  provider: AuthProvider;
}

export interface IAuthResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken?: string;
}
