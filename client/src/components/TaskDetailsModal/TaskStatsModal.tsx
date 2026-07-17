import { Modal, Text, Group, Paper, Stack, Loader, Center, ScrollArea, ThemeIcon, Tooltip, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import { kanbanApi } from '../../api/kanban';
import type { KanbanTaskStats, KanbanTaskViewer } from '../../types/kanban';
import { IconChartBar, IconHeartFilled, IconEye, IconClock } from '@tabler/icons-react';

interface TaskStatsModalProps {
  opened: boolean;
  taskId: number | null;
  onClose: () => void;
}

export default function TaskStatsModal({ opened, taskId, onClose }: TaskStatsModalProps) {
  const [stats, setStats] = useState<KanbanTaskStats | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Состояние для вложенной модалки (список просмотревших за конкретный день)
  const [selectedDay, setSelectedDay] = useState<{ date_label: string; viewers: KanbanTaskViewer[] } | null>(null);

  useEffect(() => {
    if (opened && taskId) {
      setLoading(true);
      kanbanApi.getTaskStats(taskId)
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setStats(null);
      setSelectedDay(null);
    }
  }, [opened, taskId]);

  const maxViews = stats ? Math.max(...stats.chart.map(d => d.views), 1) : 1;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        zIndex={2000}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" radius="xl" size="lg">
              <IconChartBar size={18} />
            </ThemeIcon>
            <Text fw={800} size="xl">Статистика карточки</Text>
          </Group>
        }
        size="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          content: { 
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          },
          header: { 
            padding: '20px 24px', 
            borderBottom: '1px solid #f1effa',
            background: 'linear-gradient(180deg, #faf8ff 0%, #ffffff 100%)'
          },
          body: { 
            padding: '24px', 
            background: '#fcfbff' 
          },
        }}
      >
        {loading || !stats ? (
          <Center py={80}><Loader color="blue" size="lg" /></Center>
        ) : (
          <Stack gap="xl">
            {/* БЛОК ГРАФИКА */}
            <Paper withBorder radius="xl" p="lg" bg="#ffffff" shadow="sm" style={{ borderColor: '#eef2f5' }}>
              <Group justify="space-between" mb="lg">
                <Text fw={800} size="lg">Просмотры (последние 14 дней)</Text>
                <Text size="xs" c="dimmed">Нажмите на столбец для деталей</Text>
              </Group>
              
              <ScrollArea w="100%" offsetScrollbars type="hover" pb="xs">
                <Group align="flex-end" gap="xs" h={200} wrap="nowrap" justify="space-between" px="xs" style={{ minWidth: '500px', paddingTop: '20px' }}>
                  {stats.chart.map((item, i) => {
                    const heightPct = Math.max((item.views / maxViews) * 100, 2);
                    const isToday = i === stats.chart.length - 1;
                    const hasViews = item.views > 0;
                    
                    return (
                      <Tooltip 
                        key={i} 
                        label={hasViews ? `${item.date_label}: ${item.views} просмотров (нажмите)` : 'Нет просмотров'} 
                        withArrow 
                        position="top"
                        withinPortal
                        zIndex={2001}
                      >
                        <Stack 
                          gap={8} 
                          align="center" 
                          style={{ 
                            flex: 1, 
                            cursor: hasViews ? 'pointer' : 'default',
                            opacity: hasViews ? 1 : 0.7
                          }}
                          onClick={() => {
                            if (hasViews) setSelectedDay(item);
                          }}
                        >
                          <Text size="xs" fw={800} c={hasViews ? 'blue.6' : 'gray.4'}>
                            {hasViews ? item.views : ''}
                          </Text>
                          <div style={{
                            width: '100%',
                            maxWidth: '32px',
                            height: `${heightPct}%`,
                            background: hasViews 
                              ? (isToday ? 'linear-gradient(180deg, #339af0 0%, #228be6 100%)' : 'linear-gradient(180deg, #74c0fc 0%, #4dabf7 100%)') 
                              : '#f1f3f5',
                            borderRadius: '6px 6px 0 0',
                            boxShadow: hasViews ? '0 4px 10px rgba(34, 139, 230, 0.2)' : 'none',
                            transition: 'all 0.2s ease',
                            transform: hasViews ? 'scaleY(1)' : 'none',
                            transformOrigin: 'bottom'
                          }} 
                          onMouseEnter={(e) => { if(hasViews) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                          onMouseLeave={(e) => { if(hasViews) e.currentTarget.style.filter = 'none'; }}
                          />
                          <Text size="10px" fw={isToday ? 800 : 600} c={isToday ? 'blue.7' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
                            {item.date_label}
                          </Text>
                        </Stack>
                      </Tooltip>
                    );
                  })}
                </Group>
              </ScrollArea>
            </Paper>

            {/* БЛОК ИЗБРАННОГО */}
            <Paper withBorder radius="xl" p="lg" bg="#ffffff" shadow="sm" style={{ borderColor: '#ffe3e3' }}>
              <Group gap="sm" mb="md">
                <ThemeIcon variant="light" color="red" radius="xl" size="md">
                  <IconHeartFilled size={16} />
                </ThemeIcon>
                <Text fw={800} size="lg">Добавили в избранное ({stats.favorites.length})</Text>
              </Group>
              
              {stats.favorites.length > 0 ? (
                <ScrollArea mah={240} offsetScrollbars type="hover">
                  <Stack gap="sm" pr="md">
                    {stats.favorites.map(user => (
                      <Paper key={user.tab_num} radius="md" p="sm" bg="#fff5f5" style={{ border: '1px solid #ffc9c9' }}>
                        <Group gap="sm">
                          <Text size="md" fw={700} c="red.9">{user.fio}</Text>
                          <Text size="sm" c="red.5" fw={500}>({user.tab_num})</Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              ) : (
                <Paper radius="md" p="xl" bg="#f8f9fa" style={{ border: '2px dashed #dee2e6' }}>
                  <Text size="sm" c="dimmed" ta="center" fw={500}>Пока никто не добавил эту карточку в избранное</Text>
                </Paper>
              )}
            </Paper>
          </Stack>
        )}
      </Modal>

      {/* ВЛОЖЕННАЯ МОДАЛКА: Список просмотревших за день */}
      <Modal
        opened={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        zIndex={2005} // Поверх основной модалки
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" radius="xl">
              <IconEye size={16} />
            </ThemeIcon>
            <Text fw={800}>Просмотры за {selectedDay?.date_label}</Text>
            <Badge color="blue" variant="light" radius="sm">{selectedDay?.viewers.length}</Badge>
          </Group>
        }
        size="md"
        centered
        overlayProps={{ backgroundOpacity: 0.4, blur: 2 }}
        styles={{
          content: { borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
          header: { padding: '16px 20px', borderBottom: '1px solid #f1effa' },
          body: { padding: '20px', background: '#fcfbff' },
        }}
      >
        <ScrollArea mah={400} offsetScrollbars type="hover">
          <Stack gap="sm" pr="xs">
            {selectedDay?.viewers.map((viewer, idx) => (
              <Paper key={`${viewer.tab_num}-${idx}`} radius="md" p="sm" bg="#ffffff" withBorder style={{ borderColor: '#eef2f5' }}>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={700} c="dark.8" truncate>{viewer.fio}</Text>
                    <Text size="xs" c="dimmed">({viewer.tab_num})</Text>
                  </Group>
                  <Group gap={4}>
                    <IconClock size={14} color="var(--mantine-color-gray-5)" />
                    <Text size="xs" fw={600} c="dimmed">{viewer.time}</Text>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Modal>
    </>
  );
}