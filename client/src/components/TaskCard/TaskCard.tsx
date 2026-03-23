import { Badge, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCalendar, IconFlame, IconUsers } from '@tabler/icons-react';
import type { KanbanStatus, KanbanTask } from '../../types/kanban';
import type { DragEvent } from 'react';

interface TaskCardProps {
  task: KanbanTask;
  onClick?: () => void;
  onDragStart?: (event: DragEvent<HTMLDivElement>, task: KanbanTask) => void;
}

// цвета статусов
const accentByStatus: Record<KanbanStatus, string> = {
  backlog: 'violet',
  inProgress: 'blue',
  review: 'yellow',
  done: 'teal',
};

// для правильных окончаний в баллах
function getScoreLabel(score: number): string {
  const mod10 = score % 10;
  const mod100 = score % 100;

  if (mod10 === 1 && mod100 !== 11) return 'балл';
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'балла';
  return 'баллов';
}

// статусы дедлайнов для отрисовки нужных иконок
type DeadlineState = 'normal' | 'warning' | 'overdue';

function getDeadlineState(deadlineFull: string): DeadlineState {

  // to do: такого не должно быть, добавил на время
  if (!deadlineFull) {
    return 'normal';
  }

  const today = new Date();
  const deadline = new Date(deadlineFull);

  // обнуляем время, чтобы сравнивать только дни, 
  // иначе может возникнуть коллизия, так как текущий день 
  // еще не является просроченным
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  // diffMs - разница в милисекундах, хотел считать сразу дни,
  // но в стандартном Date в JS нет метода, который вытаскивает сразу дни
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 5) return 'warning';

  return 'normal';
}

export default function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const color = accentByStatus[task.board_status];
  // состояние дедлайна
  const deadlineState = getDeadlineState(task.deadline_full);
  // не показывать дедлайн, если статус - готово
  const shouldShowDeadline = task.board_status !== 'done';

  return (
    <Paper
      withBorder
      radius="xl"
      p="md"
      shadow="sm"
      draggable
      onDragStart={(event) => onDragStart?.(event, task)}
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.96)',
        borderLeft: `6px solid var(--mantine-color-${color}-6)`,
        cursor: onClick || onDragStart ? 'pointer' : 'default',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
    >
      <Group justify="space-between" align="flex-start" gap="xs">
        <Text fw={800} fz={18} lh={1.2} style={{ flex: 1 }}>
          {task.name}
        </Text>

        <Badge variant="light" color={color} radius="sm">
          {task.score} {getScoreLabel(task.score)}
        </Badge>
      </Group>

      <Text c="dimmed" size="sm" mt={10} lineClamp={3}>
        {task.description || 'Без описания'}
      </Text>

      <Group justify="space-between" mt="md" align="center">
        {task.board_status !== 'backlog' ? (
          <Group gap="xs">
            <ThemeIcon variant="light" size="sm" radius="md" color="blue">
              <IconUsers size={14} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              {task.participants_count}/{task.quota}
            </Text>
          </Group>
        ) : (
          <div />
        )}

        {shouldShowDeadline ? (
          <Group gap="xs" align="center">
            <ThemeIcon variant="light" size="sm" radius="md" color="gray">
              <IconCalendar size={14} />
            </ThemeIcon>

            <Text
              size="sm"
              c={deadlineState === 'overdue' ? 'red' : 'dimmed'}
              fw={deadlineState === 'overdue' ? 700 : 400}
            >
              {task.deadline_short}
            </Text>

            {deadlineState === 'warning' && (
              <ThemeIcon variant="light" size="sm" radius="xl" color="orange">
                <IconFlame size={14} />
              </ThemeIcon>
            )}

            {deadlineState === 'overdue' && (
              <Badge
                color="red"
                variant="light"
                radius="sm"
                leftSection={<IconAlertCircle size={12} />}
              >
                Просрочено
              </Badge>
            )}
          </Group>
        ) : (
          <div />
        )}
      </Group>
    </Paper>
  );
}