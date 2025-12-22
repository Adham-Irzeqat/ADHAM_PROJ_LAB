/**
 * Task Repository
 * Handles data persistence using LocalStorage
 * Implements Repository Pattern for data access abstraction
 */
class TaskRepository {
    constructor() {
        this.storageKey = 'smart_task_organizer_tasks';
    }

    /**
     * Get all tasks from storage
     * @returns {Array<Task>} Array of Task objects
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];
            
            const tasksJson = JSON.parse(data);
            return tasksJson.map(taskJson => Task.fromJSON(taskJson));
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {Task|null} Task object or null if not found
     */
    getById(id) {
        const tasks = this.getAll();
        return tasks.find(task => task.id === id) || null;
    }

    /**
     * Save task to storage
     * @param {Task} task - Task object to save
     * @returns {boolean} Success status
     */
    save(task) {
        try {
            const tasks = this.getAll();
            const existingIndex = tasks.findIndex(t => t.id === task.id);
            
            if (existingIndex >= 0) {
                tasks[existingIndex] = task;
            } else {
                tasks.push(task);
            }
            
            this.saveAll(tasks);
            return true;
        } catch (error) {
            console.error('Error saving task:', error);
            return false;
        }
    }

    /**
     * Save all tasks to storage
     * @param {Array<Task>} tasks - Array of Task objects
     * @returns {boolean} Success status
     */
    saveAll(tasks) {
        try {
            const tasksJson = tasks.map(task => task.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(tasksJson));
            return true;
        } catch (error) {
            console.error('Error saving all tasks:', error);
            return false;
        }
    }

    /**
     * Delete task by ID
     * @param {string} id - Task ID
     * @returns {boolean} Success status
     */
    delete(id) {
        try {
            const tasks = this.getAll();
            const filteredTasks = tasks.filter(task => task.id !== id);
            this.saveAll(filteredTasks);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }

    /**
     * Clear all tasks
     * @returns {boolean} Success status
     */
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing tasks:', error);
            return false;
        }
    }

    /**
     * Export tasks to text format
     * @returns {string} Formatted text string
     */
    exportToText() {
        const tasks = this.getAll();
        if (tasks.length === 0) {
            return 'No tasks to export';
        }

        let text = '═══════════════════════════════════════\n';
        text += '     Task List - Smart Task Organizer\n';
        text += '═══════════════════════════════════════\n\n';
        text += `Export Date: ${new Date().toLocaleString('en-US')}\n`;
        text += `Total Tasks: ${tasks.length}\n\n`;

        tasks.forEach((task, index) => {
            text += `\n[${index + 1}] ${task.title}\n`;
            text += `${'─'.repeat(40)}\n`;
            text += `Status: ${task.status === 'Completed' ? 'Completed ✓' : 'To Do'}\n`;
            text += `Priority: ${this.getPriorityLabel(task.priority)}\n`;
            
            if (task.description) {
                text += `Description: ${task.description}\n`;
            }
            
            if (task.deadline) {
                const deadlineDate = new Date(task.deadline);
                text += `Deadline: ${deadlineDate.toLocaleString('en-US')}\n`;
                if (task.isOverdue()) {
                    text += `⚠️ Overdue!\n`;
                }
            }
            
            text += `Created: ${new Date(task.createdAt).toLocaleString('en-US')}\n`;
            text += `Updated: ${new Date(task.updatedAt).toLocaleString('en-US')}\n`;
            text += '\n';
        });

        text += '\n═══════════════════════════════════════\n';
        return text;
    }

    /**
     * Get priority label
     * @param {string} priority - Priority value
     * @returns {string} Priority label
     */
    getPriorityLabel(priority) {
        const labels = {
            'High': 'High',
            'Medium': 'Medium',
            'Low': 'Low'
        };
        return labels[priority] || priority;
    }
}

