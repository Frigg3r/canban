import { Badge, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import type { KanbanRatingUser } from '../../types/kanban';
import {
  getPlaceIcon,
  getPlaceLabel,
  getPlaceTheme,
  normalizePlace,
} from './rating.utils';
import styles from './RatingPage.module.css';

interface PodiumCardProps {
  place: number;
  users: KanbanRatingUser[];
  raised?: boolean;
}

export default function PodiumCard({
  place,
  users,
  raised = false,
}: PodiumCardProps) {
  const normalizedPlace = normalizePlace(place);
  const theme = getPlaceTheme(normalizedPlace);

  return (
    <Paper
      radius="xl"
      p="xl"
      withBorder
      className={`${styles.podiumCard} ${raised ? styles.podiumRaised : ''}`}
      style={{
        background: theme.cardBackground,
        borderColor: theme.cardBorder,
        boxShadow: theme.shadow,
      }}
    >
      <Stack align="center" gap="sm">
        <ThemeIcon
          size={74}
          radius="xl"
          variant="filled"
          style={{
            background: theme.iconBackground,
            color: theme.iconColor,
          }}
        >
          {getPlaceIcon(normalizedPlace)}
        </ThemeIcon>

        <Badge
          size="lg"
          radius="sm"
          variant="filled"
          style={{
            background: theme.badgeBackground,
            color: theme.badgeText,
          }}
        >
          {getPlaceLabel(normalizedPlace).toUpperCase()}
        </Badge>

        <Stack gap="sm" w="100%">
          {users.map((user) => (
            <Paper key={user.tab_num} radius="lg" p="md" w="100%" className={styles.scoreBox}>
              <Stack gap={2} align="center">
                <Text fw={800} size="lg" ta="center" lh={1.25}>
                  {user.fio}
                </Text>

                <Text fw={900} size="30px" lh={1} c={theme.scoreColor}>
                  {user.total_score}
                </Text>

                <Text size="xs" c="dimmed">
                  баллов за квартал
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}