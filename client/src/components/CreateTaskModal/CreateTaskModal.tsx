import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendarDue,
  IconClipboardPlus,
  IconFileText,
  IconTargetArrow,
  IconUserCircle,
  IconUsers,
  IconWriting,
} from '@tabler/icons-react';
import type { CreateTaskPayload } from '../../types/kanban-api';
import type { KanbanAvailableUser } from '../../types/kanban';
import styles from './CreateTaskModal.module.css';

interface CreateTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<CreateTaskPayload, 'created_by_tab_num'>) => void;
  loading?: boolean;
  initiators?: KanbanAvailableUser[];
}

export default function CreateTaskModal({
  opened,
  onClose,
  onSubmit,
  loading = false,
  initiators = [],
}: CreateTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState<number | string>(10);
  const [quota, setQuota] = useState<number | string>(1);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [initiatorTabNum, setInitiatorTabNum] = useState<string | null>(null);

  // сброс формы
  useEffect(() => {
    if (!opened) {
      setName('');
      setDescription('');
      setScore(10);
      setQuota(1);
      setDeadline(null);
      setInitiatorTabNum(null);
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
        numericQuota > 0 &&
        numericQuota <= 3
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
      initiator_tab_num: initiatorTabNum ? Number(initiatorTabNum) : null,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={680}
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
        <Group gap="md" align="center" wrap="nowrap">
          <ThemeIcon
            size={52}
            radius="xl"
            variant="white"
            color="violet"
            className={styles.heroIcon}
          >
            <IconClipboardPlus size={26} />
          </ThemeIcon>

          <div>
            <Text className={styles.heroTitle}>Создать карточку</Text>
            <Text className={styles.heroSubtitle}>
              Заполните задачу, назначьте баллы и срок выполнения
            </Text>
          </div>
        </Group>
      </div>

      <div className={styles.content}>
        <div className={styles.scrollContent}>
          <Paper withBorder radius="xl" p="md" className={styles.formCard}>
            <Stack gap="sm">
              <TextInput
                label="Название"
                placeholder="Введите название карточки"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                required
                radius="md"
                size="sm"
                leftSection={<IconWriting size={16} />}
              />

              <Textarea
                label="Описание"
                placeholder="Введите описание задачи"
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
                minRows={3}
                autosize
                required
                radius="md"
                size="sm"
                leftSection={<IconFileText size={16} />}
                styles={{
                  section: {
                    alignItems: 'flex-start',
                    paddingTop: 10,
                  },
                  input: {
                    overflow: 'hidden',
                    resize: 'none',
                  },
                }}
              />

              <Select
                label="Инициатор"
                placeholder="Если не выбран — будет текущий пользователь"
                data={initiators.map((user) => ({
                  value: String(user.tab_num),
                  label: user.fio,
                }))}
                value={initiatorTabNum}
                onChange={setInitiatorTabNum}
                searchable
                clearable
                radius="md"
                size="sm"
                nothingFoundMessage="Инициаторы не найдены"
                leftSection={<IconUserCircle size={16} />}
              />

              <Group grow align="flex-start">
                <NumberInput
                  label="Баллы"
                  value={score}
                  onChange={setScore}
                  min={1}
                  required
                  radius="md"
                  size="sm"
                  leftSection={<IconTargetArrow size={16} />}
                />

                <NumberInput
                  label="Квота участников"
                  value={quota}
                  onChange={setQuota}
                  min={1}
                  max={3}
                  error={Number(quota) > 3 ? 'Максимум 3' : null}
                  required
                  radius="md"
                  size="sm"
                  leftSection={<IconUsers size={16} />}
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
                size="sm"
                clearable={false}
                locale="ru"
                required
                leftSection={<IconCalendarDue size={16} />}
              />
            </Stack>
          </Paper>
        </div>

        <Group justify="space-between" align="center" className={styles.footer}>
          <Text size="xs" c="dimmed" className={styles.footerText}>
            После создания карточка появится в бэклоге
          </Text>

          <Group gap="sm" className={styles.footerButtons}>
            <Button
              variant="default"
              radius="md"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>

            <Button
              color="violet"
              radius="md"
              disabled={!canSubmit || loading}
              onClick={handleSubmit}
              loading={loading}
            >
              Создать
            </Button>
          </Group>
        </Group>
      </div>
    </Modal>
  );
}