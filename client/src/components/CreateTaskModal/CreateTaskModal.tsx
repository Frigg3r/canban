import { Button, Group, Modal, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates'; // работа с датами в mantine в отдельном пакете
import { useEffect, useState } from 'react';
import type { CreateTaskPayload } from '../../types/kanban';

// интерфейс для пропсов снаружи
interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTaskPayload) => void;
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
  const [deadline, setDeadline] = useState<Date | null>(null);

  // приводим форму к начальному состоянию при повторном открытии
  useEffect(() => {
    if (!opened) {
      setName('');
      setDescription('');
      setScore(10);
      setQuota(1);
      setDeadline(null);
    }
  }, [opened]);

  // внутренний обработчик
  const handleSubmit = () => {
    if (!name.trim()) return;
    if (!description.trim()) return;
    if (!score || Number(score) <= 0) return;
    if (!quota || Number(quota) <= 0) return;
    if (!deadline) return;

    const formattedDeadline = new Date(deadline).toISOString().slice(0, 10);

    // вызываем метод родительского компонента уже с собранными данными
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      score: Number(score),
      quota: Number(quota),
      deadline: formattedDeadline,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Создание карточки"
      centered
      radius="xl"
      size="lg"
      padding="lg"
      overlayProps={{ blur: 2 }}
      styles={{
        title: {
          fontSize: '20px',
          fontWeight: 700,
        },
        header: {
          marginBottom: '8px',
        },
        body: {
          paddingTop: '8px',
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Название"
          placeholder="Введите название"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          required
          radius="md"
          size="md"
        />

        <Textarea
          label="Описание"
          placeholder="Введите описание"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          minRows={4}
          autosize
          required
          radius="md"
          size="md"
        />

        <Group grow align="flex-start">
          <NumberInput
            label="Баллы"
            value={score}
            onChange={setScore}
            min={1}
            required
            radius="md"
            size="md"
          />

          <NumberInput
            label="Квота"
            value={quota}
            onChange={setQuota}
            min={1}
            required
            radius="md"
            size="md"
          />
        </Group>

        <DatePickerInput
          label="Дедлайн"
          placeholder="Выберите дату"
          value={deadline}
          onChange={(value) => setDeadline(value as Date | null)}
          valueFormat="DD.MM.YYYY"
          dropdownType="popover"
          radius="md"
          size="md"
          clearable={false}
          locale="ru"
          required
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>

          <Button onClick={handleSubmit} loading={loading} color='violet'>
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}