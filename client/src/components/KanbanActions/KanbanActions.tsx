import { Button, Group } from '@mantine/core';
import { IconGift } from '@tabler/icons-react';

interface KanbanActionsProps {
  canCreateTask: boolean;
  onCreateTaskClick: () => void;
  onCreateUserClick: () => void;
  onDonateClick: () => void; 
}

export default function KanbanActions({
  canCreateTask,
  onCreateTaskClick,
  onCreateUserClick,
  onDonateClick,
}: KanbanActionsProps) {
  return (
    <Group justify="space-between" mb="md">
      <Group justify="flex-start">
        {canCreateTask && (
          <>
            <Button
              radius="md"
              size="sm"
              onClick={onCreateTaskClick}
              styles={{
                root: {
                  background: 'linear-gradient(135deg, #602AF2 0%, #9f72ff 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 500,
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
                  background: 'linear-gradient(135deg, #009573 0%, #21bb97 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 500,
                  paddingInline: '14px',
                },
              }}
            >
              Добавить сотрудника
            </Button>
          </>
        )}
      </Group>

      <Button
        radius="md"
        size="sm"
        variant="light"
        color="violet"
        leftSection={<IconGift size={16} />}
        onClick={onDonateClick}
      >
        Поблагодарить коллегу
      </Button>
    </Group>
  );
}