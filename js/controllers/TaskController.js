/**
 * Task Controller
 * Handles business logic and coordinates between View and Repository
 * Implements MVC Pattern
 */
class TaskController {
    constructor(repository, view) {
        this.repository = repository;
        this.view = view;
        this.currentEditId = null;
        this.currentFilter = 'all';
        this.currentSort = 'none';
    }

    /**
     * Initialize controller
     */
    init() {
        this.loadTasks();
        this.setupEventListeners();
    }

    /**
     * Load tasks from repository and display
     */
    loadTasks() {
        const tasks = this.repository.getAll();
        this.applyFilterAndSort(tasks);
    }

    /**
     * Create new task (FR1)
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {string} deadline - Task deadline
     * @param {string} priority - Task priority
     */
    createTask(title, description, deadline, priority) {
        if (!title || title.trim() === '') {
            alert('Please enter a task title');
            return false;
        }

        const task = new Task(title.trim(), description, deadline, priority, 'ToDo');
        const success = this.repository.save(task);
        
        if (success) {
            this.loadTasks();
            this.view.clearForm();
            return true;
        } else {
            alert('An error occurred while saving the task');
            return false;
        }
    }

    /**
     * Update existing task (FR2)
     * @param {string} id - Task ID
     * @param {string} title - Task title
     * @param {string} description - Task description
     * @param {string} deadline - Task deadline
     * @param {string} priority - Task priority
     */
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
        const success = this.repository.save(task);
        
        if (success) {
            this.loadTasks();
            this.view.closeEditModal();
            this.currentEditId = null;
            return true;
        } else {
            alert('An error occurred while updating the task');
            return false;
        }
    }

    /**
     * Delete task (FR3)
     * @param {string} id - Task ID
     */
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const success = this.repository.delete(id);
            if (success) {
                this.loadTasks();
            } else {
                alert('An error occurred while deleting the task');
            }
        }
    }

    /**
     * Toggle task completion status (FR6)
     * @param {string} id - Task ID
     */
    toggleTaskStatus(id) {
        const task = this.repository.getById(id);
        if (!task) return;

        task.toggleStatus();
        this.repository.save(task);
        this.loadTasks();
    }

    /**
     * Set filter (FR7)
     * @param {string} filter - Filter type
     */
    setFilter(filter) {
        this.currentFilter = filter;
        this.loadTasks();
    }

    /**
     * Set sort (FR6 - Sorting)
     * @param {string} sort - Sort type
     */
    setSort(sort) {
        this.currentSort = sort;
        this.loadTasks();
    }

    /**
     * Apply filter and sort to tasks
     * @param {Array<Task>} tasks - Tasks array
     */
    applyFilterAndSort(tasks) {
        // Apply filter
        let filteredTasks = tasks;
        switch (this.currentFilter) {
            case 'completed':
                filteredTasks = tasks.filter(task => task.status === 'Completed');
                break;
            case 'not-completed':
                filteredTasks = tasks.filter(task => task.status === 'ToDo');
                break;
            case 'high-priority':
                filteredTasks = tasks.filter(task => task.priority === 'High');
                break;
            default:
                filteredTasks = tasks;
        }

        // Apply sort
        let sortedTasks = filteredTasks;
        switch (this.currentSort) {
            case 'deadline':
                sortedTasks = [...filteredTasks].sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                break;
            case 'priority':
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                sortedTasks = [...filteredTasks].sort((a, b) => {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                break;
            default:
                sortedTasks = filteredTasks;
        }

        this.view.displayTasks(sortedTasks, this.repository.getAll().length);
    }

    /**
     * Start editing task
     * @param {string} id - Task ID
     */
    startEdit(id) {
        const task = this.repository.getById(id);
        if (!task) return;

        this.currentEditId = id;
        this.view.openEditModal(task);
    }

    /**
     * Export tasks to text file (FR10)
     */
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

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Form submission
        const form = document.getElementById('task-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const startTime = performance.now();
            
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const deadline = document.getElementById('task-deadline').value;
            const priority = document.getElementById('task-priority').value;

            if (this.currentEditId) {
                this.updateTask(this.currentEditId, title, description, deadline, priority);
            } else {
                this.createTask(title, description, deadline, priority);
            }

            const endTime = performance.now();
            if (endTime - startTime > 2000) {
                console.warn('Operation took longer than 2 seconds');
            }
        });

        // Cancel button
        const cancelBtn = document.getElementById('cancel-btn');
        cancelBtn.addEventListener('click', () => {
            this.view.clearForm();
            this.currentEditId = null;
        });

        // Filter change
        const filterSelect = document.getElementById('filter-select');
        filterSelect.addEventListener('change', (e) => {
            this.setFilter(e.target.value);
        });

        // Sort change
        const sortSelect = document.getElementById('sort-select');
        sortSelect.addEventListener('change', (e) => {
            this.setSort(e.target.value);
        });

        // Export button
        const exportBtn = document.getElementById('export-btn');
        exportBtn.addEventListener('click', () => {
            this.exportTasks();
        });

        // Edit modal
        const editForm = document.getElementById('edit-form');
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const startTime = performance.now();
            
            const title = document.getElementById('edit-title').value;
            const description = document.getElementById('edit-description').value;
            const deadline = document.getElementById('edit-deadline').value;
            const priority = document.getElementById('edit-priority').value;

            this.updateTask(this.currentEditId, title, description, deadline, priority);

            const endTime = performance.now();
            if (endTime - startTime > 2000) {
                console.warn('Operation took longer than 2 seconds');
            }
        });

        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        cancelEditBtn.addEventListener('click', () => {
            this.view.closeEditModal();
            this.currentEditId = null;
        });

        // Modal close
        const modal = document.getElementById('edit-modal');
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            this.view.closeEditModal();
            this.currentEditId = null;
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.view.closeEditModal();
                this.currentEditId = null;
            }
        });

        // Auto-save on beforeunload (FR8)
        window.addEventListener('beforeunload', () => {
            // Data is already saved in LocalStorage on each operation
            // This ensures final save if needed
            const tasks = this.repository.getAll();
            this.repository.saveAll(tasks);
        });
    }
}

