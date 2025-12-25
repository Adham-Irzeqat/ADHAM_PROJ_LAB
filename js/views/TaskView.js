class TaskView {
  constructor() {
    this.tasksContainer = document.getElementById('tasks-container');
    this.tasksCount = document.getElementById('tasks-count');
  }

  displayTasks(tasks, totalCount) {
    this.tasksCount.textContent = totalCount;

    if (tasks.length === 0) {
      this.tasksContainer.innerHTML = '<p class="empty-message">No tasks to display. Add a new task to get started!</p>';
      return;
    }

    this.tasksContainer.innerHTML = tasks.map(t => this.renderTask(t)).join('');
  }

  renderTask(task) {
    const isCompleted = task.status === 'Completed';
    const isOverdue = task.isOverdue();

    const deadlineText = task.deadline
      ? new Date(task.deadline).toLocaleString('en-US')
      : 'No deadline';

    const statusLabels = { ToDo: 'To Do', Completed: 'Completed' };

    return `
      <div class="task-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-header">
          <div>
            <div class="task-title">${this.escapeHtml(task.title)}</div>
            <div style="display:flex;gap:10px;margin-top:5px;">
              <span class="task-status status-${task.status.toLowerCase()}">${statusLabels[task.status]}</span>
              <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
            </div>
          </div>
        </div>

        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}

        <div class="task-deadline ${isOverdue ? 'overdue' : ''}">
          📅 ${deadlineText} ${isOverdue ? '⚠️' : ''}
        </div>

        <div class="task-actions">
          <button class="btn ${isCompleted ? 'btn-edit' : 'btn-success'}" onclick="taskController.toggleTaskStatus('${task.id}')">
            ${isCompleted ? '↩️ Reopen' : '✓ Complete'}
          </button>
          <button class="btn btn-edit" onclick="taskController.startEdit('${task.id}')">✏️ Edit</button>
          <button class="btn btn-danger" onclick="taskController.deleteTask('${task.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
  }

  clearForm() {
    document.getElementById('task-form').reset();
    document.getElementById('task-priority').value = 'Medium';
    document.getElementById('form-title').textContent = 'Add New Task';
    document.getElementById('cancel-btn').style.display = 'none';
  }

  openEditModal(task) {
    const modal = document.getElementById('edit-modal');
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-description').value = task.description || '';
    document.getElementById('edit-deadline').value = task.deadline ? this.formatDateTimeLocal(task.deadline) : '';
    document.getElementById('edit-priority').value = task.priority;
    modal.style.display = 'block';
  }

  closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
  }

  formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
