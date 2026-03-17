import { BaseApi } from './ApiClass';
import type { 
  CreateTaskPayload, 
  KanbanTask,
  AddCommentPayload,
  KanbanComment,
  KanbanTaskDetails
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
}

export const kanbanApi = new KanbanApi();