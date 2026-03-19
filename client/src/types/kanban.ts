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
  // null - для карточки в бэклоге, number - для всех других столбцов
  team_id: number | null;
}

export interface CreateTaskPayload {
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline: string;
}

export interface KanbanTeamParticipant {
  tab_num: number;
  full_name: string;
}

export interface KanbanComment {
  id: number;
  text: string;
  created_at: string;
  author_tab_num: number;
  author_name: string;
  can_delete: boolean;
}

export interface KanbanTeamDetails {
  id: number;
  status: KanbanStatus;
  participants: KanbanTeamParticipant[];
  comments: KanbanComment[];
}

// отдельный интерфейс для задачи именно в модалке, так как это 2 разные сущности
export interface KanbanTaskDetails {
  id: number;
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline_full: string;
  board_status: KanbanStatus;
  // в бэклог столбце будут все команды, работающие над задачей
  // во всех других только конкретная команда
  teams: KanbanTeamDetails[];
}

export interface AddCommentPayload {
  team_id: number;
  text: string;
  author_tab_num: number;
}

export interface TakeTaskPayload {
  task_id: number;
  participants: number[];
}

export interface AddUserToTeamPayload {
  team_id: number;
  tab_num: number;
}

export interface KanbanAvailableUser {
  tab_num: number;
  full_name: string;
}

export interface RemoveUserFromTeamPayload {
  team_id: number;
  tab_num: number;
}

export interface KanbanCurrentUser {
  tab_num: number;
  fio: string;
  email: string;
  role_id: number;
  role_name: string;
}