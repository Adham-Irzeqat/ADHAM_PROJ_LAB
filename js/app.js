const taskRepository = new TaskRepository();
const taskView = new TaskView();
const taskController = new TaskController(taskRepository, taskView);

window.taskController = taskController;

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.setAttribute('lang', 'en');
  document.documentElement.setAttribute('dir', 'ltr');

  const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
  dateInputs.forEach(input => {
    input.setAttribute('lang', 'en');
    input.style.direction = 'ltr';
    input.style.textAlign = 'left';
  });

  taskController.init();
});
