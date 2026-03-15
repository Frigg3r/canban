import { Box, Center, Grid, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { kanbanApi } from '../../api/kanban';
import type { CreateTaskPayload, KanbanStatus, KanbanTask } from '../../types/kanban';
import KanbanColumn from '../KanbanColumn/KanbanColumn';
import TaskCard from '../TaskCard/TaskCard';
import styles from './KanbanBoard.module.css';
import KanbanHeader from '../KanbanHeader/KanbanHeader';
import { notifications } from '@mantine/notifications';
import KanbanActions from '../KanbanActions/KanbanActions';
import CreateTaskModal from '../CreateTaskModal/CreateTaskModal';

// порядок ui-колонок для отображения столбцов (уже в нужном порядке)
const boardColumns: KanbanStatus[] = ['backlog', 'inProgress', 'review', 'done'];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [createTaskOpened, setCreateTaskOpened] = useState(false);

  // пока создание задачи разрешено всем
  const canCreateTask = true;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await kanbanApi.getTasks();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const openCreateTaskModal = () => {
    setCreateTaskOpened(true);
  };

  const closeCreateTaskModal = () => {
    setCreateTaskOpened(false);
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
            >
              {groupedTasks[status].length > 0 ? (
                groupedTasks[status].map((task) => (
                  <TaskCard key={task.id} task={task} />
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
    </Box>
  );
}