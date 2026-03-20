import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import {
  IconCalendar,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react';

interface TaskInfoCardsProps {
  deadline: string;
  quota: string | number;
  teamsCount: number;
  currentStatusColor: string;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <Paper withBorder radius="xl" p="md">
      <Group gap="xs" mb="xs">
        {icon}
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>

      <Text fw={700}>{value}</Text>
    </Paper>
  );
}

export default function TaskInfoCards({
  deadline,
  quota,
  teamsCount,
  currentStatusColor,
}: TaskInfoCardsProps) {
  return (
    <Group grow align="stretch">
      <InfoCard
        icon={
          <ThemeIcon variant="light" color="gray" radius="xl">
            <IconCalendar size={16} />
          </ThemeIcon>
        }
        label="Дедлайн"
        value={deadline}
      />

      <InfoCard
        icon={
          <ThemeIcon variant="light" color="blue" radius="xl">
            <IconTargetArrow size={16} />
          </ThemeIcon>
        }
        label="Квота"
        value={quota}
      />

      <InfoCard
        icon={
          <ThemeIcon variant="light" color={currentStatusColor} radius="xl">
            <IconUsers size={16} />
          </ThemeIcon>
        }
        label="Команд"
        value={teamsCount}
      />
    </Group>
  );
}