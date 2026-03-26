import { useEffect, useMemo, useState } from 'react';
import { Button, Group, Modal, NumberInput, Stack, TextInput, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { CreateTaskPayload } from '../../types/kanban-api';

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<CreateTaskPayload, 'created_by_tab_num'>) => void;
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
  const [deadline, setDeadline] = useState<string | null>(null);

  // сброс формы
  useEffect(() => {
    if (!opened) {
      setName('');
      setDescription('');
      setScore(10);
      setQuota(1);
      setDeadline(null);
    }
  }, [opened]);

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const numericScore = Number(score);
  const numericQuota = Number(quota);

  // валидация формы
  const canSubmit = useMemo(() => {
    return Boolean(
      trimmedName &&
        trimmedDescription &&
        deadline &&
        numericScore > 0 &&
        numericQuota > 0
    );
  }, [trimmedName, trimmedDescription, deadline, numericScore, numericQuota]);

  const handleSubmit = () => {
    if (!canSubmit || !deadline) {
      return;
    }

    // onSubmit принимаем от родителя (KanbanBoard)
    onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      score: numericScore,
      quota: numericQuota,
      deadline,
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
            label="Квота участников"
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
          onChange={setDeadline}
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

          <Button
            onClick={handleSubmit}
            loading={loading}
            color="violet"
            disabled={!canSubmit}
          >
            Создать
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}