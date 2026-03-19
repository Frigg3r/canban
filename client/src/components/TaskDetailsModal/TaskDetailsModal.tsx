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
  Select,
} from '@mantine/core';
import {
  IconArchive,
  IconCalendar,
  IconChecklist,
  IconMessageCircle,
  IconTargetArrow,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type {
  KanbanComment,
  KanbanTaskDetails,
  KanbanAvailableUser,
} from '../../types/kanban';

import styles from './TaskDetailsModal.module.css';

interface TaskDetailsModalProps {
  opened: boolean;
  taskId: number | null;
  teamId: number | null;
  onClose: () => void;
  onTaskTeamChanged: (payload: {
    taskId: number;
    teamId: number | null;
    participantsCount: number;
  }) => void;
  onTaskArchived: (taskId: number) => void;
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
  onTaskTeamChanged,
  onTaskArchived
}: TaskDetailsModalProps) {
  const [taskDetails, setTaskDetails] = useState<KanbanTaskDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [removingParticipantTabNum, setRemovingParticipantTabNum] = useState<number | null>(null);

  const [availableUsers, setAvailableUsers] = useState<KanbanAvailableUser[]>([]);
  const [selectedUserTabNum, setSelectedUserTabNum] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

  const loadTaskDetails = async () => {
    if (taskId == null) return;

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

  const loadAvailableUsers = async () => {
    if (taskId == null) return;

    try {
      const data = await kanbanApi.getAvailableUsers(taskId);
      setAvailableUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  useEffect(() => {
    if (!opened || taskId == null) return;
    loadTaskDetails();
    loadAvailableUsers();
  }, [opened, taskId, teamId]);

  useEffect(() => {
    if (!opened) {
      setTaskDetails(null);
      setCommentText('');
      setAvailableUsers([]);
      setSelectedUserTabNum(null);
    }
  }, [opened]);

  const isBacklogView = teamId == null;
  const canArchiveTask =
    taskDetails?.board_status === 'backlog' || taskDetails?.board_status === 'done';

  const currentTeam = (() => {
    if (!taskDetails || isBacklogView) {
      return null;
    }

    return taskDetails.teams.find((team) => Number(team.id) === Number(teamId)) ?? null;
  })();

  const currentStatusKey = currentTeam?.status ?? taskDetails?.board_status ?? 'backlog';
  const currentStatusColor = statusColor[currentStatusKey] || 'gray';

  const canEditTeam = !isBacklogView && currentTeam?.status === 'inProgress';

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
          ...prev,
          teams: prev.teams.map((team) =>
            team.id === currentTeam.id
              ? { ...team, comments: [createdComment, ...team.comments] }
              : team
          ),
        };
      });

      setCommentText('');

      notifications.show({
        title: 'Успешно',
        message: 'Комментарий добавлен',
        color: currentStatusColor,
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
        color: currentStatusColor,
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

  const handleAddParticipant = async () => {
    if (!currentTeam || !selectedUserTabNum || !taskDetails) return;

    try {
      setAddingParticipant(true);

      await kanbanApi.addUserToTeam({
        team_id: currentTeam.id,
        tab_num: Number(selectedUserTabNum),
      });

      const nextParticipantsCount = currentTeam.participants.length + 1;

      onTaskTeamChanged({
        taskId: taskDetails.id,
        teamId: currentTeam.id,
        participantsCount: nextParticipantsCount,
      });

      await loadTaskDetails();
      await loadAvailableUsers();
      setSelectedUserTabNum(null);

      notifications.show({
        title: 'Успешно',
        message: 'Сотрудник добавлен в команду',
        color: currentStatusColor,
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Ошибка добавления сотрудника:', error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось добавить сотрудника',
        color: 'red',
      });
    } finally {
      setAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (tabNum: number) => {
    if (!currentTeam || !taskDetails) return;

    try {
      setRemovingParticipantTabNum(tabNum);

      await kanbanApi.removeUserFromTeam({
        team_id: Number(currentTeam.id),
        tab_num: Number(tabNum),
      });

      const nextParticipantsCount = Math.max(currentTeam.participants.length - 1, 0);

      onTaskTeamChanged({
        taskId: Number(taskDetails.id),
        teamId: Number(currentTeam.id),
        participantsCount: nextParticipantsCount,
      });

      notifications.show({
        title: 'Успешно',
        message: 'Сотрудник удалён из команды',
        color: currentStatusColor,
        autoClose: 2000,
      });

      if (nextParticipantsCount === 0) {
        onClose();
        return;
      }

      await loadTaskDetails();
      await loadAvailableUsers();
    } catch (error) {
      console.error('Ошибка удаления сотрудника:', error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось удалить сотрудника',
        color: 'red',
      });
    } finally {
      setRemovingParticipantTabNum(null);
    }
  };

  const handleArchiveTask = async () => {
    if (!taskDetails) return;

    try {
      setArchiving(true);

      await kanbanApi.archiveTask(Number(taskDetails.id));

      onTaskArchived(Number(taskDetails.id));

      notifications.show({
        title: 'Успешно',
        message: 'Карточка отправлена в архив',
        color: currentStatusColor,
        autoClose: 2000,
      });

      onClose();
    } catch (error) {
      console.error('Ошибка архивирования карточки:', error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось архивировать карточку',
        color: 'red',
      });
    } finally {
      setArchiving(false);
    }
  };

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
          <ThemeIcon variant="light" color={currentStatusColor} radius="xl" size="lg">
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
          <Loader color={currentStatusColor} />
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

              <Stack gap="sm" align="flex-end">
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  color={currentStatusColor}
                >
                  {taskDetails.score} баллов
                </Badge>

                {canArchiveTask && (
                  <Button
                    size="xs"
                    radius="md"
                    variant="light"
                    color={currentStatusColor}
                    leftSection={<IconArchive size={14} />}
                    loading={archiving}
                    onClick={handleArchiveTask}
                  >
                    В архив
                  </Button>
                )}
              </Stack>
            </Group>
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
              <ThemeIcon variant="light" color={currentStatusColor} radius="xl">
                <IconUsers size={16} />
              </ThemeIcon>,
              'Команд',
              taskDetails.teams.length
            )}
          </Group>

          <Divider />

          {isBacklogView ? (
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

                    {team.participants.length > 0 ? (
                      <Stack gap="xs">
                        {team.participants.map((participant) => (
                          <Paper
                            key={participant.tab_num}
                            withBorder
                            radius="lg"
                            p="sm"
                            bg="#faf8ff"
                          >
                            <Text size="sm" fw={600}>
                              {participant.full_name}
                            </Text>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed">
                        Нет участников
                      </Text>
                    )}
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
                <Group justify="space-between" align="center" mb="xs">
                  <Text fw={700} size="lg">
                    Команда #{currentTeam.id}
                  </Text>

                  <Group gap="sm" align="flex-start">
                    <Badge variant="light" radius="sm">
                      {currentTeam.status}
                    </Badge>

                    {canEditTeam && (
                      <>
                        <Select
                          placeholder="Выбери сотрудника"
                          data={availableUsers.map((user) => ({
                            value: String(user.tab_num),
                            label: user.full_name,
                          }))}
                          value={selectedUserTabNum}
                          onChange={setSelectedUserTabNum}
                          size="xs"
                          radius="md"
                          searchable
                          nothingFoundMessage="Нет доступных сотрудников"
                          disabled={availableUsers.length === 0}
                          style={{ minWidth: 220 }}
                        />

                        <Button
                          size="xs"
                          radius="md"
                          color={currentStatusColor}
                          loading={addingParticipant}
                          disabled={!selectedUserTabNum}
                          onClick={handleAddParticipant}
                        >
                          Добавить сотрудника
                        </Button>
                      </>
                    )}
                  </Group>
                </Group>

                {currentTeam.participants.length > 0 ? (
                  <Stack gap="xs">
                    {currentTeam.participants.map((participant) => (
                      <Paper
                        key={participant.tab_num}
                        withBorder
                        radius="lg"
                        p="sm"
                        bg="#faf8ff"
                      >
                        <Group justify="space-between" align="center">
                          <Text size="sm" fw={600}>
                            {participant.full_name}
                          </Text>

                          {canEditTeam && (
                            <Button
                              size="xs"
                              radius="md"
                              color="red"
                              variant="light"
                              loading={removingParticipantTabNum === participant.tab_num}
                              onClick={() => handleRemoveParticipant(participant.tab_num)}
                            >
                              Удалить
                            </Button>
                          )}
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    Нет участников
                  </Text>
                )}
              </Paper>

              <Paper withBorder radius="xl" p="lg" bg="#ffffff">
                <Group justify="space-between" align="center" mb="md">
                  <Group gap="xs">
                    <ThemeIcon variant="light" color={currentStatusColor} radius="xl">
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
                      color={currentStatusColor}
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