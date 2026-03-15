export type KanbanStatus = 'backlog' | 'inProgress' | 'review' | 'done';

export interface KanbanTask {
  id: number;
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline_short: string;
  deadline_full: string;
  participants_count: number;
  board_status: KanbanStatus;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline: string;
}