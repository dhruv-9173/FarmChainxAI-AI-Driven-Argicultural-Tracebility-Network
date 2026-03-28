import React, { createContext, useCallback, useMemo, useState } from "react";
import type { AuthTokens, User } from "../types/auth.types";
import { TOKEN_KEY, REFRESH_KEY, USER_KEY } from "../api/apiClient";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: AuthTokens, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

function isUsableToken(value: string | null | undefined): value is string {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "undefined" && normalized !== "null";
}

// Separate export for context-related functions to avoid fast refresh issues
function loadUserFromStorage(): User | null {
  try {
    const localToken = localStorage.getItem(TOKEN_KEY);
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);

    // Prefer local storage session, then session storage session.
    if (isUsableToken(localToken)) {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    }

    if (isUsableToken(sessionToken)) {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    }

    return null;
  } catch {
    return null;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const isAuthenticated = user !== null;
  const isLoading = false;

  const login = useCallback(
    (incomingUser: User, tokens: AuthTokens, rememberMe = false) => {
      if (
        !isUsableToken(tokens.accessToken) ||
        !isUsableToken(tokens.refreshToken)
      ) {
        throw new Error("Invalid auth tokens received from server.");
      }
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(TOKEN_KEY, tokens.accessToken);
      storage.setItem(REFRESH_KEY, tokens.refreshToken);
      storage.setItem(USER_KEY, JSON.stringify(incomingUser));
      setUser(incomingUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updatedUser };
      const storage = localStorage.getItem(TOKEN_KEY)
        ? localStorage
        : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, isLoading, login, logout, updateUser }),
    [user, isAuthenticated, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
