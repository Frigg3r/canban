import { Center, Table, Text } from '@mantine/core';
import type { KanbanRatingUser } from '../../types/kanban';
import { getPlaceTheme, normalizePlace } from './rating.utils';
import styles from './RatingPage.module.css';

interface RatingTableProps {
  rating: KanbanRatingUser[];
}

export default function RatingTable({ rating }: RatingTableProps) {
  if (rating.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">Нет данных для выбранного квартала</Text>
      </Center>
    );
  }

  return (
    <Table striped highlightOnHover verticalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Место</Table.Th>
          <Table.Th>ФИО</Table.Th>
          <Table.Th>Табельный</Table.Th>
          <Table.Th className={styles.tableAlignRight}>Баллы</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {rating.map((user) => {
          const place = normalizePlace(user.place);
          const theme = getPlaceTheme(place);
          const isTopThree = place <= 3;

          return (
            <Table.Tr
              key={user.tab_num}
              style={{
                background: isTopThree ? theme.rowBackground : undefined,
              }}
            >
              <Table.Td>
                <span
                  className={styles.placeBox}
                  style={{
                    background: theme.rowPlaceBackground,
                    color: theme.rowPlaceText,
                  }}
                >
                  {place}
                </span>
              </Table.Td>

              <Table.Td>
                <Text fw={700} c={isTopThree ? theme.rowPlaceText : undefined}>
                  {user.fio}
                </Text>
              </Table.Td>

              <Table.Td>{user.tab_num}</Table.Td>

              <Table.Td className={styles.tableAlignRight}>
                <Text fw={800} c={isTopThree ? theme.scoreColor : undefined}>
                  {user.total_score}
                </Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}