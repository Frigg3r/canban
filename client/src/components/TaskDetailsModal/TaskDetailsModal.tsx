import { useEffect, useState } from 'react';
import {
  Badge,
  Divider,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconChecklist } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type {
  KanbanComment,
  KanbanTaskDetails,
  KanbanAvailableUser,
} from '../../types/kanban';

import TaskCommentsSection from './TaskCommentsSection';
import TaskTeamSection from './TaskTeamSection';
import TaskDetailsHero from './TaskDetailsHero';
import TaskInfoCards from './TaskInfoCards';
import { statusColor, statusLabel } from './taskDetails.constants';
import {
  getCanArchiveTask,
  getCanCommentCurrentTeam,
  getCanDeleteComment,
  getCanEditTeam,
  getCanRemoveParticipant,
  getCanSubmitComment,
} from './taskDetails.permissions';
import { useAppAuth } from '../../App';

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

export default function TaskDetailsModal({
  opened,
  taskId,
  teamId,
  onClose,
  onTaskTeamChanged,
  onTaskArchived,
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

  const { currentUser } = useAppAuth();

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

  const currentTeam = (() => {
    if (!taskDetails || isBacklogView) {
      return null;
    }

    return taskDetails.teams.find((team) => Number(team.id) === Number(teamId)) ?? null;
  })();

  const currentStatusKey = currentTeam?.status ?? taskDetails?.board_status ?? 'backlog';
  const currentStatusColor = statusColor[currentStatusKey] || 'gray';
  const trimmedComment = commentText.trim();

  const canArchiveTask = getCanArchiveTask(currentUser, currentStatusKey);
  const canCommentCurrentTeam = getCanCommentCurrentTeam(currentTeam, currentUser);
  const canEditTeam = getCanEditTeam(isBacklogView, currentTeam, canCommentCurrentTeam);

  const canRemoveParticipant = (tabNum: number) =>
    getCanRemoveParticipant(currentUser, tabNum);

  const canSubmitComment = getCanSubmitComment(
    currentTeam,
    canCommentCurrentTeam,
    trimmedComment,
    commentLoading
  );

  const canDeleteComment = (comment: KanbanComment) =>
    getCanDeleteComment(comment, currentUser);

  const handleAddComment = async () => {
    if (!currentTeam || !trimmedComment) return;

    try {
      setCommentLoading(true);

      const createdComment = await kanbanApi.addComment({
        team_id: currentTeam.id,
        text: trimmedComment,
        author_tab_num: currentUser.tab_num,
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

  const handleDeleteComment = async (comment: KanbanComment) => {
    if (!currentTeam) return;

    if (!canDeleteComment(comment)) {
      notifications.show({
        title: 'Ошибка',
        message: 'Удалять комментарий может только автор',
        color: 'red',
      });
      return;
    }

    try {
      setDeletingCommentId(comment.id);
      await kanbanApi.deleteComment(comment.id);

      setTaskDetails((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          teams: prev.teams.map((team) =>
            team.id === currentTeam.id
              ? {
                ...team,
                comments: team.comments.filter((item) => item.id !== comment.id),
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

    const team = currentTeam;
    const details = taskDetails;

    if (team.participants.length >= Number(details.quota)) {
      notifications.show({
        title: 'Лимит участников',
        message: 'Нельзя добавить сотрудника: квота команды уже заполнена',
        color: 'red',
      });
      return;
    }

    try {
      setAddingParticipant(true);

      await kanbanApi.addUserToTeam({
        team_id: team.id,
        tab_num: Number(selectedUserTabNum),
      });

      const nextParticipantsCount = team.participants.length + 1;

      onTaskTeamChanged({
        taskId: details.id,
        teamId: team.id,
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
    if (!currentTeam || !taskDetails || !canRemoveParticipant(tabNum)) return;

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
          <TaskDetailsHero
            title={taskDetails.name}
            description={taskDetails.description}
            score={taskDetails.score}
            currentStatusColor={currentStatusColor}
            canArchiveTask={canArchiveTask}
            archiving={archiving}
            onArchive={handleArchiveTask}
          />

          <TaskInfoCards
            deadline={taskDetails.deadline_full?.split(' ')[0] || '-'}
            quota={taskDetails.quota}
            teamsCount={taskDetails.teams.length}
            currentStatusColor={currentStatusColor}
          />

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
                        {statusLabel[team.status]}
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
              <TaskTeamSection
                team={currentTeam}
                statusLabel={statusLabel}
                currentStatusColor={currentStatusColor}
                availableUsers={availableUsers}
                selectedUserTabNum={selectedUserTabNum}
                addingParticipant={addingParticipant}
                removingParticipantTabNum={removingParticipantTabNum}
                canEditTeam={canEditTeam}
                canRemoveParticipant={canRemoveParticipant}
                onSelectedUserChange={setSelectedUserTabNum}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />

              <TaskCommentsSection
                currentStatusColor={currentStatusColor}
                comments={currentTeam.comments}
                commentText={commentText}
                commentLoading={commentLoading}
                deletingCommentId={deletingCommentId}
                canCommentCurrentTeam={canCommentCurrentTeam}
                canSubmitComment={canSubmitComment}
                onCommentTextChange={setCommentText}
                onAddComment={handleAddComment}
                canDeleteComment={canDeleteComment}
                onDeleteComment={handleDeleteComment}
              />
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