class TaskFactory {
  static createTask({ title, description, deadline, priority }) {
    return new Task(
      title?.trim(),
      description,
      deadline,
      priority,
      'ToDo'
    );
  }
}
