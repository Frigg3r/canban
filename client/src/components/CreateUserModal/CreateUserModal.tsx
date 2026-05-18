import { useEffect, useState } from 'react';
import {
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconId,
  IconMail,
  IconShieldCheck,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { kanbanApi } from '../../api/kanban';
import type { KanbanAvailableUser } from '../../types/kanban';
import styles from './CreateUserModal.module.css';

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
}

const roleOptions = [
  { value: '1', label: 'Сотрудник' },
  { value: '2', label: 'Руководитель' },
  { value: '3', label: 'Администратор' },
];

export default function CreateUserModal({
  opened,
  onClose,
}: CreateUserModalProps) {
  const [users, setUsers] = useState<KanbanAvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserTabNum, setSelectedUserTabNum] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) {
      setSelectedUserTabNum(null);
      setSelectedRoleId(null);
      return;
    }

    const loadUsers = async () => {
      try {
        setLoading(true);

        const data = await kanbanApi.getDirectoryUsers();
        setUsers(data);
      } catch (err) {
        console.error('Ошибка загрузки сотрудников:', err);

        notifications.show({
          title: 'Ошибка',
          message:
            err instanceof Error
              ? err.message
              : 'Не удалось загрузить сотрудников',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [opened]);

  const selectedUser =
    users.find((user) => String(user.tab_num) === selectedUserTabNum) ?? null;

  const selectedRole =
    roleOptions.find((role) => role.value === selectedRoleId) ?? null;

  const handleSubmit = async () => {
    if (!selectedUser || !selectedRoleId) {
      return;
    }

    try {
      setSubmitting(true);

      await kanbanApi.addUser({
        tab_num: selectedUser.tab_num,
        fio: selectedUser.fio,
        email: selectedUser.email,
        role_id: Number(selectedRoleId),
      });

      notifications.show({
        title: 'Успешно',
        message: 'Сотрудник добавлен в систему',
        color: 'violet',
        autoClose: 1400,
      });

      onClose();
    } catch (err) {
      console.error('Ошибка добавления сотрудника:', err);

      notifications.show({
        title: 'Ошибка',
        message:
          err instanceof Error
            ? err.message
            : 'Не удалось добавить сотрудника',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
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
            color="green"
            className={styles.heroIcon}
          >
            <IconUserPlus size={26} />
          </ThemeIcon>

          <div>
            <Text className={styles.heroTitle}>Добавить сотрудника</Text>
            <Text className={styles.heroSubtitle}>
              Выберите сотрудника из справочника и назначьте ему роль
            </Text>
          </div>
        </Group>
      </div>

      <div className={styles.content}>
        <Paper withBorder radius="xl" p="lg" className={styles.formCard}>
          {loading ? (
            <div className={styles.loaderBox}>
              <Loader color="green" />

              <Text size="sm" c="dimmed">
                Загружаем сотрудников...
              </Text>
            </div>
          ) : (
            <Stack gap="md">
              <Select
                label="Сотрудник"
                placeholder="Выберите сотрудника"
                data={users.map((user) => ({
                  value: String(user.tab_num),
                  label: user.fio,
                }))}
                value={selectedUserTabNum}
                onChange={setSelectedUserTabNum}
                searchable
                nothingFoundMessage="Сотрудники не найдены"
                disabled={submitting}
                radius="md"
                size="md"
                leftSection={<IconUsers size={16} />}
              />

              <Select
                label="Роль"
                placeholder="Выберите роль"
                data={roleOptions}
                value={selectedRoleId}
                onChange={setSelectedRoleId}
                nothingFoundMessage="Роли не найдены"
                disabled={submitting}
                radius="md"
                size="md"
                leftSection={<IconShieldCheck size={16} />}
              />

              {selectedUser && (
                <Paper radius="lg" p="md" className={styles.userPreview}>
                  <Group justify="space-between" align="flex-start" gap="md">
                    <div>
                      <Text fw={800} size="sm">
                        {selectedUser.fio}
                      </Text>

                      <Group gap={6} mt={6}>
                        <IconId size={14} className={styles.previewIcon} />
                        <Text size="xs" c="dimmed">
                          Табельный: {selectedUser.tab_num}
                        </Text>
                      </Group>

                      <Group gap={6} mt={4}>
                        <IconMail size={14} className={styles.previewIcon} />
                        <Text size="xs" c="dimmed">
                          {selectedUser.email}
                        </Text>
                      </Group>
                    </div>

                    {selectedRole && (
                      <div className={styles.rolePill}>
                        {selectedRole.label}
                      </div>
                    )}
                  </Group>
                </Paper>
              )}

              {users.length === 0 && (
                <Paper radius="lg" p="md" className={styles.emptyBox}>
                  <Text size="sm" c="dimmed">
                    Нет сотрудников для добавления
                  </Text>
                </Paper>
              )}
            </Stack>
          )}
        </Paper>

        <Group justify="space-between" align="center" className={styles.footer}>
          <Text size="xs" c="dimmed">
            После добавления сотрудник сможет работать с канбан-доской
          </Text>

          <Group gap="sm">
            <Button
              variant="default"
              radius="md"
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </Button>

            <Button
              color="green"
              radius="md"
              disabled={!selectedUser || !selectedRoleId || loading || submitting}
              onClick={handleSubmit}
              loading={submitting}
            >
              Добавить
            </Button>
          </Group>
        </Group>
      </div>
    </Modal>
  );
}