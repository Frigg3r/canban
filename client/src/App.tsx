import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import KanbanPage from './pages/KanbanPage/KanbanPage';

export default function App() {
  return (
    <MantineProvider>
      <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
        <Notifications position="top-right" />
        <KanbanPage />
      </DatesProvider>
    </MantineProvider>
  );
}