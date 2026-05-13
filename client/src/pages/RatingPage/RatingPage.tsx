import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanRatingUser } from '../../types/kanban';
import PodiumCard from './PodiumCard';
import RatingTable from './RatingTable';
import {
  getCurrentQuarter,
  getCurrentYear,
  quarterOptions,
} from './rating.constants';
import styles from './RatingPage.module.css';

interface RatingPageProps {
  onBackClick: () => void;
}

type RatingType = 'performers' | 'initiators';

export default function RatingPage({ onBackClick }: RatingPageProps) {
  const [rating, setRating] = useState<KanbanRatingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [ratingType, setRatingType] = useState<RatingType>('performers');

  const currentYear = getCurrentYear();

  const loadRating = async () => {
    try {
      setLoading(true);

      const data =
        ratingType === 'performers'
          ? await kanbanApi.getRating(currentYear, Number(quarter))
          : await kanbanApi.getInitiatorRating(currentYear, Number(quarter));

      setRating(data);
    } catch (error) {
      console.error('Ошибка загрузки рейтинга:', error);

      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить рейтинг',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRating();
  }, [quarter, ratingType]);

  const firstPlaceUsers = rating.filter((user) => Number(user.place) === 1);
  const secondPlaceUsers = rating.filter((user) => Number(user.place) === 2);
  const thirdPlaceUsers = rating.filter((user) => Number(user.place) === 3);

  const firstPlace = firstPlaceUsers[0] ?? null;
  const secondPlace = secondPlaceUsers[0] ?? null;
  const thirdPlace = thirdPlaceUsers[0] ?? null;

  const ratingTitle =
    ratingType === 'performers'
      ? 'Рейтинг исполнителей'
      : 'Рейтинг инициаторов';

  const ratingSubtitle =
    ratingType === 'performers'
      ? 'Лидеры по баллам за выполненные задачи'
      : 'Лидеры по задачам, закрытым в срок';

  const totalLabel =
    ratingType === 'performers'
      ? 'Всего участников'
      : 'Всего инициаторов';

  const maxScoreLabel =
    ratingType === 'performers'
      ? 'Максимум баллов'
      : 'Максимум задач в срок';

  const podiumScoreLabel =
    ratingType === 'performers'
      ? 'баллов за квартал'
      : 'задач в срок за квартал';

  const tableScoreHeader =
    ratingType === 'performers'
      ? 'Баллы'
      : 'Задач в срок';

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  return (
    <Box className={styles.page}>
      <Container size="xl">
        <Paper radius="xl" p="xl" withBorder className={styles.heroCard}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={6}>
              <Group gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="yellow">
                  <IconTrophy size={24} />
                </ThemeIcon>

                <div>
                  <Text fw={900} size="32px" lh={1.1}>
                    {ratingTitle}
                  </Text>

                  <Text c="dimmed" size="sm">
                    {ratingSubtitle}
                  </Text>
                </div>
              </Group>
            </Stack>

            <Group>
              <SegmentedControl
                value={ratingType}
                onChange={(value) => setRatingType(value as RatingType)}
                data={[
                  { value: 'performers', label: 'Исполнители' },
                  { value: 'initiators', label: 'Инициаторы' },
                ]}
                radius="md"
                color="violet"
              />

              <Button
                variant="light"
                color="violet"
                radius="md"
                onClick={onBackClick}
              >
                К канбану
              </Button>

              <Paper radius="md" px="md" py="xs" withBorder className={styles.yearBadge}>
                <Text fw={700}>{currentYear}</Text>
              </Paper>

              <Select
                data={quarterOptions}
                value={quarter}
                onChange={(value) => setQuarter(value!)}
                w={160}
                radius="md"
                allowDeselect={false}
              />
            </Group>
          </Group>
        </Paper>

        {(firstPlace || secondPlace || thirdPlace) && (
          <Grid mt="lg" gutter="md" align="end">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PodiumCard
                place={2}
                users={secondPlaceUsers}
                scoreLabel={podiumScoreLabel}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <PodiumCard
                place={1}
                users={firstPlaceUsers}
                raised
                scoreLabel={podiumScoreLabel}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <PodiumCard
                place={3}
                users={thirdPlaceUsers}
                scoreLabel={podiumScoreLabel}
              />
            </Grid.Col>
          </Grid>
        )}

        <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg" spacing="md">
          <Paper radius="xl" p="lg" withBorder className={styles.statCard}>
            <Text c="dimmed" size="sm">
              {totalLabel}
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {rating.length}
            </Text>
          </Paper>

          <Paper radius="xl" p="lg" withBorder className={styles.statCard}>
            <Text c="dimmed" size="sm">
              {maxScoreLabel}
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {firstPlace?.total_score ?? 0}
            </Text>
          </Paper>

          <Paper radius="xl" p="lg" withBorder className={styles.statCard}>
            <Text c="dimmed" size="sm">
              Текущий период
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {quarter} кв. {currentYear}
            </Text>
          </Paper>
        </SimpleGrid>

        <Paper mt="lg" radius="xl" p="lg" withBorder className={styles.tableCard}>
          <Group justify="space-between" mb="md">
            <Text fw={800} size="lg">
              {ratingTitle}
            </Text>

            <Badge variant="light" color="violet" radius="sm">
              {quarter} квартал {currentYear}
            </Badge>
          </Group>

          <RatingTable
            rating={rating}
            scoreHeader={tableScoreHeader}
          />
        </Paper>
      </Container>
    </Box>
  );
}