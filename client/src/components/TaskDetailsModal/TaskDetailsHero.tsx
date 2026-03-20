import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconArchive } from '@tabler/icons-react';
import styles from './TaskDetailsModal.module.css';

interface TaskDetailsHeroProps {
  title: string;
  description: string | null;
  score: number;
  currentStatusColor: string;
  canArchiveTask: boolean;
  archiving: boolean;
  onArchive: () => void;
}

export default function TaskDetailsHero({
  title,
  description,
  score,
  currentStatusColor,
  canArchiveTask,
  archiving,
  onArchive,
}: TaskDetailsHeroProps) {
  return (
    <Paper radius="xl" p="lg" className={styles.heroCard}>
      <Group justify="space-between" align="flex-start" gap="md" mb="sm">
        <div style={{ flex: 1 }}>
          <Text fw={800} size="xl" lh={1.2}>
            {title}
          </Text>

          <Text mt="sm" size="sm" c="dimmed" className={styles.descriptionText}>
            {description || 'Без описания'}
          </Text>
        </div>

        <Stack gap="sm" align="flex-end">
          <Badge
            size="lg"
            radius="md"
            variant="light"
            color={currentStatusColor}
          >
            {score} баллов
          </Badge>

          {canArchiveTask && (
            <Button
              size="xs"
              radius="md"
              variant="light"
              color={currentStatusColor}
              leftSection={<IconArchive size={14} />}
              loading={archiving}
              onClick={onArchive}
            >
              В архив
            </Button>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}