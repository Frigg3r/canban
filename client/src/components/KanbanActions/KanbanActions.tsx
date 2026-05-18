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
        radius="md"
        size="sm"
        onClick={onCreateTaskClick}
        styles={{
          root: {
            background: 'linear-gradient(135deg, #602AF2 0%, #a981ff 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            paddingInline: '14px',
          },
        }}
      >
        Добавить карточку
      </Button>

      <Button
        radius="md"
        size="sm"
        onClick={onCreateUserClick}
        styles={{
          root: {
            background: 'linear-gradient(135deg, #009573 0%, #22CFA8 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            paddingInline: '14px',
          },
        }}
      >
        Добавить сотрудника
      </Button>
    </Group>
  );
}