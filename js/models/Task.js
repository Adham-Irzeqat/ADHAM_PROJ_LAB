/**
 * Task Model
 * Represents a single task with all its properties
 */
class Task {
    constructor(title, description, deadline, priority, status = 'ToDo') {
        this.id = this.generateId();
        this.title = title;
        this.description = description || '';
        this.deadline = deadline || null;
        this.priority = priority || 'Medium';
        this.status = status; // ToDo or Completed
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Generate unique ID for task
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Update task properties
     */
    update(title, description, deadline, priority) {
        this.title = title;
        this.description = description || '';
        this.deadline = deadline || null;
        this.priority = priority || 'Medium';
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Mark task as completed
     */
    markCompleted() {
        this.status = 'Completed';
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Mark task as ToDo
     */
    markToDo() {
        this.status = 'ToDo';
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Toggle task status
     */
    toggleStatus() {
        if (this.status === 'Completed') {
            this.markToDo();
        } else {
            this.markCompleted();
        }
    }

    /**
     * Check if task is overdue
     */
    isOverdue() {
        if (!this.deadline) return false;
        return new Date(this.deadline) < new Date() && this.status !== 'Completed';
    }

    /**
     * Convert task to JSON
     */
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

    /**
     * Create task from JSON
     */
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

