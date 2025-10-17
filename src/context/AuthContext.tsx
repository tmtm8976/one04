import React, { createContext, useContext, useState } from 'react';
import * as Keychain from 'react-native-keychain';

type AuthContextType = {
  authenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  authUser: User | null;
};

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  login: () => {},
  logout: () => {},
  authUser: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);

  const login = (user: User) => {
    setAuthUser(user);
    setAuthenticated(true);
  };
  const logout = async () => {
    await Keychain.resetGenericPassword({
      service: 'service_key',
    });
    await Keychain.resetGenericPassword({
      service: 'background_token',
    });
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, login, logout, authUser }}>
      {children}
    </AuthContext.Provider>
  );
};
