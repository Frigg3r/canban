import { useEffect, useState } from 'react';
import { Box, Center, Grid, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { CreateTaskPayload, KanbanStatus, KanbanTask } from '../../types/kanban';

import KanbanHeader from '../KanbanHeader/KanbanHeader';
import KanbanActions from '../KanbanActions/KanbanActions';
import styles from './KanbanBoard.module.css';
import KanbanColumn from '../KanbanColumn/KanbanColumn';
import TaskCard from '../TaskCard/TaskCard';
import CreateTaskModal from '../CreateTaskModal/CreateTaskModal';
import TaskDetailsModal from '../TaskDetailsModal/TaskDetailsModal';

import CreateUserModal from '../CreateUserModal/CreateUserModal';

import { useAppAuth } from '../../App';

const boardColumns: KanbanStatus[] = ['backlog', 'inProgress', 'review', 'done'];

const showSuccess = (message: string) => {
  notifications.show({
    title: 'Успешно',
    message,
    autoClose: 2000,
    color: 'violet',
  });
};

const showError = (message: string) => {
  notifications.show({
    title: 'Ошибка',
    message,
    color: 'red',
  });
};

// группируем карточки по статусам
const groupTasksByStatus = (tasks: KanbanTask[]) => {
  return {
    backlog: tasks.filter((task) => task.board_status === 'backlog'),
    inProgress: tasks.filter((task) => task.board_status === 'inProgress'),
    review: tasks.filter((task) => task.board_status === 'review'),
    done: tasks.filter((task) => task.board_status === 'done'),
  };
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createTaskOpened, setCreateTaskOpened] = useState(false);
  const [createUserOpened, setCreateUserOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{
    taskId: number;
    teamId: number | null;
  } | null>(null);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [isDroppingTask, setIsDroppingTask] = useState(false);

  const { currentUser } = useAppAuth();

  const isManager =
    currentUser.role_name === 'Руководитель' ||
    currentUser.role_name === 'Администратор';

  const canCreateTask = isManager;

  const loadTasks = async (withLoader = false) => {
    try {
      if (withLoader) {
        setLoading(true);
      }

      setError('');
      const data = await kanbanApi.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      if (withLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTasks(true);
  }, []);

  const runDropAction = async (
    action: () => Promise<unknown>,
    successMessage: string
  ) => {
    await action();
    await loadTasks();
    showSuccess(successMessage);
  };

  const handleTaskTeamChanged = async ({
    taskId,
    teamId,
    participantsCount,
  }: {
    taskId: number;
    teamId: number | null;
    participantsCount: number;
  }) => {
    if (participantsCount === 0) {
      await loadTasks();
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId && task.team_id === teamId
          ? { ...task, participants_count: participantsCount }
          : task
      )
    );
  };

  // скрываем архивированную карточку
  const handleTaskArchived = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => Number(task.id) !== Number(taskId)));
  };

  // при создании задачи
  const handleCreateTaskSubmit = async (values: CreateTaskPayload) => {
    try {
      const createdTask = await kanbanApi.createTask(values);

      setTasks((prev) => [createdTask, ...prev]);
      setCreateTaskOpened(false);

      showSuccess('Задача создана');
    } catch (err) {
      console.error('Ошибка создания карточки:', err);
      showError('Не удалось создать задачу');
    }
  };

  // для запоминания карточки, которую тащим
  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task);
  };

  // перенос карточки
  const handleDropTask = async (targetStatus: KanbanStatus) => {
    if (!draggedTask || isDroppingTask) {
      return;
    }

    if (draggedTask.board_status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    const isManager =
      currentUser.role_name === 'Руководитель' ||
      currentUser.role_name === 'Администратор';

    try {
      setIsDroppingTask(true);

      if (draggedTask.board_status === 'backlog' && targetStatus === 'inProgress') {
        await runDropAction(
          () =>
            kanbanApi.takeTask({
              task_id: draggedTask.id,
              participants: [currentUser.tab_num],
            }),
          'Задача взята в работу'
        );
        return;
      }

      if (draggedTask.board_status === 'inProgress' && targetStatus === 'backlog') {
        if (!isManager) {
          const taskDetails = await kanbanApi.getTaskDetails(
            draggedTask.id,
            draggedTask.team_id
          );

          const currentTeam =
            taskDetails.teams.find(
              (team) => Number(team.id) === Number(draggedTask.team_id)
            ) ?? null;

          const isParticipant =
            currentTeam?.participants.some(
              (participant) =>
                Number(participant.tab_num) === Number(currentUser.tab_num)
            ) ?? false;

          if (!isParticipant) {
            showError(
              'Вернуть задачу в бэклог может только участник, администратор или руководитель'
            );
            return;
          }
        }

        await runDropAction(
          () =>
            kanbanApi.returnTaskToBacklog({
              task_id: draggedTask.id,
              team_id: draggedTask.team_id!,
            }),
          'Задача возвращена в бэклог'
        );
      }
    } catch (err) {
      console.error('Ошибка изменения статуса задачи:', err);

      showError(
        err instanceof Error ? err.message : 'Не удалось изменить статус задачи'
      );
    } finally {
      setDraggedTask(null);
      setIsDroppingTask(false);
    }
  };

  const groupedTasks = groupTasksByStatus(tasks);

  if (loading) {
    return (
      <Center h={400}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={400}>
        <Text c="red">{error}</Text>
      </Center>
    );
  }

  return (
    <Box className={styles.boardPage}>
      <KanbanHeader />

      <KanbanActions
        canCreateTask={canCreateTask}
        onCreateTaskClick={() => setCreateTaskOpened(true)}
        onCreateUserClick={() => setCreateUserOpened(true)}
      />

      <Grid gutter="md" align="stretch">
        {boardColumns.map((status) => (
          <Grid.Col key={status} span={{ base: 12, md: 6, lg: 3 }}>
            <KanbanColumn
              status={status}
              count={groupedTasks[status].length}
              onDropTask={handleDropTask}
            >
              {groupedTasks[status].length > 0 ? (
                groupedTasks[status].map((task) => (
                  <TaskCard
                    key={`${task.id}-${task.team_id ?? 'backlog'}`}
                    task={task}
                    onClick={() =>
                      setSelectedTask({
                        taskId: task.id,
                        teamId: task.team_id,
                      })
                    }
                    onDragStart={(_, draggedTask) => handleDragStart(draggedTask)}
                  />
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  Пока задач нет
                </Text>
              )}
            </KanbanColumn>
          </Grid.Col>
        ))}
      </Grid>

      <CreateTaskModal
        opened={createTaskOpened}
        onClose={() => setCreateTaskOpened(false)}
        onSubmit={handleCreateTaskSubmit}
      />

      <CreateUserModal
        opened={createUserOpened}
        onClose={() => setCreateUserOpened(false)}
      />

      <TaskDetailsModal
        opened={selectedTask !== null}
        taskId={selectedTask?.taskId ?? null}
        teamId={selectedTask?.teamId ?? null}
        onClose={() => setSelectedTask(null)}
        onTaskTeamChanged={handleTaskTeamChanged}
        onTaskArchived={handleTaskArchived}
      />
    </Box>
  );
}