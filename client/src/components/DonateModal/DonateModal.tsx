import { useEffect, useState } from 'react';
import { Modal, Button, Group, Stack, Text, Select, NumberInput, Textarea, ThemeIcon, Loader, Center } from '@mantine/core';
import { IconGift, IconUser, IconChecklist } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanAvailableUser, KanbanTask } from '../../types/kanban';
import { useAppAuth } from '../../app-auth';

interface DonateModalProps {
  opened: boolean;
  onClose: () => void;
  tasks: KanbanTask[];
}

export default function DonateModal({ opened, onClose, tasks }: DonateModalProps) {
  const { currentUser } = useAppAuth();
  const [users, setUsers] = useState<KanbanAvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [score, setScore] = useState<number | string>(1);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      setLoading(true);
      kanbanApi.getUsers()
        .then(data => setUsers(data.filter(u => Number(u.tab_num) !== Number(currentUser.tab_num))))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setSelectedUser(null);
      setSelectedTask(null);
      setScore(1);
      setComment('');
    }
  }, [opened, currentUser.tab_num]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedTask || Number(score) <= 0) return;
    setSubmitting(true);
    try {
      await kanbanApi.donateScore(
        currentUser.tab_num,
        Number(selectedUser),
        Number(selectedTask),
        Number(score),
        comment
      );
      notifications.show({ title: 'Успешно', message: `Вы перевели ${score} баллов!`, color: 'violet' });
      onClose();
    } catch (error) {
      notifications.show({ title: 'Ошибка', message: error instanceof Error ? error.message : 'Не удалось перевести баллы', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon variant="light" color="violet" radius="xl" size="lg">
            <IconGift size={18} />
          </ThemeIcon>
          <Text fw={800} size="xl">Поблагодарить коллегу</Text>
        </Group>
      }
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        content: { borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
        header: { padding: '20px 24px', borderBottom: '1px solid #f1effa', background: 'linear-gradient(180deg, #faf8ff 0%, #ffffff 100%)' },
        body: { padding: '24px', background: '#fcfbff' },
      }}
    >
      {loading ? (
        <Center py={40}><Loader color="violet" /></Center>
      ) : (
        <Stack gap="md">
          <Select
            label="Кому перевести баллы?"
            placeholder="Выберите сотрудника"
            data={users.map(u => ({ value: String(u.tab_num), label: u.fio }))}
            value={selectedUser}
            onChange={setSelectedUser}
            searchable
            required
            leftSection={<IconUser size={16} />}
          />
          
          <Select
            label="За какую задачу?"
            placeholder="Выберите задачу"
            data={tasks.map(t => ({ value: String(t.id), label: t.name }))}
            value={selectedTask}
            onChange={setSelectedTask}
            searchable
            required
            leftSection={<IconChecklist size={16} />}
          />

          <NumberInput
            label="Количество баллов"
            description="Спишутся с вашего баланса за текущий квартал"
            value={score}
            onChange={setScore}
            min={1}
            required
          />
          
          <Textarea
            label="Комментарий (необязательно)"
            placeholder="Спасибо за помощь с..."
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            minRows={2}
            autosize
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="default" radius="md" onClick={onClose}>Отмена</Button>
            <Button color="violet" radius="md" loading={submitting} onClick={handleSubmit} disabled={!selectedUser || !selectedTask}>
              Перевести
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}