import { BaseApi } from './ApiClass';
import type {
  AddCommentPayload,
  AddUserToTeamPayload,
  CreateTaskPayload,
  KanbanAvailableUser,
  KanbanComment,
  KanbanCurrentUser,
  KanbanTask,
  KanbanTaskDetails,
  RemoveUserFromTeamPayload,
  TakeTaskPayload,
  ReturnTaskToBacklogPayload,
  ChangeTeamStatusPayload
} from '../types/kanban';

// добавил тип ответа сервера
interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

class KanbanApi extends BaseApi {
  constructor() {
    super('http://localhost:8000');
  }

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

  async deleteComment(commentId: number): Promise<void> {
    await this.requestData<unknown>(`/delete-comment.php?comment_id=${commentId}`, {
      method: 'DELETE',
    });
  }

  takeTask(payload: TakeTaskPayload) {
    return this.requestData<unknown>('/take-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async addUserToTeam(payload: AddUserToTeamPayload): Promise<void> {
    await this.requestData<unknown>('/add-user-to-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getAvailableUsers(taskId: number) {
    return this.requestData<KanbanAvailableUser[]>(
      `/get-available-users.php?task_id=${taskId}`
    );
  }

  async removeUserFromTeam(payload: RemoveUserFromTeamPayload): Promise<void> {
    await this.requestData<unknown>('/remove-user-from-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async archiveTask(taskId: number): Promise<void> {
    await this.requestData<unknown>('/archive-task.php', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  }

  async returnTaskToBacklog(payload: ReturnTaskToBacklogPayload): Promise<void> {
    await this.requestData<unknown>('/return-task-to-backlog.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async changeTeamStatus(payload: ChangeTeamStatusPayload): Promise<void> {
    await this.requestData<unknown>('/change-team-status.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  getCurrentUser(tabNum: number) {
    return this.requestData<KanbanCurrentUser>(
      `/get-current-user.php?tab_num=${tabNum}`
    );
  }
}

export const kanbanApi = new KanbanApi();