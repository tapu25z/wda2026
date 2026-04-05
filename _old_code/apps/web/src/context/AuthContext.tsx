import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan?: 'Free' | 'Premium' | 'VIP';
  planExpiry?: string;
  hasPassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const newUser: User = {
          id: data.id.toString(),
          name: data.name || data.email.split('@')[0],
          email: data.email,
          avatar: data.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || data.email)}&background=random`,
          plan: 'Free',
          hasPassword: data.hasPassword
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  useEffect(() => {
    // Check for persisted user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage', e);
        localStorage.removeItem('user');
      }
    }
    
    // Try to fetch real profile from backend
    fetchProfile().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await fetch('/api/auth/google/mock', { method: 'POST' });
      if (!res.ok) throw new Error('Mock login failed');
      await fetchProfile();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const setPassword = async (password: string) => {
    try {
      const res = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to set password');
      }
      
      await fetchProfile();
    } catch (error) {
      console.error('Set password error:', error);
      throw error;
    }
  };

  const login = async (email: string, password?: string) => {
    if (password) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      await fetchProfile();
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if we have this user in our "database" (localStorage)
    const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
    const existingUser = usersDb[email];

    const name = existingUser ? existingUser.name : email.split('@')[0];
    
    const newUser: User = {
      id: existingUser ? existingUser.id : Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      plan: existingUser?.plan || 'Free',
      planExpiry: existingUser?.planExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const register = async (email: string, name: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      plan: 'Free',
      planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Save to "database"
    const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
    usersDb[email] = newUser;
    localStorage.setItem('users_db', JSON.stringify(usersDb));

    // Auto login
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
      if (usersDb[user.email]) {
        usersDb[user.email] = updatedUser;
        localStorage.setItem('users_db', JSON.stringify(usersDb));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, setPassword, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
