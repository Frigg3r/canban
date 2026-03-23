import { useEffect, useState } from 'react';
import { Button, Group, Loader, Modal, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { kanbanApi } from '../../api/kanban';
import type { KanbanAvailableUser } from '../../types/kanban';

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await kanbanApi.getDirectoryUsers();
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);

      notifications.show({
        title: 'Ошибка',
        message: err instanceof Error ? err.message : 'Не удалось загрузить сотрудников',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!opened) {
      return;
    }

    loadUsers();
  }, [opened]);

  const resetForm = () => {
    setSelectedUserTabNum(null);
    setSelectedRoleId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedUser =
    users.find((user) => String(user.tab_num) === selectedUserTabNum) ?? null;

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

      await loadUsers();
      handleClose();
    } catch (err) {
      console.error('Ошибка добавления сотрудника:', err);

      notifications.show({
        title: 'Ошибка',
        message: err instanceof Error ? err.message : 'Не удалось добавить сотрудника',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Добавить сотрудника"
      centered
      size="md"
    >
      <Stack>
        {loading ? (
          <Loader />
        ) : (
          <>
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
            />

            <Select
              label="Роль"
              placeholder="Выберите роль"
              data={roleOptions}
              value={selectedRoleId}
              onChange={setSelectedRoleId}
              nothingFoundMessage="Роли не найдены"
              disabled={submitting}
            />

            {selectedUser && (
              <Text size="sm" c="dimmed">
                Email: {selectedUser.email}
              </Text>
            )}
          </>
        )}

        {!loading && users.length === 0 && (
          <Text size="sm" c="dimmed">
            Нет сотрудников для добавления
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose} disabled={submitting}>
            Отмена
          </Button>

          <Button
            color="violet"
            disabled={!selectedUser || !selectedRoleId || loading || submitting}
            onClick={handleSubmit}
            loading={submitting}
          >
            Добавить
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}