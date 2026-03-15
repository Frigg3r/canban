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
      {canCreateTask && (
        <Button
          variant="outline"
          color="violet"
          radius="md"
          size="sm"
          onClick={onCreateTaskClick}
          styles={{
            root: {
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              borderWidth: '1.5px',
              fontWeight: 600,
              paddingInline: '14px',
            },
            label: {
              color: '#111827',
            },
          }}
        >
          Добавить карточку
        </Button>
      )}
    </Group>
  );
}