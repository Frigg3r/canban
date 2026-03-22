import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArchive, IconCheck, IconX } from '@tabler/icons-react';
import styles from './TaskDetailsModal.module.css';

interface TaskDetailsHeroProps {
  title: string;
  description: string | null;
  score: number;
  currentStatusColor: string;
  canArchiveTask: boolean;
  archiving: boolean;
  onArchive: () => void;
  canReviewTeam: boolean;
  reviewLoading: boolean;
  onApprove: () => void;
  onReturnToWork: () => void;
}

export default function TaskDetailsHero({
  title,
  description,
  score,
  currentStatusColor,
  canArchiveTask,
  archiving,
  onArchive,
  canReviewTeam,
  reviewLoading,
  onApprove,
  onReturnToWork,
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

          {(canReviewTeam || canArchiveTask) && (
            <Group gap="xs">
              {canReviewTeam && (
                <>
                  <Tooltip label="Принять" withArrow>
                    <ActionIcon
                      size="lg"
                      radius="md"
                      variant="light"
                      color="teal"
                      loading={reviewLoading}
                      onClick={onApprove}
                    >
                      <IconCheck size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Отправить на доработку" withArrow>
                    <ActionIcon
                      size="lg"
                      radius="md"
                      variant="light"
                      color="red"
                      loading={reviewLoading}
                      onClick={onReturnToWork}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}

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
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}