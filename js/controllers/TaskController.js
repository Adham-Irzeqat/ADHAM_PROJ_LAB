class TaskController {
  constructor(repository, view) {
    this.repository = repository;
    this.view = view;
    this.currentEditId = null;
    this.currentFilter = 'all';
    this.currentSort = 'none';
  }

  init() {
    this.loadTasks();
    this.setupEventListeners();
  }

  loadTasks() {
    const tasks = this.repository.getAll();
    this.applyFilterAndSort(tasks);
  }

  createTask(title, description, deadline, priority) {
    if (!title || title.trim() === '') {
      alert('Please enter a task title');
      return false;
    }

    const task = TaskFactory.createTask({ title, description, deadline, priority });
    const ok = this.repository.save(task);

    if (ok) {
      this.loadTasks();
      this.view.clearForm();
      return true;
    }

    alert('An error occurred while saving the task');
    return false;
  }

  updateTask(id, title, description, deadline, priority) {
    if (!title || title.trim() === '') {
      alert('Please enter a task title');
      return false;
    }

    const task = this.repository.getById(id);
    if (!task) {
      alert('Task not found');
      return false;
    }

    task.update(title.trim(), description, deadline, priority);
    const ok = this.repository.save(task);

    if (ok) {
      this.loadTasks();
      this.view.closeEditModal();
      this.currentEditId = null;
      return true;
    }

    alert('An error occurred while updating the task');
    return false;
  }

  deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const ok = this.repository.delete(id);
    if (ok) this.loadTasks();
    else alert('An error occurred while deleting the task');
  }

  toggleTaskStatus(id) {
    const task = this.repository.getById(id);
    if (!task) return;

    task.toggleStatus();
    this.repository.save(task);
    this.loadTasks();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.loadTasks();
  }

  setSort(sort) {
    this.currentSort = sort;
    this.loadTasks();
  }

  applyFilterAndSort(tasks) {
    let filtered = tasks;

    if (this.currentFilter === 'completed') {
      filtered = tasks.filter(t => t.status === 'Completed');
    } else if (this.currentFilter === 'not-completed') {
      filtered = tasks.filter(t => t.status === 'ToDo');
    } else if (this.currentFilter === 'high-priority') {
      filtered = tasks.filter(t => t.priority === 'High');
    }

    let sorted = filtered;

    if (this.currentSort === 'deadline') {
      sorted = [...filtered].sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    } else if (this.currentSort === 'priority') {
      const order = { High: 3, Medium: 2, Low: 1 };
      sorted = [...filtered].sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
    }

    this.view.displayTasks(sorted, this.repository.getAll().length);
  }

  startEdit(id) {
    const task = this.repository.getById(id);
    if (!task) return;

    this.currentEditId = id;
    this.view.openEditModal(task);
  }

  exportTasks() {
    const text = this.repository.exportToText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_export_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  setupEventListeners() {
    const form = document.getElementById('task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const start = performance.now();

      const title = document.getElementById('task-title').value;
      const description = document.getElementById('task-description').value;
      const deadline = document.getElementById('task-deadline').value;
      const priority = document.getElementById('task-priority').value;

      if (this.currentEditId) this.updateTask(this.currentEditId, title, description, deadline, priority);
      else this.createTask(title, description, deadline, priority);

      const end = performance.now();
      if (end - start > 2000) console.warn('Operation took longer than 2 seconds');
    });

    const cancelBtn = document.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', () => {
      this.view.clearForm();
      this.currentEditId = null;
    });

    document.getElementById('filter-select').addEventListener('change', (e) => {
      this.setFilter(e.target.value);
    });

    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.setSort(e.target.value);
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.exportTasks();
    });

    const editForm = document.getElementById('edit-form');
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const start = performance.now();

      const title = document.getElementById('edit-title').value;
      const description = document.getElementById('edit-description').value;
      const deadline = document.getElementById('edit-deadline').value;
      const priority = document.getElementById('edit-priority').value;

      this.updateTask(this.currentEditId, title, description, deadline, priority);

      const end = performance.now();
      if (end - start > 2000) console.warn('Operation took longer than 2 seconds');
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
      this.view.closeEditModal();
      this.currentEditId = null;
    });

    const modal = document.getElementById('edit-modal');
    document.querySelector('.close').addEventListener('click', () => {
      this.view.closeEditModal();
      this.currentEditId = null;
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.view.closeEditModal();
        this.currentEditId = null;
      }
    });

    window.addEventListener('beforeunload', () => {
      this.repository.saveAll(this.repository.getAll());
    });
  }
}
