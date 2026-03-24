import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanTaskDetails } from '../../types/kanban';

import TaskDetailsHero from './TaskDetailsHero';
import TaskInfoCards from './TaskInfoCards';

interface TaskEditableSectionProps {
  taskDetails: KanbanTaskDetails;
  currentStatusColor: string;

  canEditTask: boolean;

  canArchiveTask: boolean;
  archiving: boolean;
  onArchive: () => void;

  canReviewTeam: boolean;
  reviewLoading: boolean;
  onApprove: () => void;
  onReturnToWork: () => void;

  reloadTaskDetails: () => Promise<void>;
  onTaskChanged: () => void | Promise<void>;
}

export default function TaskEditableSection({
  taskDetails,
  currentStatusColor,
  canEditTask,
  canArchiveTask,
  archiving,
  onArchive,
  canReviewTeam,
  reviewLoading,
  onApprove,
  onReturnToWork,
  reloadTaskDetails,
  onTaskChanged,
}: TaskEditableSectionProps) {
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editQuota, setEditQuota] = useState('');
  const [editScore, setEditScore] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);

  useEffect(() => {
    setIsEditingTask(false);
    setEditName('');
    setEditDescription('');
    setEditDeadline('');
    setEditQuota('');
    setEditScore('');
    setTaskSaving(false);
  }, [taskDetails.id]);

  const handleStartTaskEdit = () => {
    setEditName(taskDetails.name ?? '');
    setEditDescription(taskDetails.description ?? '');
    setEditDeadline(taskDetails.deadline_full?.split(' ')[0] ?? '');
    setEditQuota(String(taskDetails.quota ?? ''));
    setEditScore(String(taskDetails.score ?? ''));
    setIsEditingTask(true);
  };

  const handleCancelTaskEdit = () => {
    setIsEditingTask(false);
  };

  const handleSaveTask = async () => {
    const trimmedName = editName.trim();
    const trimmedDescription = editDescription.trim();
    const trimmedDeadline = editDeadline.trim();

    if (!trimmedName || !trimmedDescription) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заполните название и описание',
        color: 'red',
      });
      return;
    }

    if (!trimmedDeadline) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите дедлайн',
        color: 'red',
      });
      return;
    }

    try {
      setTaskSaving(true);

      await kanbanApi.updateTask({
        task_id: Number(taskDetails.id),
        name: trimmedName,
        description: trimmedDescription,
        score: Number(editScore),
        quota: Number(editQuota),
        deadline: trimmedDeadline,
      });

      setIsEditingTask(false);
      await reloadTaskDetails();
      await onTaskChanged();

      notifications.show({
        title: 'Успешно',
        message: 'Карточка обновлена',
        color: 'teal',
        autoClose: 1400,
      });
    } catch (error) {
      console.error('Ошибка обновления карточки:', error);

      notifications.show({
        title: 'Ошибка',
        message: error instanceof Error ? error.message : 'Не удалось обновить карточку',
        color: 'red',
      });
    } finally {
      setTaskSaving(false);
    }
  };

  return (
    <>
      <TaskDetailsHero
        title={taskDetails.name}
        description={taskDetails.description}
        score={taskDetails.score}
        currentStatusColor={currentStatusColor}
        canArchiveTask={canArchiveTask}
        archiving={archiving}
        onArchive={onArchive}
        canReviewTeam={canReviewTeam}
        reviewLoading={reviewLoading}
        onApprove={onApprove}
        onReturnToWork={onReturnToWork}
        canEditTask={canEditTask}
        isEditingTask={isEditingTask}
        editName={editName}
        editDescription={editDescription}
        editScore={editScore}
        taskSaving={taskSaving}
        onStartEdit={handleStartTaskEdit}
        onCancelEdit={handleCancelTaskEdit}
        onSaveEdit={handleSaveTask}
        onEditNameChange={setEditName}
        onEditDescriptionChange={setEditDescription}
        onEditScoreChange={setEditScore}
      />

      <TaskInfoCards
        deadline={taskDetails.deadline_full?.split(' ')[0] || '-'}
        quota={taskDetails.quota}
        teamsCount={taskDetails.teams.length}
        currentStatusColor={currentStatusColor}
        approvedByName={taskDetails.approved_by_name}
        approvedAt={taskDetails.approved_at}
        isEditingTask={isEditingTask}
        editDeadline={editDeadline}
        editQuota={editQuota}
        onEditDeadlineChange={setEditDeadline}
        onEditQuotaChange={setEditQuota}
      />
    </>
  );
}