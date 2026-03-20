import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { IconMessageCircle, IconTrash } from '@tabler/icons-react';
import type { KanbanComment } from '../../types/kanban';
import styles from './TaskDetailsModal.module.css';

interface TaskCommentsSectionProps {
  currentStatusColor: string;
  comments: KanbanComment[];
  commentText: string;
  commentLoading: boolean;
  deletingCommentId: number | null;
  canCommentCurrentTeam: boolean;
  canSubmitComment: boolean;
  onCommentTextChange: (value: string) => void;
  onAddComment: () => void;
  canDeleteComment: (comment: KanbanComment) => boolean;
  onDeleteComment: (comment: KanbanComment) => void;
}

export default function TaskCommentsSection({
  currentStatusColor,
  comments,
  commentText,
  commentLoading,
  deletingCommentId,
  canCommentCurrentTeam,
  canSubmitComment,
  onCommentTextChange,
  onAddComment,
  canDeleteComment,
  onDeleteComment,
}: TaskCommentsSectionProps) {
  const renderComment = (comment: KanbanComment) => (
    <Paper
      key={comment.id}
      withBorder
      radius="lg"
      p="md"
      className={styles.commentCard}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <div className={styles.commentMeta}>
          <Text fw={700} size="sm">
            {comment.author_name}
          </Text>
          <Text size="xs" c="dimmed">
            {comment.created_at}
          </Text>
        </div>

        {canDeleteComment(comment) && (
          <Button
            size="xs"
            color="red"
            variant="light"
            radius="md"
            leftSection={<IconTrash size={14} />}
            loading={deletingCommentId === comment.id}
            onClick={() => onDeleteComment(comment)}
          >
            Удалить
          </Button>
        )}
      </Group>

      <Text size="sm" className={styles.commentText}>
        {comment.text}
      </Text>
    </Paper>
  );

  return (
    <Paper withBorder radius="xl" p="lg" bg="#ffffff">
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <ThemeIcon variant="light" color={currentStatusColor} radius="xl">
            <IconMessageCircle size={16} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            Комментарии
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          {comments.length}
        </Text>
      </Group>

      {canCommentCurrentTeam && (
        <Stack gap="sm" mb="md">
          <Textarea
            placeholder="Напиши комментарий..."
            value={commentText}
            onChange={(event) => onCommentTextChange(event.currentTarget.value)}
            minRows={3}
            maxRows={6}
            autosize
            radius="lg"
            styles={{
              input: {
                background: '#faf8ff',
                borderColor: '#e9defc',
              },
            }}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (canSubmitComment) {
                  onAddComment();
                }
              }
            }}
          />

          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Ctrl/Cmd + Enter — отправить
            </Text>

            <Button
              radius="md"
              color={currentStatusColor}
              loading={commentLoading}
              disabled={!canSubmitComment}
              onClick={onAddComment}
            >
              Добавить комментарий
            </Button>
          </Group>
        </Stack>
      )}

      {comments.length > 0 ? (
        <ScrollArea h={260} offsetScrollbars scrollbarSize={6}>
          <Stack gap="sm" pr={6}>
            {comments.map(renderComment)}
          </Stack>
        </ScrollArea>
      ) : (
        <Paper radius="lg" p="md" bg="#faf8ff">
          <Text size="sm" c="dimmed">
            Комментариев пока нет
          </Text>
        </Paper>
      )}
    </Paper>
  );
}