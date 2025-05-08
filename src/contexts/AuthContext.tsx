
import React, { createContext, useContext } from 'react';

// Simplified mock user for the application
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Demo User',
  role: 'operator',
  email: 'demo@example.com'
};

interface AuthContextType {
  user: typeof mockUser;
}

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always provide the mock user
  const value = {
    user: mockUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
