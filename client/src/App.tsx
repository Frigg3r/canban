import { createContext, useContext, useEffect, useState } from 'react';
import { Center, Loader, MantineProvider, Text } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import { kanbanApi } from './api/kanban';
import type { KanbanCurrentUser } from './types/kanban';
import KanbanPage from './pages/KanbanPage/KanbanPage';

interface AppAuthContextValue {
  currentUser: KanbanCurrentUser;
}

const AppAuthContext = createContext<AppAuthContextValue | null>(null);

export function useAppAuth() {
  const context = useContext(AppAuthContext);

  if (!context) {
    throw new Error('useAppAuth должен использоваться внутри App');
  }

  return context;
}

export default function App() {
  // пока захардкодил
  const currentTabNum = 1001;

  const [currentUser, setCurrentUser] = useState<KanbanCurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setLoading(true);
        setError('');

        const user = await kanbanApi.getCurrentUser(currentTabNum);
        setCurrentUser(user);
      } catch (err) {
        console.error('Ошибка загрузки текущего пользователя:', err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить текущего пользователя');
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [currentTabNum]);

  if (loading) {
    return (
      <MantineProvider>
        <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
          <Notifications position="top-right" />
          <Center h="100vh">
            <Loader />
          </Center>
        </DatesProvider>
      </MantineProvider>
    );
  }

  if (error || !currentUser) {
    return (
      <MantineProvider>
        <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
          <Notifications position="top-right" />
          <Center h="100vh">
            <Text c="red">{error || 'Пользователь не найден'}</Text>
          </Center>
        </DatesProvider>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
        <Notifications position="top-right" />
        <AppAuthContext.Provider
          value={{
            currentUser,
          }}
        >
          <KanbanPage />
        </AppAuthContext.Provider>
      </DatesProvider>
    </MantineProvider>
  );
}