import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider, useData } from './DataContext';
import { UIProvider, useUI } from './UIContext';


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <DataProvider>
        <UIProvider>
          {children}
        </UIProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export const useApp = () => {
  const auth = useAuth();
  const data = useData();
  const ui = useUI();

  return {
    ...auth,
    ...data,
    ...ui
  };
};
