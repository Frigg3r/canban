import { BaseApi } from './ApiClass';
import type { CreateTaskPayload, KanbanTask } from '../types/kanban';

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
}

export const kanbanApi = new KanbanApi();