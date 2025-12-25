class TaskRepository {
  constructor() {
    this.storageKey = 'smart_task_organizer_tasks';
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const tasksJson = JSON.parse(data);
      return tasksJson.map(t => Task.fromJSON(t));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  }

  save(task) {
    try {
      const tasks = this.getAll();
      const i = tasks.findIndex(t => t.id === task.id);
      if (i >= 0) tasks[i] = task;
      else tasks.push(task);
      return this.saveAll(tasks);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  saveAll(tasks) {
    try {
      const tasksJson = tasks.map(t => t.toJSON());
      localStorage.setItem(this.storageKey, JSON.stringify(tasksJson));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  delete(id) {
    try {
      const tasks = this.getAll().filter(t => t.id !== id);
      return this.saveAll(tasks);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  exportToText() {
    const tasks = this.getAll();
    if (tasks.length === 0) return 'No tasks to export';

    let text = '═══════════════════════════════════════\n';
    text += '     Task List - Smart Task Organizer\n';
    text += '═══════════════════════════════════════\n\n';
    text += `Export Date: ${new Date().toLocaleString('en-US')}\n`;
    text += `Total Tasks: ${tasks.length}\n\n`;

    tasks.forEach((task, index) => {
      text += `\n[${index + 1}] ${task.title}\n`;
      text += `${'─'.repeat(40)}\n`;
      text += `Status: ${task.status === 'Completed' ? 'Completed ✓' : 'To Do'}\n`;
      text += `Priority: ${task.priority}\n`;

      if (task.description) text += `Description: ${task.description}\n`;

      if (task.deadline) {
        const d = new Date(task.deadline);
        text += `Deadline: ${d.toLocaleString('en-US')}\n`;
        if (task.isOverdue()) text += `⚠️ Overdue!\n`;
      }

      text += `Created: ${new Date(task.createdAt).toLocaleString('en-US')}\n`;
      text += `Updated: ${new Date(task.updatedAt).toLocaleString('en-US')}\n`;
      text += '\n';
    });

    text += '\n═══════════════════════════════════════\n';
    return text;
  }
}
