import { Button, Group } from '@mantine/core';

interface KanbanActionsProps {
  canCreateTask: boolean;
  onCreateTaskClick: () => void;
  onCreateUserClick: () => void;
}

export default function KanbanActions({
  canCreateTask,
  onCreateTaskClick,
  onCreateUserClick,
}: KanbanActionsProps) {
  if (!canCreateTask) {
    return null;
  }

  return (
    <Group justify="flex-start" mb="md">
      <Button
        color="violet"
        radius="md"
        size="sm"
        onClick={onCreateTaskClick}
        styles={{
          root: {
            fontWeight: 600,
            paddingInline: '14px',
          },
        }}
      >
        Добавить карточку
      </Button>

      <Button
        color="green"
        radius="md"
        size="sm"
        onClick={onCreateUserClick}
        styles={{
          root: {
            fontWeight: 600,
            paddingInline: '14px',
          },
        }}
      >
        Добавить сотрудника
      </Button>
    </Group>
  );
}