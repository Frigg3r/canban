import { Button, Group } from '@mantine/core';

interface KanbanActionsProps {
  canCreateTask: boolean;
  onCreateTaskClick: () => void;
}

export default function KanbanActions({
  canCreateTask,
  onCreateTaskClick,
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
    </Group>
  );
}