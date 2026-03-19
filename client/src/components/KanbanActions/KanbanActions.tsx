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
          color="violet"
          radius="md"
          size="sm"
          onClick={onCreateTaskClick}
          styles={{
            root: {
              backgroundColor: '#7950F2',
              fontWeight: 600,
              paddingInline: '14px',
            },
            label: {
              color: '#ffffff',
            },
          }}
        >
          Добавить карточку
        </Button>
      )}
    </Group>
  );
}