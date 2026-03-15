import { Button, Group, Modal, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { useEffect, useState } from 'react';

export interface CreateTaskFormValues {
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline: string;
}

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTaskFormValues) => void;
  loading?: boolean;
}

export default function CreateTaskModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
}: CreateTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState<number | string>(10);
  const [quota, setQuota] = useState<number | string>(1);
  const [deadline, setDeadline] = useState('');

  // когда модалка закрывается, очищаем форму
  useEffect(() => {
    if (!opened) {
      setName('');
      setDescription('');
      setScore(10);
      setQuota(1);
      setDeadline('');
    }
  }, [opened]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (!description.trim()) return;
    if (!score || Number(score) <= 0) return;
    if (!quota || Number(quota) <= 0) return;
    if (!deadline) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      score: Number(score),
      quota: Number(quota),
      deadline,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Создать карточку"
      centered
      radius="xl"
    >
      <Stack>
        <TextInput
          label="Название"
          placeholder="Введите название"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
        />

        <Textarea
          label="Описание"
          placeholder="Введите описание"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          minRows={4}
          autosize
          required
        />

        <NumberInput
          label="Баллы"
          value={score}
          onChange={setScore}
          min={1}
          required
        />

        <NumberInput
          label="Квота"
          value={quota}
          onChange={setQuota}
          min={1}
          required
        />

        <TextInput
          label="Дедлайн"
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.currentTarget.value)}
          required
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            Отмена
          </Button>

          <Button onClick={handleSubmit} loading={loading}>
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
