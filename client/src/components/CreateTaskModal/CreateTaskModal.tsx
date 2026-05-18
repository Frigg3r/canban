import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconChecklist,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react';
import { useAppAuth } from '../../app-auth';
import type { CreateTaskPayload } from '../../types/kanban-api';
import styles from './СreateTaskModal.module.css';

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
  const { currentUser } = useAppAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState<number | string>(10);
  const [quota, setQuota] = useState<number | string>(1);
  const [deadline, setDeadline] = useState<string | null>(null);

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

  const canSubmit = useMemo(() => {
    return Boolean(
      trimmedName &&
        trimmedDescription &&
        deadline &&
        numericScore > 0 &&
        numericQuota > 0 &&
        numericQuota <= 3
    );
  }, [trimmedName, trimmedDescription, deadline, numericScore, numericQuota]);

  const handleSubmit = () => {
    if (!canSubmit || !deadline) {
      return;
    }

    onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      score: numericScore,
      quota: numericQuota,
      deadline,
      created_by_tab_num: currentUser.tab_num,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      padding={0}
      title={null}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      classNames={{
        content: styles.modalContent,
        body: styles.modalBody,
        header: styles.modalHeader,
      }}
    >
      <div className={styles.hero}>
        <Group justify="space-between" align="flex-start" gap="md">
          <Group gap="md" align="flex-start">
            <ThemeIcon
              size={46}
              radius="xl"
              variant="white"
              color="violet"
              className={styles.heroIcon}
            >
              <IconChecklist size={24} />
            </ThemeIcon>

            <div>
              <Text className={styles.heroTitle}>Создание карточки</Text>
              <Text className={styles.heroSubtitle}>
                Заполните задачу, укажите баллы, квоту и срок выполнения
              </Text>
            </div>
          </Group>
        </Group>
      </div>

      <div className={styles.content}>
        <Paper withBorder radius="xl" p="lg" className={styles.formCard}>
          <Stack gap="md">
            <TextInput
              label="Название"
              placeholder="Например: Подготовить отчет по KPI"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              required
              radius="md"
              size="md"
              maxLength={200}
            />

            <Textarea
              label="Описание"
              placeholder="Опишите, что нужно сделать и какой результат ожидается"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
              minRows={4}
              maxRows={8}
              autosize
              required
              radius="md"
              size="md"
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <NumberInput
                label="Баллы"
                value={score}
                onChange={setScore}
                min={1}
                required
                radius="md"
                size="md"
                leftSection={<IconTargetArrow size={16} />}
              />

              <NumberInput
                label="Квота"
                value={quota}
                onChange={setQuota}
                min={1}
                max={3}
                error={numericQuota > 3 ? 'Максимум 3' : null}
                required
                radius="md"
                size="md"
                leftSection={<IconUsers size={16} />}
              />

              <DatePickerInput
                label="Дедлайн"
                placeholder="Дата"
                value={deadline}
                onChange={setDeadline}
                valueFormat="DD.MM.YYYY"
                dropdownType="popover"
                radius="md"
                size="md"
                clearable={false}
                locale="ru"
                required
                leftSection={<IconCalendar size={16} />}
              />
            </SimpleGrid>
          </Stack>
        </Paper>

        <Group justify="space-between" align="center" className={styles.footer}>
          <Text size="xs" c="dimmed">
            После создания карточка появится в бэклоге
          </Text>

          <Group gap="sm">
            <Button variant="default" radius="md" onClick={onClose}>
              Отмена
            </Button>

            <Button
              onClick={handleSubmit}
              loading={loading}
              color="violet"
              radius="md"
              disabled={!canSubmit}
            >
              Создать карточку
            </Button>
          </Group>
        </Group>
      </div>
    </Modal>
  );
}