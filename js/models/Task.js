class Task {
  constructor(title, description, deadline, priority, status = 'ToDo') {
    this.id = this.generateId();
    this.title = title;
    this.description = description || '';
    this.deadline = deadline || null;
    this.priority = priority || 'Medium';
    this.status = status;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  update(title, description, deadline, priority) {
    this.title = title;
    this.description = description || '';
    this.deadline = deadline || null;
    this.priority = priority || 'Medium';
    this.updatedAt = new Date().toISOString();
  }

  markCompleted() {
    this.status = 'Completed';
    this.updatedAt = new Date().toISOString();
  }

  markToDo() {
    this.status = 'ToDo';
    this.updatedAt = new Date().toISOString();
  }

  toggleStatus() {
    if (this.status === 'Completed') this.markToDo();
    else this.markCompleted();
  }

  isOverdue() {
    if (!this.deadline) return false;
    return new Date(this.deadline) < new Date() && this.status !== 'Completed';
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      deadline: this.deadline,
      priority: this.priority,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    const task = new Task(
      json.title,
      json.description,
      json.deadline,
      json.priority,
      json.status || 'ToDo'
    );
    task.id = json.id;
    task.createdAt = json.createdAt || new Date().toISOString();
    task.updatedAt = json.updatedAt || new Date().toISOString();
    return task;
  }
}
