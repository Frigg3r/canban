import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { IconArchive, IconCheck, IconX, IconPencil, IconDeviceFloppy } from '@tabler/icons-react';
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

  // новые пропсы для редактирования
  canEditTask: boolean;
  isEditingTask: boolean;
  editName: string;
  editDescription: string;
  editScore: string;
  taskSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditScoreChange: (value: string) => void;
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

  canEditTask,
  isEditingTask,
  editName,
  editDescription,
  editScore,
  taskSaving,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditDescriptionChange,
  onEditScoreChange,
}: TaskDetailsHeroProps) {
  return (
    <Paper radius="xl" p="lg" className={styles.heroCard}>
      <Group justify="space-between" align="flex-start" gap="md" mb="sm">
        <div className={styles.heroContent}>
          {isEditingTask ? (
            <Stack gap="sm">
              <TextInput
                label="Название"
                value={editName}
                onChange={(event) => onEditNameChange(event.currentTarget.value)}
                radius="md"
                maxLength={200}
              />
              <Textarea
                label="Описание"
                value={editDescription}
                onChange={(event) => onEditDescriptionChange(event.currentTarget.value)}
                minRows={3}
                autosize
                radius="md"
              />
            </Stack>
          ) : (
            <>
              <Group gap="xs" align="center" wrap="nowrap">
                <Text fw={800} size="xl" lh={1.2}>
                  {title}
                </Text>

                {canEditTask && (
                  <Tooltip label="Редактировать" withArrow>
                    <ActionIcon
                      size="md"
                      radius="md"
                      variant="light"
                      color={currentStatusColor}
                      onClick={onStartEdit}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              <Text mt="sm" size="sm" c="dimmed" className={styles.descriptionText}>
                {description || 'Без описания'}
              </Text>
            </>
          )}
        </div>

        <Stack gap="sm" align="flex-end">
          {isEditingTask ? (
            <TextInput
              label="Баллы"
              type="number"
              value={editScore}
              onChange={(e) => onEditScoreChange(e.currentTarget.value)}
              radius="md"
              size="sm"
              className={styles.scoreInput}
            />
          ) : (
            <Badge size="lg" radius="md" variant="light" color={currentStatusColor}>
              {score} баллов
            </Badge>
          )}

          <Group gap="xs">
            {isEditingTask ? (
              <>
                <Tooltip label="Сохранить" withArrow>
                  <ActionIcon
                    size="lg"
                    radius="md"
                    variant="light"
                    color="teal"
                    loading={taskSaving}
                    onClick={onSaveEdit}
                  >
                    <IconDeviceFloppy size={18} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Отмена" withArrow>
                  <ActionIcon
                    size="lg"
                    radius="md"
                    variant="light"
                    color="gray"
                    onClick={onCancelEdit}
                    disabled={taskSaving}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Tooltip>
              </>
            ) : (
              <>
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
              </>
            )}
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}