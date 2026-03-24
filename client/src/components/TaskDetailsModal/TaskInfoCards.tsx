import { Group, Paper, Text, ThemeIcon, TextInput, NumberInput } from '@mantine/core';
import {
  IconCalendar,
  IconTargetArrow,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';

import styles from './TaskDetailsModal.module.css';

interface TaskInfoCardsProps {
  deadline: string;
  quota: string | number;
  teamsCount: number;
  currentStatusColor: string;
  approvedByName: string | null;
  approvedAt: string | null;

  isEditingTask: boolean;
  editDeadline: string;
  editQuota: string;
  onEditDeadlineChange: (value: string) => void;
  onEditQuotaChange: (value: string) => void;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

interface ApprovalPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
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

function ApprovalPill({ icon, label, value }: ApprovalPillProps) {
  return (
    <Paper
      withBorder
      radius="xl"
      px="md"
      py="xs"
      bg="#f6fcf8"
      className={styles.approvalPill}
    >
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="light" color="teal" radius="xl" size="sm">
          {icon}
        </ThemeIcon>

        <Text size="sm" c="dimmed">
          {label}
        </Text>

        <Text size="sm" fw={600}>
          {value}
        </Text>
      </Group>
    </Paper>
  );
}

export default function TaskInfoCards({
  deadline,
  quota,
  teamsCount,
  currentStatusColor,
  approvedByName,
  approvedAt,
  isEditingTask,
  editDeadline,
  editQuota,
  onEditDeadlineChange,
  onEditQuotaChange,
}: TaskInfoCardsProps) {
  const hasApprovalInfo = Boolean(approvedByName || approvedAt);

  return (
    <>
      <Group grow align="stretch">
        <InfoCard
          icon={
            <ThemeIcon variant="light" color="gray" radius="xl">
              <IconCalendar size={16} />
            </ThemeIcon>
          }
          label="Дедлайн"
          value={
            isEditingTask ? (
              <TextInput
                value={editDeadline}
                onChange={(e) => onEditDeadlineChange(e.currentTarget.value)}
                radius="md"
                size="sm"
                placeholder="YYYY-MM-DD"
              />
            ) : (
              deadline
            )
          }
        />

        <InfoCard
          icon={
            <ThemeIcon variant="light" color="blue" radius="xl">
              <IconTargetArrow size={16} />
            </ThemeIcon>
          }
          label="Квота"
          value={
            isEditingTask ? (
              <NumberInput
                value={editQuota}
                onChange={(value) => onEditQuotaChange(String(value ?? ''))}
                min={1}
                radius="md"
                size="sm"
              />
            ) : (
              quota
            )
          }
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

      {hasApprovalInfo && (
        <Group gap="sm" mt="md" wrap="wrap">
          {approvedByName && (
            <ApprovalPill
              icon={<IconUserCheck size={14} />}
              label="Принял"
              value={approvedByName}
            />
          )}

          {approvedAt && (
            <ApprovalPill
              icon={<IconCalendar size={14} />}
              label="Когда"
              value={approvedAt}
            />
          )}
        </Group>
      )}
    </>
  );
}