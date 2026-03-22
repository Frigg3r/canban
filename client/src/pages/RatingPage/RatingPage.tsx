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
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCrown,
  IconMedal,
  IconStars,
  IconTrophy,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanRatingUser } from '../../types/kanban';

interface RatingPageProps {
  onBackClick: () => void;
}

const quarterOptions = [
  { value: '1', label: '1 квартал' },
  { value: '2', label: '2 квартал' },
  { value: '3', label: '3 квартал' },
  { value: '4', label: '4 квартал' },
];

const yearOptions = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

function getCurrentQuarter() {
  return String(Math.ceil((new Date().getMonth() + 1) / 3));
}

function getPlaceColor(place: number) {
  if (place === 1) return 'yellow';
  if (place === 2) return 'gray';
  if (place === 3) return 'orange';

  return 'violet';
}

function getPlaceLabel(place: number) {
  if (place === 1) return '1 место';
  if (place === 2) return '2 место';
  if (place === 3) return '3 место';

  return `${place} место`;
}

function getPlaceIcon(place: number) {
  if (place === 1) return <IconCrown size={22} />;
  if (place === 2) return <IconMedal size={22} />;
  if (place === 3) return <IconTrophy size={22} />;

  return <IconStars size={22} />;
}

interface PodiumCardProps {
  user: KanbanRatingUser;
  raised?: boolean;
}

function PodiumCard({ user, raised = false }: PodiumCardProps) {
  const color = getPlaceColor(user.place);

  return (
    <Paper
      radius="xl"
      p="xl"
      withBorder
      style={{
        height: '100%',
        background:
          user.place === 1
            ? 'linear-gradient(180deg, #fffdf2 0%, #ffffff 100%)'
            : 'linear-gradient(180deg, #faf7ff 0%, #ffffff 100%)',
        borderColor: user.place === 1 ? '#f5df8b' : '#ece3ff',
        boxShadow:
          user.place === 1
            ? '0 18px 40px rgba(214, 177, 33, 0.18)'
            : '0 12px 30px rgba(99, 72, 155, 0.08)',
        transform: raised ? 'translateY(-10px)' : 'none',
      }}
    >
      <Stack align="center" gap="sm">
        <ThemeIcon size={58} radius="xl" variant="light" color={color}>
          {getPlaceIcon(user.place)}
        </ThemeIcon>

        <Badge size="lg" radius="sm" variant="light" color={color}>
          {getPlaceLabel(user.place)}
        </Badge>

        <Text fw={800} size="lg" ta="center" lh={1.25}>
          {user.fio}
        </Text>

        <Text c="dimmed" size="sm" ta="center">
          {user.role_name}
        </Text>

        <Paper
          radius="lg"
          p="md"
          w="100%"
          style={{
            background: '#f8f5ff',
          }}
        >
          <Stack gap={2} align="center">
            <Text fw={900} size="30px" lh={1}>
              {user.total_score}
            </Text>

            <Text size="xs" c="dimmed">
              баллов за квартал
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}

export default function RatingPage({ onBackClick }: RatingPageProps) {
  const [rating, setRating] = useState<KanbanRatingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [quarter, setQuarter] = useState(getCurrentQuarter());

  const loadRating = async () => {
    try {
      setLoading(true);

      const data = await kanbanApi.getRating(Number(year), Number(quarter));
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
  }, [year, quarter]);

  const firstPlace = rating[0] ?? null;
  const secondPlace = rating[1] ?? null;
  const thirdPlace = rating[2] ?? null;

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="violet" />
      </Center>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(139, 92, 246, 0.10), transparent 24%), linear-gradient(180deg, #f7f7fb 0%, #eef2f8 100%)',
        padding: '24px 0 40px',
      }}
    >
      <Container size="xl">
        <Paper
          radius="xl"
          p="xl"
          withBorder
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f7f1ff 100%)',
            borderColor: '#eadfff',
            boxShadow: '0 16px 40px rgba(88, 63, 145, 0.08)',
          }}
        >
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

              <Select
                data={yearOptions}
                value={year}
                onChange={(value) => setYear(value || String(new Date().getFullYear()))}
                w={120}
                radius="md"
                allowDeselect={false}
              />

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
          <Paper
            radius="xl"
            p="lg"
            withBorder
            style={{ background: '#ffffffcc', borderColor: '#ebe7f7' }}
          >
            <Text c="dimmed" size="sm">
              Всего участников
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {rating.length}
            </Text>
          </Paper>

          <Paper
            radius="xl"
            p="lg"
            withBorder
            style={{ background: '#ffffffcc', borderColor: '#ebe7f7' }}
          >
            <Text c="dimmed" size="sm">
              Максимум баллов
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {firstPlace?.total_score ?? 0}
            </Text>
          </Paper>

          <Paper
            radius="xl"
            p="lg"
            withBorder
            style={{ background: '#ffffffcc', borderColor: '#ebe7f7' }}
          >
            <Text c="dimmed" size="sm">
              Текущий период
            </Text>
            <Text fw={900} size="30px" lh={1.1}>
              {quarter} кв. {year}
            </Text>
          </Paper>
        </SimpleGrid>

        <Paper
          mt="lg"
          radius="xl"
          p="lg"
          withBorder
          style={{
            background: 'rgba(255,255,255,0.94)',
            borderColor: '#ebe7f7',
            boxShadow: '0 10px 24px rgba(88, 63, 145, 0.06)',
          }}
        >
          <Group justify="space-between" mb="md">
            <Text fw={800} size="lg">
              Общий рейтинг
            </Text>

            <Badge variant="light" color="violet" radius="sm">
              {quarter} квартал {year}
            </Badge>
          </Group>

          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Место</Table.Th>
                <Table.Th>ФИО</Table.Th>
                <Table.Th>Роль</Table.Th>
                <Table.Th>Табельный</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Баллы</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {rating.map((user) => (
                <Table.Tr key={user.tab_num}>
                  <Table.Td>
                    <Badge
                      radius="sm"
                      variant={user.place <= 3 ? 'filled' : 'light'}
                      color={getPlaceColor(user.place)}
                    >
                      {user.place}
                    </Badge>
                  </Table.Td>

                  <Table.Td>
                    <Text fw={700}>{user.fio}</Text>
                  </Table.Td>

                  <Table.Td>
                    <Text c="dimmed">{user.role_name}</Text>
                  </Table.Td>

                  <Table.Td>{user.tab_num}</Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text fw={800}>{user.total_score}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {rating.length === 0 && (
            <Center py="xl">
              <Text c="dimmed">Нет данных для выбранного квартала</Text>
            </Center>
          )}
        </Paper>
      </Container>
    </Box>
  );
}