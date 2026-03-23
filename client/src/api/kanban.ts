import { BaseApi } from './ApiClass';
import type {
  AddCommentPayload,
  AddUserPayload,
  AddUserToTeamPayload,
  ChangeTeamStatusPayload,
  CreateTaskPayload,
  KanbanAvailableUser,
  KanbanComment,
  KanbanCurrentUser,
  KanbanTask,
  KanbanTaskDetails,
  RemoveUserFromTeamPayload,
  ReturnTaskToBacklogPayload,
  TakeTaskPayload,
  KanbanRatingUser,
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

  // базовый метод для всех запросов:
  private async requestData<T>(path: string, options?: RequestInit): Promise<T> {
    const result = await this.request<ApiResponse<T>>(path, options);

    if (!result.ok) {
      throw new Error(result.message || 'Ошибка запроса');
    }

    return result.data;
  }

  // получить все карточки для доски
  getTasks() {
    return this.requestData<KanbanTask[]>('/get-board.php');
  }

  // создать новую карточку
  createTask(payload: CreateTaskPayload) {
    return this.requestData<KanbanTask>('/create-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // получить детали карточки
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

  // добавить комментарий к карточке
  addComment(payload: AddCommentPayload) {
    return this.requestData<KanbanComment>('/add-comment.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // удалить комментарий
  deleteComment(commentId: number) {
    return this.requestData<unknown>(`/delete-comment.php?comment_id=${commentId}`, {
      method: 'DELETE',
    });
  }

  // взять карточку в работу / создать команду по карточке
  takeTask(payload: TakeTaskPayload) {
    return this.requestData<unknown>('/take-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // добавить пользователя в команду
  addUserToTeam(payload: AddUserToTeamPayload) {
    return this.requestData<unknown>('/add-user-to-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // получить кандидатов для добавления в команду
  getAvailableUsers(taskId: number) {
    return this.requestData<KanbanAvailableUser[]>(
      `/get-team-candidates.php?task_id=${taskId}`
    );
  }

  // получить сотрудников из справочника, которых еще нет в системе
  getDirectoryUsers() {
    return this.requestData<KanbanAvailableUser[]>(
      '/get-directory-users.php'
    );
  }

  // убрать пользователя из команды
  removeUserFromTeam(payload: RemoveUserFromTeamPayload) {
    return this.requestData<unknown>('/remove-user-from-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // архивировать карточку
  archiveTask(taskId: number) {
    return this.requestData<unknown>('/archive-task.php', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    });
  }

  // вернуть карточку в бэклог
  returnTaskToBacklog(payload: ReturnTaskToBacklogPayload) {
    return this.requestData<unknown>('/return-task-to-backlog.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // сменить статус команды
  changeTeamStatus(payload: ChangeTeamStatusPayload) {
    return this.requestData<unknown>('/change-team-status.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // получить текущего пользователя по табельному номеру
  getCurrentUser(tabNum: number) {
    return this.requestData<KanbanCurrentUser>(
      `/get-current-user.php?tab_num=${tabNum}`
    );
  }

  // добавить пользователя в систему
  addUser(payload: AddUserPayload) {
    return this.requestData<unknown>('/add-user-to-canban.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // рейтинг
  getRating(year: number, quarter: number) {
    const query = new URLSearchParams({
      year: String(year),
      quarter: String(quarter),
    });

    return this.requestData<KanbanRatingUser[]>(
      `/get-rating.php?${query.toString()}`
    );
  }

  // принять результат команды
  approveTeamResult(teamId: number, approvedByTabNum: number) {
    return this.requestData<{ task_id: number; team_id: number }>(
      '/approve-team-result.php',
      {
        method: 'POST',
        body: JSON.stringify({
          team_id: teamId,
          approved_by_tab_num: approvedByTabNum,
        }),
      }
    );
  }
}

export const kanbanApi = new KanbanApi();