import { BaseApi } from './ApiClass';

import type {
  KanbanAvailableUser,
  KanbanComment,
  KanbanCurrentUser,
  KanbanTask,
  KanbanTaskDetails,
  KanbanRatingUser,
} from '../types/kanban';

import type {
  AddCommentPayload,
  AddUserPayload,
  AddUserToTeamPayload,
  ApproveTeamResultPayload,
  ChangeTeamStatusPayload,
  CreateTaskPayload,
  RemoveUserFromTeamPayload,
  ReturnTaskToBacklogPayload,
  TakeTaskPayload,
  UpdateTaskPayload,
} from '../types/kanban-api';

// для ответа сервера
interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

class KanbanApi extends BaseApi {
  constructor() {
    super('http://localhost:8000');
  }

  // описание базового запроса сервера
  private async requestData<T>(path: string, options?: RequestInit): Promise<T> {
    const result = await this.request<ApiResponse<T>>(path, options);

    if (!result.ok) {
      throw new Error(result.message || 'Ошибка запроса');
    }

    return result.data;
  }

  getTasks() {
    return this.requestData<KanbanTask[]>('/get-board.php');
  }

  createTask(payload: CreateTaskPayload) {
    return this.requestData<KanbanTask>('/create-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getTaskDetails(taskId: number, teamId?: number | null) {
    const query = new URLSearchParams({
      task_id: String(taskId),
    });

    if (teamId != null) {
      query.append('team_id', String(teamId));
    }

    return this.requestData<KanbanTaskDetails>(
      `/get-task-details.php?${query.toString()}`
    );
  }

  addComment(payload: AddCommentPayload) {
    return this.requestData<KanbanComment>('/add-comment.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  deleteComment(commentId: number) {
    const query = new URLSearchParams({
      comment_id: String(commentId),
    });

    return this.requestData<null>(`/delete-comment.php?${query.toString()}`, {
      method: 'DELETE',
    });
  }

  takeTask(payload: TakeTaskPayload) {
    return this.requestData<null>('/take-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  addUserToTeam(payload: AddUserToTeamPayload) {
    return this.requestData<null>('/add-user-to-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getTeamCandidates(taskId: number) {
    const query = new URLSearchParams({
      task_id: String(taskId),
    });

    return this.requestData<KanbanAvailableUser[]>(
      `/get-team-candidates.php?${query.toString()}`
    );
  }

  getDirectoryUsers() {
    return this.requestData<KanbanAvailableUser[]>('/get-directory-users.php');
  }

  removeUserFromTeam(payload: RemoveUserFromTeamPayload) {
    return this.requestData<null>('/remove-user-from-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  archiveTask(taskId: number) {
    return this.requestData<null>('/archive-task.php', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  }

  returnTaskToBacklog(payload: ReturnTaskToBacklogPayload) {
    return this.requestData<null>('/return-task-to-backlog.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  changeTeamStatus(payload: ChangeTeamStatusPayload) {
    return this.requestData<null>('/change-team-status.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getCurrentUser(tabNum: number) {
    const query = new URLSearchParams({
      tab_num: String(tabNum),
    });

    return this.requestData<KanbanCurrentUser>(
      `/get-current-user.php?${query.toString()}`
    );
  }

  addUser(payload: AddUserPayload) {
    return this.requestData<null>('/add-user-to-canban.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getRating(year: number, quarter: number) {
    const query = new URLSearchParams({
      year: String(year),
      quarter: String(quarter),
    });

    return this.requestData<KanbanRatingUser[]>(
      `/get-rating.php?${query.toString()}`
    );
  }

  approveTeamResult(payload: ApproveTeamResultPayload) {
    return this.requestData<{ task_id: number; team_id: number }>(
      '/approve-team-result.php',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  updateTask(payload: UpdateTaskPayload) {
    return this.requestData<KanbanTaskDetails>('/update-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const kanbanApi = new KanbanApi();