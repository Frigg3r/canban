import { BaseApi } from './ApiClass';
import type { KanbanTask } from '../types/kanban';

class KanbanApi extends BaseApi {
  constructor() {
    super('http://localhost:8000');
  }

  async getTasks(): Promise<KanbanTask[]> {
    const result = await this.request<any>('/get-board.php');

    if (!result.ok) {
      throw new Error(result.message || 'Не удалось загрузить задачи');
    }

    return result.data;
  }
}

export const kanbanApi = new KanbanApi();