import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './fonttheme/font.css';
import { theme } from './fonttheme/theme';
import 'dayjs/locale/ru';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <DatesProvider settings={{ locale: 'ru', firstDayOfWeek: 1 }}>
      <Notifications position="top-right" />
      <App />
    </DatesProvider>
  </MantineProvider>
);