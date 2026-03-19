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

import { useAppAuth } from '../../App';

// порядок ui-колонок для отображения столбцов (уже в нужном порядке)
const boardColumns: KanbanStatus[] = ['backlog', 'inProgress', 'review', 'done'];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [createTaskOpened, setCreateTaskOpened] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [taskDetailsOpened, setTaskDetailsOpened] = useState(false);
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
  const [isDroppingTask, setIsDroppingTask] = useState(false);

  const { currentUser } = useAppAuth();

  // пока создание задачи разрешено всем
  const canCreateTask =
    currentUser.role_name === 'Руководитель' ||
    currentUser.role_name === 'Администратор';

  // вынес загрузку доски в отдельную функцию,
  // чтобы потом можно было переиспользовать ее после действий:
  // взять задачу в работу, сменить статус, подтвердить выполнение
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

  // при первом открытии страницы просто загружаем доску
  useEffect(() => {
    loadTasks(true);
  }, []);

  const openCreateTaskModal = () => {
    setCreateTaskOpened(true);
  };

  const closeCreateTaskModal = () => {
    setCreateTaskOpened(false);
  };

  const openTaskDetailsModal = (task: KanbanTask) => {
    setSelectedTaskId(task.id);
    setSelectedTeamId(task.team_id);
    setTaskDetailsOpened(true);
  };

  const closeTaskDetailsModal = () => {
    setTaskDetailsOpened(false);
    setSelectedTaskId(null);
    setSelectedTeamId(null);
  };

  // локально обновляем только одну карточку после изменения команды,
  // чтобы не перезагружать всю доску и не было дергания
  const handleTaskTeamChanged = ({
    taskId,
    teamId,
    participantsCount,
  }: {
    taskId: number;
    teamId: number | null;
    participantsCount: number;
  }) => {
    setTasks((prev) => {
      // если удалили последнего участника:
      // 1) убираем карточку конкретной команды
      // 2) добавляем backlog-карточку, если её ещё нет
      if (participantsCount === 0) {
        const filteredTasks = prev.filter(
          (task) =>
            !(
              Number(task.id) === Number(taskId) &&
              Number(task.team_id) === Number(teamId)
            )
        );

        const hasBacklogCard = filteredTasks.some(
          (task) =>
            Number(task.id) === Number(taskId) &&
            task.board_status === 'backlog' &&
            task.team_id == null
        );

        if (hasBacklogCard) {
          return filteredTasks;
        }

        const sourceTask = prev.find(
          (task) =>
            Number(task.id) === Number(taskId) &&
            Number(task.team_id) === Number(teamId)
        );

        if (!sourceTask) {
          return filteredTasks;
        }

        return [
          {
            ...sourceTask,
            board_status: 'backlog',
            team_id: null,
            participants_count: 0,
          },
          ...filteredTasks,
        ];
      }

      // если участники ещё остались — просто обновляем счетчик
      return prev.map((task) => {
        if (Number(task.id) !== Number(taskId)) {
          return task;
        }

        if (Number(task.team_id) !== Number(teamId)) {
          return task;
        }

        return {
          ...task,
          participants_count: participantsCount,
        };
      });
    });
  };

  const handleTaskArchived = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => Number(task.id) !== Number(taskId)));
  };

  // обработчик отправки формы создания карточки
  const handleCreateTaskSubmit = async (values: CreateTaskPayload) => {
    try {
      const createdTask = await kanbanApi.createTask(values);

      setTasks((prev) => [createdTask, ...prev]);
      setCreateTaskOpened(false);

      notifications.show({
        title: 'Успешно',
        message: 'Задача создана',
        autoClose: 2000,
        color: 'violet',
      });
    } catch (err) {
      console.error('Ошибка создания карточки:', err);

      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать задачу',
      });
    }
  };

  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task);
  };

  const handleDropTask = async (targetStatus: KanbanStatus) => {
    if (!draggedTask || isDroppingTask) return;

    if (draggedTask.board_status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    const isAllowedTransition =
      (draggedTask.board_status === 'backlog' && targetStatus === 'inProgress') ||
      (draggedTask.board_status === 'inProgress' &&
        (targetStatus === 'backlog' || targetStatus === 'review')) ||
      (draggedTask.board_status === 'review' &&
        (targetStatus === 'inProgress' || targetStatus === 'done')) ||
      (draggedTask.board_status === 'done' && targetStatus === 'review');

    if (!isAllowedTransition) {
      setDraggedTask(null);
      return;
    }

    try {
      setIsDroppingTask(true);

      if (draggedTask.board_status === 'backlog' && targetStatus === 'inProgress') {
        await kanbanApi.takeTask({
          task_id: draggedTask.id,
          participants: [currentUser.tab_num],
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача взята в работу',
          autoClose: 2000,
          color: 'violet',
        });
      } else if (draggedTask.board_status === 'inProgress' && targetStatus === 'backlog') {
        await kanbanApi.returnTaskToBacklog({
          task_id: draggedTask.id,
          team_id: draggedTask.team_id!,
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача возвращена в бэклог',
          autoClose: 2000,
          color: 'violet',
        });
      } else if (draggedTask.board_status === 'inProgress' && targetStatus === 'review') {
        await kanbanApi.changeTeamStatus({
          team_id: draggedTask.team_id!,
          status: 'review',
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача переведена на проверку',
          autoClose: 2000,
          color: 'violet',
        });
      } else if (draggedTask.board_status === 'review' && targetStatus === 'inProgress') {
        await kanbanApi.changeTeamStatus({
          team_id: draggedTask.team_id!,
          status: 'inProgress',
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача возвращена в работу',
          autoClose: 2000,
          color: 'violet',
        });
      } else if (draggedTask.board_status === 'review' && targetStatus === 'done') {
        await kanbanApi.changeTeamStatus({
          team_id: draggedTask.team_id!,
          status: 'done',
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача завершена',
          autoClose: 2000,
          color: 'violet',
        });
      } else if (draggedTask.board_status === 'done' && targetStatus === 'review') {
        await kanbanApi.changeTeamStatus({
          team_id: draggedTask.team_id!,
          status: 'review',
        });

        await loadTasks();

        notifications.show({
          title: 'Успешно',
          message: 'Задача возвращена на проверку',
          autoClose: 2000,
          color: 'violet',
        });
      }
    } catch (error) {
      console.error('Ошибка изменения статуса задачи:', error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось изменить статус задачи',
        color: 'red',
      });
    } finally {
      setDraggedTask(null);
      setIsDroppingTask(false);
    }
  };

  // группируем задачи по статусам для отображения в колонках
  const groupedTasks = {
    backlog: [] as KanbanTask[],
    inProgress: [] as KanbanTask[],
    review: [] as KanbanTask[],
    done: [] as KanbanTask[],
  };

  tasks.forEach((task) => {
    groupedTasks[task.board_status].push(task);
  });

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
        onCreateTaskClick={openCreateTaskModal}
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
                    // одна и та же задача может встречаться несколько раз:
                    // как backlog-карточка и как карточка конкретной команды,
                    // поэтому ключ сделал составной
                    key={`${task.id}-${task.team_id ?? 'backlog'}`}
                    task={task}
                    onClick={() => openTaskDetailsModal(task)}
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
        onClose={closeCreateTaskModal}
        onSubmit={handleCreateTaskSubmit}
      />

      <TaskDetailsModal
        opened={taskDetailsOpened}
        taskId={selectedTaskId}
        teamId={selectedTeamId}
        onClose={closeTaskDetailsModal}
        onTaskTeamChanged={handleTaskTeamChanged}
        onTaskArchived={handleTaskArchived}
      />
    </Box>
  );
}