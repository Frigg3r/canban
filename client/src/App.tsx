import { useEffect, useState, type ReactNode } from 'react';
import { Center, Loader, Text } from '@mantine/core';
import { kanbanApi } from './api/kanban';
import type { KanbanCurrentUser } from './types/kanban';
import { AppAuthContext } from './app-auth';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';
import RatingPage from './pages/RatingPage/RatingPage';

type AppView = 'kanban' | 'rating';

function getCurrentTabNum() {
  // временно: пока нет нормальной авторизации
  return 1001;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<KanbanCurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<AppView>('kanban');

  useEffect(() => {
    // при старте приложения загружаем текущего пользователя
    const loadCurrentUser = async () => {
      setLoading(true);
      setError('');

      try {
        const user = await kanbanApi.getCurrentUser(getCurrentTabNum());
        setCurrentUser(user);
      } catch (err) {
        console.error('Ошибка загрузки текущего пользователя:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить текущего пользователя'
        );
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  let content: ReactNode;

  if (loading) {
    content = (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  } else if (error || !currentUser) {
    content = (
      <Center h="100vh">
        <Text c="red">{error || 'Пользователь не найден'}</Text>
      </Center>
    );
  } else {
    content = (
      <AppAuthContext.Provider value={{ currentUser }}>
        {view === 'kanban' ? (
          <KanbanBoard onRatingClick={() => setView('rating')} />
        ) : (
          <RatingPage onBackClick={() => setView('kanban')} />
        )}
      </AppAuthContext.Provider>
    );
  }

  return content;
}