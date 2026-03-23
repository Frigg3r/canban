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

export default function RatingPage({ onBackClick }: RatingPageProps) {
  const [rating, setRating] = useState<KanbanRatingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState(getCurrentQuarter());

  const currentYear = getCurrentYear();

  const loadRating = async () => {
    try {
      setLoading(true);

      const data = await kanbanApi.getRating(currentYear, Number(quarter));
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
  }, [quarter]);

  const [firstPlace = null, secondPlace = null, thirdPlace = null] = rating;

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
                    Рейтинг сотрудников
                  </Text>

                  <Text c="dimmed" size="sm">
                    Лидеры по баллам за выбранный квартал
                  </Text>
                </div>
              </Group>
            </Stack>

            <Group>
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
                onChange={(value) => setQuarter(value || getCurrentQuarter())}
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
              {secondPlace ? <PodiumCard user={secondPlace} /> : null}
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              {firstPlace ? <PodiumCard user={firstPlace} raised /> : null}
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              {thirdPlace ? <PodiumCard user={thirdPlace} /> : null}
            </Grid.Col>
          </Grid>
        )}

        <SimpleGrid cols={{ base: 1, md: 3 }} mt="lg" spacing="md">
          <Paper radius="xl" p="lg" withBorder className={styles.statCard}>
            <Text c="dimmed" size="sm">
              Всего участников
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {rating.length}
            </Text>
          </Paper>

          <Paper radius="xl" p="lg" withBorder className={styles.statCard}>
            <Text c="dimmed" size="sm">
              Максимум баллов
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
              Общий рейтинг
            </Text>

            <Badge variant="light" color="violet" radius="sm">
              {quarter} квартал {currentYear}
            </Badge>
          </Group>

          <RatingTable rating={rating} />
        </Paper>
      </Container>
    </Box>
  );
}