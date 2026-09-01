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
  Modal,
  ScrollArea,
} from '@mantine/core';
import { IconTrophy, IconListCheck, IconTargetArrow, IconGift } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanRatingUser, KanbanRatingTaskDetail } from '../../types/kanban';
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

  // Состояния для модалки с детализацией
  const [selectedUser, setSelectedUser] = useState<KanbanRatingUser | null>(null);
  const [userTasks, setUserTasks] = useState<KanbanRatingTaskDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  // Обработчик клика по пользователю
  const handleUserClick = async (user: KanbanRatingUser) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const data = await kanbanApi.getUserRatingDetails(
        user.tab_num,
        currentYear,
        Number(quarter),
        ratingType
      );
      setUserTasks(data);
    } catch (error) {
      console.error('Ошибка загрузки деталей:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить список задач',
        color: 'red',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

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
                onUserClick={handleUserClick}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PodiumCard
                place={1}
                users={firstPlaceUsers}
                raised
                scoreLabel={podiumScoreLabel}
                onUserClick={handleUserClick}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PodiumCard
                place={3}
                users={thirdPlaceUsers}
                scoreLabel={podiumScoreLabel}
                onUserClick={handleUserClick}
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
              {firstPlace ? Number(firstPlace.total_score) : 0}
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
            onUserClick={handleUserClick}
          />
        </Paper>
      </Container>

      {/* МОДАЛКА С ДЕТАЛИЗАЦИЕЙ БАЛЛОВ */}
      <Modal
        opened={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="violet" radius="xl" size="lg">
              <IconListCheck size={18} />
            </ThemeIcon>
            <Text fw={800} size="xl">Детализация баллов</Text>
          </Group>
        }
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          content: { borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
          header: { padding: '20px 24px', borderBottom: '1px solid #f1effa', background: 'linear-gradient(180deg, #faf8ff 0%, #ffffff 100%)' },
          body: { padding: '24px', background: '#fcfbff' },
        }}
      >
        {selectedUser && (
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={800} size="lg" c="dark.9">{selectedUser.fio}</Text>
                <Text size="sm" c="dimmed">Табельный: {selectedUser.tab_num}</Text>
              </div>
              <Badge size="xl" radius="md" variant="light" color="violet">
                {Number(selectedUser.total_score)} {tableScoreHeader.toLowerCase()}
              </Badge>
            </Group>

            {detailsLoading ? (
              <Center py={60}><Loader color="violet" /></Center>
            ) : userTasks.length > 0 ? (
              <ScrollArea mah={400} offsetScrollbars type="hover">
                <Stack gap="sm" pr="xs">
                  {userTasks.map((task, idx) => (
                    <Paper key={`${task.id}-${idx}`} radius="md" p="md" bg="#ffffff" withBorder style={{ borderColor: task.is_donation ? '#eebefa' : '#eef2f5' }}>
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs">
                            {task.is_donation && (
                              <ThemeIcon size="sm" radius="xl" color="violet" variant="light">
                                <IconGift size={12} />
                              </ThemeIcon>
                            )}
                            <Text size="sm" fw={700} c="dark.8" style={{ wordBreak: 'break-word' }}>
                              {task.name}
                            </Text>
                          </Group>

                          {task.is_donation && task.comment && (
                            <Text size="sm" fs="italic" c="dimmed" pl="md" style={{ borderLeft: '2px solid var(--mantine-color-violet-3)' }}>
                              «{task.comment}»
                            </Text>
                          )}

                          <Text size="xs" c="dimmed" mt={2}>
                            {task.is_donation
                              ? (task.score > 0 ? `Получен донат от: ${task.donation_user_name}` : `Отправлен донат для: ${task.donation_user_name}`)
                              : (ratingType === 'performers' ? 'Дедлайн:' : 'Закрыта:')} {task.deadline}
                          </Text>
                        </Stack>
                        <Badge
                          color={task.is_donation ? (task.score > 0 ? 'violet' : 'red') : (ratingType === 'performers' ? 'blue' : 'teal')}
                          variant="light"
                          radius="sm"
                          leftSection={task.is_donation ? <IconGift size={12} /> : <IconTargetArrow size={12} />}
                        >
                          {task.score > 0 ? `+${task.score}` : task.score}
                        </Badge>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            ) : (
              <Paper radius="md" p="xl" bg="#f8f9fa" style={{ border: '2px dashed #dee2e6' }}>
                <Text size="sm" c="dimmed" ta="center" fw={500}>Задачи не найдены</Text>
              </Paper>
            )}
          </Stack>
        )}
      </Modal>
    </Box>
  );
}