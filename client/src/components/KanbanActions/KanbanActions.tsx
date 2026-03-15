import { Button, Group } from '@mantine/core';

interface KanbanActionsProps {
  canCreateTask: boolean;
  onCreateTaskClick: () => void;
}

export default function KanbanActions({
  canCreateTask,
  onCreateTaskClick,
}: KanbanActionsProps) {
  return (
    <Group justify="flex-start" mb="md">
      {/* флаг оставил сразу, чтобы потом легко скрыть кнопку по роли */}
      {canCreateTask && (
        <Button radius="xl" onClick={onCreateTaskClick}>
          Добавить карточку
        </Button>
      )}
    </Group>
  );
}
