import { Group, Stack, Text } from '@mantine/core';
import styles from './KanbanHeader.module.css';

export default function KanbanHeader() {
  return (
    <div className={styles.header}>
      <Group justify="space-between" align="center">
        <Group gap="md" align="center">

          <Stack gap={2}>
            <Text className={styles.title}>Канбан-доска</Text>

            <Text className={styles.subtitle}>
              Отдел ОМУР
            </Text>
          </Stack>
        </Group>
      </Group>
    </div>
  );
}