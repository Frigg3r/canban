import { Badge, Button, Group, Paper, Select, Stack, Text } from '@mantine/core';
import type { KanbanAvailableUser, KanbanTeamDetails } from '../../types/kanban';

interface TaskTeamSectionProps {
  team: KanbanTeamDetails;
  statusLabel: Record<string, string>;
  currentStatusColor: string;
  availableUsers: KanbanAvailableUser[];
  selectedUserTabNum: string | null;
  addingParticipant: boolean;
  removingParticipantTabNum: number | null;
  canEditTeam: boolean;
  canRemoveParticipant: (tabNum: number) => boolean;
  onSelectedUserChange: (value: string | null) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (tabNum: number) => void;
}

export default function TaskTeamSection({
  team,
  statusLabel,
  currentStatusColor,
  availableUsers,
  selectedUserTabNum,
  addingParticipant,
  removingParticipantTabNum,
  canEditTeam,
  canRemoveParticipant,
  onSelectedUserChange,
  onAddParticipant,
  onRemoveParticipant,
}: TaskTeamSectionProps) {
  return (
    <Paper withBorder radius="xl" p="md" bg="#ffffff">
      <Group justify="space-between" align="center" mb="xs">
        <Text fw={700} size="lg">
          Команда #{team.id}
        </Text>

        <Group gap="sm" align="flex-start">
          <Badge variant="light" radius="sm">
            {statusLabel[team.status]}
          </Badge>

          {canEditTeam && (
            <>
              <Select
                placeholder="Выбери сотрудника"
                data={availableUsers.map((user) => ({
                  value: String(user.tab_num),
                  label: user.fio,
                }))}
                value={selectedUserTabNum}
                onChange={onSelectedUserChange}
                size="xs"
                radius="md"
                searchable
                nothingFoundMessage="Нет доступных сотрудников"
                disabled={availableUsers.length === 0}
                style={{ minWidth: 220 }}
              />

              <Button
                size="xs"
                radius="md"
                color={currentStatusColor}
                loading={addingParticipant}
                disabled={!selectedUserTabNum}
                onClick={onAddParticipant}
              >
                Добавить сотрудника
              </Button>
            </>
          )}
        </Group>
      </Group>

      {team.participants.length > 0 ? (
        <Stack gap="xs">
          {team.participants.map((participant) => (
            <Paper
              key={participant.tab_num}
              withBorder
              radius="lg"
              p="sm"
              bg="#faf8ff"
            >
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600}>
                  {participant.fio}
                </Text>

                {canRemoveParticipant(participant.tab_num) && (
                  <Button
                    size="xs"
                    radius="md"
                    color="red"
                    variant="light"
                    loading={removingParticipantTabNum === participant.tab_num}
                    onClick={() => onRemoveParticipant(participant.tab_num)}
                  >
                    Удалить
                  </Button>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          Нет участников
        </Text>
      )}
    </Paper>
  );
}