import { Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import type { ReactNode, DragEvent } from 'react';
import type { KanbanStatus } from '../../types/kanban';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  status: KanbanStatus;
  count: number;
  children: ReactNode;
  onDropTask?: (targetStatus: KanbanStatus) => void;
}

const statusMeta: Record<KanbanStatus, { title: string; color: string }> = {
  backlog: {
    title: 'Бэклог',
    color: 'violet',
  },
  inProgress: {
    title: 'В работе',
    color: 'blue',
  },
  review: {
    title: 'На проверке',
    color: 'yellow',
  },
  done: {
    title: 'Готово',
    color: 'teal',
  },
};

// пропсы прокидываются из компонента KanbanBoard
export default function KanbanColumn({
  status,
  count,
  children,
  onDropTask,
}: KanbanColumnProps) {
  const meta = statusMeta[status];

  return (
    // стили, какие мог, вынес в отдельный файл, остались только динамические
    <Paper
      radius="xl"
      p="md"
      withBorder
      className={styles.column}
      style={{
        borderTop: `8px solid var(--mantine-color-${meta.color}-6)`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <ThemeIcon variant="light" color={meta.color} radius="md">
            <IconDots size={16} />
          </ThemeIcon>

          <Text fw={800} fz={18}>
            {meta.title}
          </Text>
        </Group>

        <Text size="sm" c="dimmed" fw={700}>
          {count}
        </Text>
      </Group>

      <Box
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
        }}
        onDrop={() => onDropTask?.(status)}
        style={{
          flex: 1,
          minHeight: 420,
        }}
      >
        {/* используем стек, чтобы расположить вертикально карточки */}
        <Stack gap="md">{children}</Stack>
      </Box>
    </Paper>
  );
}