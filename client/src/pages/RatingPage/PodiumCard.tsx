import { Badge, Image, Paper, Stack, Text } from '@mantine/core';
import type { KanbanRatingUser } from '../../types/kanban';
import {
  getPlaceLabel,
  getPlaceTheme,
  normalizePlace,
} from './rating.utils';
import styles from './RatingPage.module.css';

interface PodiumCardProps {
  place: number;
  users: KanbanRatingUser[];
  raised?: boolean;
  scoreLabel?: string;
}

export default function PodiumCard({
  place,
  users,
  raised = false,
  scoreLabel = 'баллов за квартал',
}: PodiumCardProps) {
  const normalizedPlace = normalizePlace(place);
  const theme = getPlaceTheme(normalizedPlace);
  const placeImage = `/rating/place-${normalizedPlace}.png`;

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
        <Image
          src={placeImage}
          alt={getPlaceLabel(normalizedPlace)}
          w={normalizedPlace === 1 ? 210 : 180}
          h={normalizedPlace === 1 ? 210 : 180}
          radius="xl"
          fit="cover"
        />

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
                  {scoreLabel}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}