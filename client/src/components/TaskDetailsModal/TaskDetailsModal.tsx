import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendar,
  IconChecklist,
  IconMessageCircle,
  IconTargetArrow,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
// to do: проверить почему не используется KanbanTeamDetails
import type { KanbanComment, KanbanTaskDetails, KanbanTeamDetails } from '../../types/kanban';

import styles from './TaskDetailsModal.module.css';

interface TaskDetailsModalProps {
  opened: boolean;
  taskId: number | null;
  teamId: number | null;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  backlog: 'Бэклог',
  inProgress: 'В работе',
  review: 'На проверке',
  done: 'Готово',
};

const statusColor: Record<string, string> = {
  backlog: 'violet',
  inProgress: 'blue',
  review: 'yellow',
  done: 'teal',
};

export default function TaskDetailsModal({
  opened,
  taskId,
  teamId,
  onClose,
}: TaskDetailsModalProps) {
  const [taskDetails, setTaskDetails] = useState<KanbanTaskDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (!opened || taskId == null) return;

    const loadTaskDetails = async () => {
      try {
        setLoading(true);
        const data = await kanbanApi.getTaskDetails(taskId, teamId);
        setTaskDetails(data);
      } catch (error) {
        console.error('Ошибка загрузки карточки:', error);
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить данные карточки',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTaskDetails();
  }, [opened, taskId, teamId]);

  // закрытие модалки
  useEffect(() => {
    if (!opened) {
      setTaskDetails(null);
      setCommentText('');
    }
  }, [opened]);

  // вычисление команды, если статус не бэклог
  const currentTeam = (() => {
    if (!taskDetails || taskDetails.board_status === 'backlog') {
      return null;
    }

    if (teamId == null) {
      return taskDetails.teams[0] ?? null;
    }
    // поиск по переданному teamId в пропсах
    return taskDetails.teams.find((team) => Number(team.id) === Number(teamId)) ?? null;
  })();

  const trimmedComment = commentText.trim();
  const canSubmitComment = Boolean(currentTeam && trimmedComment && !commentLoading);

  const handleAddComment = async () => {
    if (!currentTeam || !trimmedComment) return;

    try {
      setCommentLoading(true);

      const createdComment = await kanbanApi.addComment({
        team_id: currentTeam.id,
        text: trimmedComment,
        author_tab_num: 1002,
      });

      setTaskDetails((prev) => {
        if (!prev) return prev;

        return {
          // старые значения
          ...prev,
          // меняем только teams
          teams: prev.teams.map((team) =>
            // находим текущую команду
            team.id === currentTeam.id
              // для нее меняем комментарии, добавляем новый, старые оставляем
              ? { ...team, comments: [createdComment, ...team.comments] }
              : team
          ),
        };
      });

      setCommentText('');

      notifications.show({
        title: 'Успешно',
        message: 'Комментарий добавлен',
        color: 'violet',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось добавить комментарий',
        color: 'red',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!currentTeam) return;

    try {
      setDeletingCommentId(commentId);
      await kanbanApi.deleteComment(commentId);

      setTaskDetails((prev) => {
        if (!prev) return prev;

        return {
          // здесь такая же история, как и с добавлением комментария
          ...prev,
          teams: prev.teams.map((team) =>
            team.id === currentTeam.id
              ? {
                ...team,
                comments: team.comments.filter((comment) => comment.id !== commentId),
              }
              : team
          ),
        };
      });

      notifications.show({
        title: 'Успешно',
        message: 'Комментарий удалён',
        color: 'violet',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Ошибка удаления комментария:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить комментарий',
        color: 'red',
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  // чтобы 3 раза в рендер не писать одно и то же
  const renderInfoCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number
  ) => (
    <Paper withBorder radius="xl" p="md">
      <Group gap="xs" mb="xs">
        {icon}
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>

      <Text fw={700}>{value}</Text>
    </Paper>
  );

  // to do: можно вынести в отдельный компонент, пока под вопросом
  const renderComment = (comment: KanbanComment) => (
    <Paper
      key={comment.id}
      withBorder
      radius="lg"
      p="md"
      className={styles.commentCard}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <div className={styles.commentMeta}>
          <Text fw={700} size="sm">
            {comment.author_name}
          </Text>
          <Text size="xs" c="dimmed">
            {comment.created_at}
          </Text>
        </div>

        {comment.can_delete && (
          <Button
            size="xs"
            color="red"
            variant="light"
            radius="md"
            leftSection={<IconTrash size={14} />}
            loading={deletingCommentId === comment.id}
            onClick={() => handleDeleteComment(comment.id)}
          >
            Удалить
          </Button>
        )}
      </Group>

      <Text size="sm" className={styles.commentText}>
        {comment.text}
      </Text>
    </Paper>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={760}
      centered
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" color="violet" radius="xl" size="lg">
            <IconChecklist size={18} />
          </ThemeIcon>
          <Text fw={800} size="lg">
            Просмотр карточки
          </Text>
        </Group>
      }
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          borderRadius: '22px',
          overflow: 'hidden',
          maxHeight: '90vh',
        },
        header: {
          padding: '18px 22px',
          borderBottom: '1px solid #f1effa',
          background: 'linear-gradient(180deg, #faf8ff 0%, #ffffff 100%)',
        },
        body: {
          padding: '22px',
          background: '#fcfbff',
          maxHeight: 'calc(90vh - 78px)',
          overflowY: 'auto',
        },
      }}
    >
      {loading ? (
        <Group justify="center" py={60}>
          <Loader color="violet" />
        </Group>
      ) : !taskDetails ? (
        <Text c="dimmed">Нет данных по карточке</Text>
      ) : (
        <Stack gap="lg">
          <Paper radius="xl" p="lg" className={styles.heroCard}>
            <Group justify="space-between" align="flex-start" gap="md" mb="sm">
              <div style={{ flex: 1 }}>
                <Text fw={800} size="xl" lh={1.2}>
                  {taskDetails.name}
                </Text>

                <Text mt="sm" size="sm" c="dimmed" className={styles.descriptionText}>
                  {taskDetails.description || 'Без описания'}
                </Text>
              </div>

              <Badge
                size="lg"
                radius="md"
                variant="light"
                color={statusColor[taskDetails.board_status] || 'gray'}
              >
                {taskDetails.score} баллов
              </Badge>
            </Group>

            <Badge
              variant="light"
              radius="sm"
              color={statusColor[taskDetails.board_status] || 'gray'}
            >
              {statusLabel[taskDetails.board_status] || taskDetails.board_status}
            </Badge>
          </Paper>

          <Group grow align="stretch">
            {renderInfoCard(
              <ThemeIcon variant="light" color="gray" radius="xl">
                <IconCalendar size={16} />
              </ThemeIcon>,
              'Дедлайн',
              taskDetails.deadline_full?.split(' ')[0] || '-'
            )}

            {renderInfoCard(
              <ThemeIcon variant="light" color="blue" radius="xl">
                <IconTargetArrow size={16} />
              </ThemeIcon>,
              'Квота',
              taskDetails.quota
            )}

            {renderInfoCard(
              <ThemeIcon variant="light" color="violet" radius="xl">
                <IconUsers size={16} />
              </ThemeIcon>,
              'Команд',
              taskDetails.teams.length
            )}
          </Group>

          <Divider />

          {taskDetails.board_status === 'backlog' ? (
            <Stack gap="sm">
              <Text fw={700} size="lg">
                Команды по задаче
              </Text>

              {taskDetails.teams.length > 0 ? (
                taskDetails.teams.map((team) => (
                  <Paper key={team.id} withBorder radius="xl" p="md">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700}>Команда #{team.id}</Text>
                      <Badge variant="light" radius="sm">
                        {team.status}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" className={styles.descriptionText}>
                      {team.participants.length > 0
                        ? team.participants.map((participant) => participant.full_name).join(', ')
                        : 'Нет участников'}
                    </Text>
                  </Paper>
                ))
              ) : (
                <Paper withBorder radius="xl" p="lg">
                  <Text size="sm" c="dimmed">
                    Над задачей пока никто не работает
                  </Text>
                </Paper>
              )}
            </Stack>
          ) : currentTeam ? (
            <Stack gap="lg">
              <Paper withBorder radius="xl" p="md" bg="#ffffff">
                <Group justify="space-between" mb="xs">
                  <Text fw={700} size="lg">
                    Команда #{currentTeam.id}
                  </Text>
                  <Badge variant="light" radius="sm">
                    {currentTeam.status}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" className={styles.descriptionText}>
                  {currentTeam.participants.length > 0
                    ? currentTeam.participants.map((participant) => participant.full_name).join(', ')
                    : 'Нет участников'}
                </Text>
              </Paper>

              <Paper withBorder radius="xl" p="lg" bg="#ffffff">
                <Group justify="space-between" align="center" mb="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color="violet" radius="xl">
                      <IconMessageCircle size={16} />
                    </ThemeIcon>
                    <Text fw={700} size="lg">
                      Комментарии
                    </Text>
                  </Group>

                  <Text size="sm" c="dimmed">
                    {currentTeam.comments.length}
                  </Text>
                </Group>

                <Stack gap="sm" mb="md">
                  <Textarea
                    placeholder="Напиши комментарий..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.currentTarget.value)}
                    minRows={3}
                    maxRows={6}
                    autosize
                    radius="lg"
                    styles={{
                      input: {
                        background: '#faf8ff',
                        borderColor: '#e9defc',
                      },
                    }}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                        event.preventDefault();
                        if (canSubmitComment) {
                          handleAddComment();
                        }
                      }
                    }}
                  />

                  <Group justify="space-between" align="center">
                    <Text size="xs" c="dimmed">
                      Ctrl/Cmd + Enter — отправить
                    </Text>

                    <Button
                      radius="md"
                      color="violet"
                      loading={commentLoading}
                      disabled={!canSubmitComment}
                      onClick={handleAddComment}
                    >
                      Добавить комментарий
                    </Button>
                  </Group>
                </Stack>

                {currentTeam.comments.length > 0 ? (
                  <ScrollArea h={260} offsetScrollbars scrollbarSize={6}>
                    <Stack gap="sm" pr={6}>
                      {currentTeam.comments.map(renderComment)}
                    </Stack>
                  </ScrollArea>
                ) : (
                  <Paper radius="lg" p="md" bg="#faf8ff">
                    <Text size="sm" c="dimmed">
                      Комментариев пока нет
                    </Text>
                  </Paper>
                )}
              </Paper>
            </Stack>
          ) : (
            <Paper withBorder radius="xl" p="lg">
              <Text size="sm" c="dimmed">
                Команда не найдена
              </Text>
            </Paper>
          )}
        </Stack>
      )}
    </Modal>
  );
}