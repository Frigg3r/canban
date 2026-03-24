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
          <Stack gap={2}>
            <Text className={styles.title}>Канбан-доска</Text>
            <Text className={styles.subtitle}>Отдел ОМУР</Text>
          </Stack>

          <Button
            variant="light"
            color="violet"
            radius="md"
            size="sm"
            onClick={onRatingClick}
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