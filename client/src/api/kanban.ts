import { BaseApi } from './ApiClass';
import type {
  CreateTaskPayload,
  KanbanTask,
  AddCommentPayload,
  KanbanComment,
  KanbanTaskDetails,
  TakeTaskPayload,
  AddUserToTeamPayload,
  KanbanAvailableUser,
  RemoveUserFromTeamPayload
} from '../types/kanban';

// to do: можно типизировать ответ сервера, пока не делал, 
// поэтому пока this.request<any>

class KanbanApi extends BaseApi {
  constructor() {
    super('http://localhost:8000');
  }

  // получение задач
  async getTasks(): Promise<KanbanTask[]> {
    const result = await this.request<any>('/get-board.php');

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось загрузить задачи');
    }

    return result.data;
  }

  // создание карточки
  async createTask(payload: CreateTaskPayload): Promise<KanbanTask> {
    const result = await this.request<any>('/create-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось создать задачу');
    }

    return result.data;
  }

  // получение полных данных карточки для модалки
  async getTaskDetails(taskId: number, teamId?: number | null): Promise<KanbanTaskDetails> {
    const query = new URLSearchParams({
      task_id: String(taskId),
    });

    if (teamId != null) {
      query.append('team_id', String(teamId));
    }

    const result = await this.request<any>(`/get-task-details.php?${query.toString()}`);

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось загрузить данные карточки');
    }

    return result.data;
  }

  // добавление комментария
  async addComment(payload: AddCommentPayload): Promise<KanbanComment> {
    const result = await this.request<any>('/add-comment.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось добавить комментарий');
    }

    return result.data;
  }

  // удаление комментария
  async deleteComment(commentId: number): Promise<void> {
    const result = await this.request<any>(`/delete-comment.php?comment_id=${commentId}`, {
      method: 'DELETE',
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось удалить комментарий');
    }
  }

  // взятие задачи в работу
  async takeTask(payload: TakeTaskPayload): Promise<any> {
    const result = await this.request<any>('/take-task.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось взять задачу в работу');
    }

    return result.data;
  }

  // добавление пользователя в команду
  async addUserToTeam(payload: AddUserToTeamPayload): Promise<void> {
    const result = await this.request<any>('/add-user-to-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось добавить сотрудника в команду');
    }
  }

  // метод проверки наличия у добавляемого сотрудника в команду текущей задачи
  async getAvailableUsers(taskId: number): Promise<KanbanAvailableUser[]> {
    const result = await this.request<any>(`/get-available-users.php?task_id=${taskId}`);

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось загрузить список сотрудников');
    }

    return result.data;
  }

  // удаление сотрудника из команды
  async removeUserFromTeam(payload: RemoveUserFromTeamPayload): Promise<void> {
    const result = await this.request<any>('/remove-user-from-team.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось удалить сотрудника из команды');
    }
  }

  // архивирование задачи
  async archiveTask(taskId: number): Promise<void> {
    const result = await this.request<any>('/archive-task.php', {
      method: 'POST',
      body: JSON.stringify({
        task_id: taskId,
      }),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось архивировать задачу');
    }
  }

  // возврат карточки в бэклог
  async returnTaskToBacklog(payload: { task_id: number; team_id: number }): Promise<void> {
    const result = await this.request<any>('/return-task-to-backlog.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось вернуть задачу в бэклог');
    }
  }

  // метод для изменения статуса (кроме Бэклог -> В работе)
  async changeTeamStatus(payload: { team_id: number; status: 'inProgress' | 'review' | 'done' }): Promise<void> {
    const result = await this.request<any>('/change-team-status.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось изменить статус команды');
    }
  }
}

export const kanbanApi = new KanbanApi();