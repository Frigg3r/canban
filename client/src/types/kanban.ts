export type KanbanStatus = 'backlog' | 'inProgress' | 'review' | 'done';
export type TeamWorkflowStatus = Exclude<KanbanStatus, 'backlog'>;

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
  status: TeamWorkflowStatus;
  participants: KanbanTeamParticipant[];
  comments: KanbanComment[];
}

export interface KanbanTaskDetails {
  id: number;
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline_full: string;
  board_status: KanbanStatus;
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

export interface ReturnTaskToBacklogPayload {
  task_id: number;
  team_id: number;
}

export interface ChangeTeamStatusPayload {
  team_id: number;
  status: TeamWorkflowStatus;
}