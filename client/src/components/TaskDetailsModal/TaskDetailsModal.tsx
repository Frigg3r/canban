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
import TaskEditableSection from './TaskEditableSection';
import { statusColor, statusLabel } from './taskDetails.constants';
import {
  getCanArchiveTask,
  getCanCommentCurrentTeam,
  getCanDeleteComment,
  getCanEditTask,
  getCanEditTeam,
  getCanRemoveParticipant,
  getCanSubmitComment,
  getCanReviewTeam,
  getCanEditQuota,
} from './taskDetails.permissions';
import { useAppAuth } from '../../app-auth';

interface TaskDetailsModalProps {
  opened: boolean;
  taskId: number | null;
  teamId: number | null;
  onClose: () => void;
  onTaskChanged: () => void | Promise<void>;
  onTaskArchived: (taskId: number) => void;
}

export default function TaskDetailsModal({
  opened,
  taskId,
  teamId,
  onClose,
  onTaskChanged,
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
  const [reviewLoading, setReviewLoading] = useState(false);

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
    if (taskId == null || teamId == null) {
      return;
    }

    try {
      const data = await kanbanApi.getTeamCandidates(taskId);
      setAvailableUsers(data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  useEffect(() => {
    if (!opened || taskId == null) {
      return;
    }

    loadTaskDetails();

    if (teamId == null) {
      setAvailableUsers([]);
      return;
    }

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

  const currentTeam =
    !taskDetails || isBacklogView
      ? null
      : taskDetails.teams.find((team) => Number(team.id) === Number(teamId)) ?? null;

  const openedColumnStatus =
    isBacklogView
      ? 'backlog'
      : currentTeam?.status ?? taskDetails?.board_status ?? 'backlog';

  const currentStatusKey = openedColumnStatus;
  const currentStatusColor = statusColor[currentStatusKey] || 'gray';
  const trimmedComment = commentText.trim();

  const canArchiveTask = getCanArchiveTask(currentUser, currentStatusKey);
  const canEditTask = getCanEditTask(currentUser);
  const canEditQuota = getCanEditQuota(taskDetails?.board_status ?? 'backlog');

  const canCommentCurrentTeam = getCanCommentCurrentTeam(currentTeam, currentUser);
  const canEditTeam = getCanEditTeam(isBacklogView, currentTeam, canCommentCurrentTeam);
  const canReviewTeam = getCanReviewTeam(currentUser, currentTeam);

  const isApprovedTeam =
    Boolean(currentTeam && Number(taskDetails?.approved_team_id) === Number(currentTeam.id));

  const canRemoveParticipant = (tabNum: number) =>
    getCanRemoveParticipant(currentUser, tabNum);

  const canSubmitComment = getCanSubmitComment(
    canCommentCurrentTeam,
    trimmedComment,
    commentLoading
  );

  const canDeleteComment = (comment: KanbanComment) =>
    getCanDeleteComment(comment, currentUser);

  type RunTaskActionParams = {
    action: () => Promise<void>;
    successMessage: string;
    errorMessage: string;
    successColor?: string;
    before?: () => void;
    afterSuccess?: () => void | Promise<void>;
    finallyAction?: () => void;
  };

  const runTaskAction = async ({
    action,
    successMessage,
    errorMessage,
    successColor = currentStatusColor,
    before,
    afterSuccess,
    finallyAction,
  }: RunTaskActionParams) => {
    try {
      before?.();
      await action();
      await afterSuccess?.();

      notifications.show({
        title: 'Успешно',
        message: successMessage,
        color: successColor,
        autoClose: 1400,
      });
    } catch (error) {
      console.error(error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : errorMessage,
        color: 'red',
      });
    } finally {
      finallyAction?.();
    }
  };

  const handleAddComment = async () => {
    if (!currentTeam || !trimmedComment) return;

    await runTaskAction({
      before: () => setCommentLoading(true),
      action: async () => {
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
      },
      afterSuccess: () => {
        setCommentText('');
      },
      successMessage: 'Комментарий добавлен',
      errorMessage: 'Не удалось добавить комментарий',
      finallyAction: () => setCommentLoading(false),
    });
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

    await runTaskAction({
      before: () => setDeletingCommentId(comment.id),
      action: async () => {
        await kanbanApi.deleteComment(comment.id);
      },
      afterSuccess: () => {
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
      },
      successMessage: 'Комментарий удалён',
      errorMessage: 'Не удалось удалить комментарий',
      finallyAction: () => setDeletingCommentId(null),
    });
  };

  const handleAddParticipant = async () => {
    if (!currentTeam || !selectedUserTabNum || !taskDetails) return;

    const teamIdValue = Number(currentTeam.id);
    const selectedTabNum = Number(selectedUserTabNum);

    if (currentTeam.participants.length >= Number(taskDetails.quota)) {
      notifications.show({
        title: 'Лимит участников',
        message: 'Нельзя добавить сотрудника: квота команды уже заполнена',
        color: 'red',
      });
      return;
    }

    const addedUser = availableUsers.find(
      (user) => Number(user.tab_num) === selectedTabNum
    );

    if (!addedUser) return;

    await runTaskAction({
      before: () => setAddingParticipant(true),
      action: async () => {
        await kanbanApi.addUserToTeam({
          team_id: teamIdValue,
          tab_num: selectedTabNum,
        });
      },
      afterSuccess: async () => {
        setTaskDetails((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            teams: prev.teams.map((team) =>
              Number(team.id) === teamIdValue
                ? {
                  ...team,
                  participants: [
                    ...team.participants,
                    {
                      tab_num: addedUser.tab_num,
                      fio: addedUser.fio,
                    },
                  ],
                }
                : team
            ),
          };
        });

        setAvailableUsers((prev) =>
          prev.filter((user) => Number(user.tab_num) !== selectedTabNum)
        );

        setSelectedUserTabNum(null);

        await onTaskChanged();
      },
      successMessage: 'Сотрудник добавлен в команду',
      errorMessage: 'Не удалось добавить сотрудника',
      finallyAction: () => setAddingParticipant(false),
    });
  };

  const handleApproveTeam = async () => {
    if (!currentTeam || !canReviewTeam) return;

    await runTaskAction({
      before: () => setReviewLoading(true),
      action: async () => {
        await kanbanApi.approveTeamResult({
          team_id: Number(currentTeam.id),
          approved_by_tab_num: currentUser.tab_num,
        });
      },
      afterSuccess: async () => {
        setTaskDetails((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            board_status: 'done',
            teams: prev.teams.map((team) =>
              Number(team.id) === Number(currentTeam.id)
                ? { ...team, status: 'done' }
                : team
            ),
          };
        });

        await onTaskChanged();
      },
      successMessage: 'Карточка принята',
      errorMessage: 'Не удалось принять карточку',
      successColor: 'teal',
      finallyAction: () => setReviewLoading(false),
    });
  };

  const handleReturnToWork = async () => {
    if (!currentTeam || !canReviewTeam) return;

    await runTaskAction({
      before: () => setReviewLoading(true),
      action: async () => {
        await kanbanApi.changeTeamStatus({
          team_id: Number(currentTeam.id),
          status: 'inProgress',
        });
      },
      afterSuccess: async () => {
        setTaskDetails((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            board_status: 'inProgress',
            teams: prev.teams.map((team) =>
              Number(team.id) === Number(currentTeam.id)
                ? { ...team, status: 'inProgress' }
                : team
            ),
          };
        });

        await onTaskChanged();
      },
      successMessage: 'Карточка отправлена на доработку',
      errorMessage: 'Не удалось вернуть карточку в работу',
      successColor: 'blue',
      finallyAction: () => setReviewLoading(false),
    });
  };

  const handleRemoveParticipant = async (tabNum: number) => {
    if (!currentTeam || !canRemoveParticipant(tabNum)) return;

    const teamIdValue = Number(currentTeam.id);
    const nextParticipantsCount = Math.max(currentTeam.participants.length - 1, 0);

    await runTaskAction({
      before: () => setRemovingParticipantTabNum(tabNum),
      action: async () => {
        await kanbanApi.removeUserFromTeam({
          team_id: teamIdValue,
          tab_num: Number(tabNum),
        });
      },
      afterSuccess: async () => {
        setTaskDetails((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            teams: prev.teams.map((team) =>
              Number(team.id) === teamIdValue
                ? {
                  ...team,
                  participants: team.participants.filter(
                    (participant) => Number(participant.tab_num) !== Number(tabNum)
                  ),
                }
                : team
            ),
          };
        });

        await onTaskChanged();

        if (nextParticipantsCount === 0) {
          onClose();
          return;
        }

        await loadAvailableUsers();
      },
      successMessage: 'Сотрудник удалён из команды',
      errorMessage: 'Не удалось удалить сотрудника',
      finallyAction: () => setRemovingParticipantTabNum(null),
    });
  };

  const handleArchiveTask = async () => {
    if (!taskDetails) return;

    await runTaskAction({
      before: () => setArchiving(true),
      action: async () => {
        await kanbanApi.archiveTask(Number(taskDetails.id));
      },
      afterSuccess: () => {
        onTaskArchived(Number(taskDetails.id));
        onClose();
      },
      successMessage: 'Карточка отправлена в архив',
      errorMessage: 'Не удалось архивировать карточку',
      finallyAction: () => setArchiving(false),
    });
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
          <TaskEditableSection
            taskDetails={taskDetails}
            currentStatusColor={currentStatusColor}
            canEditTask={canEditTask}
            canEditQuota={canEditQuota}
            canArchiveTask={canArchiveTask}
            archiving={archiving}
            onArchive={handleArchiveTask}
            canReviewTeam={canReviewTeam}
            reviewLoading={reviewLoading}
            onApprove={handleApproveTeam}
            onReturnToWork={handleReturnToWork}
            reloadTaskDetails={loadTaskDetails}
            onTaskChanged={onTaskChanged}
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
                              {participant.fio}
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
                isApprovedTeam={isApprovedTeam}
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