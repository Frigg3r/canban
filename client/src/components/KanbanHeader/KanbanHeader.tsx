import { Button, Group, Stack, Text } from '@mantine/core';
import { useAppAuth } from '../../app-auth';
import styles from './KanbanHeader.module.css';

interface KanbanHeaderProps {
  onRatingClick: () => void;
}

export default function KanbanHeader({ onRatingClick }: KanbanHeaderProps) {
  const { currentUser } = useAppAuth();

  return (
    <div className={styles.header}>
      <Group justify="space-between" align="center">
        <Group gap="md" align="center">
          <Group gap="sm" align="center">
            <img
              src={`${import.meta.env.BASE_URL}kanban-logo.svg`}
              alt="Канбан"
              className={styles.logo}
            />

            <Stack gap={2}>
              <Text className={styles.title}>Канбан-доска</Text>
              <Text className={styles.subtitle}>Отдел ОМУР</Text>
            </Stack>
          </Group>

          <Button
            radius="md"
            size="sm"
            onClick={onRatingClick}
            styles={{
              root: {
                background: 'linear-gradient(135deg, #008BFF 0%, #4FC3FF 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 500,
              },
            }}
          >
            Рейтинг
          </Button>
        </Group>

        <Text size="sm" fw={600} c="dimmed">
          {currentUser.fio}
        </Text>
      </Group>
    </div>
  );
}