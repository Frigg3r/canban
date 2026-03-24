import type { TeamWorkflowStatus } from './kanban';

export interface CreateTaskPayload {
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline: string;
}

export interface UpdateTaskPayload {
  task_id: number;
  name: string;
  description: string;
  score: number;
  quota: number;
  deadline: string;
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

export interface RemoveUserFromTeamPayload {
  team_id: number;
  tab_num: number;
}

export interface ChangeTeamStatusPayload {
  team_id: number;
  status: TeamWorkflowStatus;
}

export interface ReturnTaskToBacklogPayload {
  task_id: number;
  team_id: number;
}

export interface ApproveTeamResultPayload {
  team_id: number;
  approved_by_tab_num: number;
}

export interface AddUserPayload {
  tab_num: number;
  fio: string;
  email: string;
  role_id: number;
}