import { Group, Stack, Text } from '@mantine/core';
import { useAppAuth } from '../../App';
import styles from './KanbanHeader.module.css';

export default function KanbanHeader() {
  const { currentUser } = useAppAuth();

  return (
    <div className={styles.header}>
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Text className={styles.title}>Канбан-доска</Text>
          <Text className={styles.subtitle}>Отдел ОМУР</Text>
        </Stack>

        <Text size="sm" fw={600} c="dimmed">
          {currentUser.fio}
        </Text>
      </Group>
    </div>
  );
}