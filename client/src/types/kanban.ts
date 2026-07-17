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
  active_teams_count: number;
  board_status: KanbanStatus;
  team_id: number | null;
}

export interface KanbanTeamParticipant {
  tab_num: number;
  fio: string;
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
  created_by_tab_num: number | null;
  created_by_name: string | null;
  initiator_tab_num: number | null;
  initiator_name: string | null;
  approved_team_id: number | null;
  approved_by_tab_num: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  teams: KanbanTeamDetails[];
  favorites_count: number;
  views_count: number;
  is_favorite: boolean;
}

export interface KanbanAvailableUser {
  tab_num: number;
  fio: string;
  email: string;
}

export interface KanbanCurrentUser {
  tab_num: number;
  fio: string;
  email: string;
  role_id: number;
  role_name: string;
}

export interface KanbanRatingUser {
  place: number;
  tab_num: number;
  fio: string;
  email: string;
  role_id: number;
  role_name: string;
  total_score: number;
}

export interface KanbanTaskViewer {
  tab_num: number;
  fio: string;
  time: string;
}

export interface KanbanTaskStats {
  chart: {
    date_label: string;
    views: number;
    viewers: KanbanTaskViewer[];
  }[];
  favorites: { tab_num: number; fio: string }[];
}