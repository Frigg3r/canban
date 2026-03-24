import { createContext, useContext } from 'react';
import type { KanbanCurrentUser } from './types/kanban';

interface AppAuthContextValue {
  currentUser: KanbanCurrentUser;
}

export const AppAuthContext = createContext<AppAuthContextValue | null>(null);

export function useAppAuth() {
  const context = useContext(AppAuthContext);

  if (!context) {
    throw new Error('useAppAuth должен использоваться внутри AppAuthContext.Provider');
  }

  return context;
}