function showUser() {
  var user = getUser();
  if (!user) return;

  var userNameEl = document.getElementById("user-name");
  if (userNameEl) userNameEl.textContent = user.name;

  var welcomeEl = document.getElementById("welcome-message");
  if (welcomeEl) welcomeEl.textContent = "Welcome back, " + user.name + "!";
}

function showStats() {
  document.getElementById("total-tasks-count").textContent = getTotalTasks();
  document.getElementById("completed-tasks-count").textContent = getCompletedTasks();
  document.getElementById("pending-tasks-count").textContent = getPendingTasks();
}

function showTasks() {
  var taskList = document.getElementById("task-list");
  var noTasksMessage = document.getElementById("no-tasks-message");
  var template = document.getElementById("task-item-template");

  if (!taskList || !template) return;

  if (typeof updateSubjectFilterOptions === "function") {
    updateSubjectFilterOptions();
  }

  var searchInput = document.getElementById("search-input");
  var statusFilter = document.getElementById("status-filter");
  var subjectFilter = document.getElementById("subject-filter");

  var query = searchInput ? searchInput.value.trim() : "";
  var status = statusFilter ? statusFilter.value : "all";
  var subject = subjectFilter ? subjectFilter.value : "all";

  var tasks = getTasks();
  tasks = searchTasks(tasks, query);
  tasks = filterTasks(tasks, status, subject);

  var existingItems = taskList.querySelectorAll(".task-item");
  existingItems.forEach(function (item) {
    item.remove();
  });

  if (tasks.length === 0) {
    if (noTasksMessage) noTasksMessage.hidden = false;
    showStats();
    return;
  }

  if (noTasksMessage) noTasksMessage.hidden = true;

  tasks.forEach(function (task) {
    var clone = template.content.cloneNode(true);
    var item = clone.querySelector(".task-item");

    item.setAttribute("data-task-id", task.id);
    if (task.status === "completed") {
      item.classList.add("completed");
    }

    clone.querySelector(".task-title").textContent = task.title;
    clone.querySelector(".task-subject").textContent = task.subject;
    clone.querySelector(".task-due-date").textContent = task.date;
    clone.querySelector(".task-status").textContent = task.status;

    var completeBtn = clone.querySelector(".task-complete-btn");
    completeBtn.textContent = task.status === "completed" ? "Undo" : "Complete";
    completeBtn.addEventListener("click", function () {
      completeTask(task.id);
      showTasks();
    });

    var editBtn = clone.querySelector(".task-edit-btn");
    editBtn.addEventListener("click", function () {
      openTaskForm(task.id);
    });

    var deleteBtn = clone.querySelector(".task-delete-btn");
    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
      showTasks();
    });

    taskList.appendChild(clone);
  });

  showStats();
}

function openTaskForm(taskId) {
  var overlay = document.getElementById("task-form-overlay");
  var formTitle = document.getElementById("task-form-title");
  var saveBtn = document.getElementById("save-task-btn");

  document.getElementById("task-form-error").hidden = true;

  if (taskId) {
    var task = getTasks().find(function (t) {
      return t.id === taskId;
    });

    if (task) {
      document.getElementById("task-id").value = task.id;
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-subject").value = task.subject;
      document.getElementById("task-due-date").value = task.date;
      if (formTitle) formTitle.textContent = "Edit Task";
      if (saveBtn) saveBtn.textContent = "Update Task";
    }
  } else {
    document.getElementById("task-form").reset();
    document.getElementById("task-id").value = "";
    if (formTitle) formTitle.textContent = "Add Task";
    if (saveBtn) saveBtn.textContent = "Add Task";
  }

  if (overlay) overlay.hidden = false;
}

function closeTaskForm() {
  var overlay = document.getElementById("task-form-overlay");
  if (overlay) overlay.hidden = true;

  var form = document.getElementById("task-form");
  if (form) form.reset();

  document.getElementById("task-id").value = "";

  var formTitle = document.getElementById("task-form-title");
  if (formTitle) formTitle.textContent = "Add Task";

  var saveBtn = document.getElementById("save-task-btn");
  if (saveBtn) saveBtn.textContent = "Add Task";

  var errorEl = document.getElementById("task-form-error");
  if (errorEl) errorEl.hidden = true;
}

function handleTaskFormSubmit(event) {
  event.preventDefault();

  var id = document.getElementById("task-id").value;

  if (id) {
    updateTask(event);
  } else {
    addTask(event);
  }

  showTasks();
}

function loadDashboard() {
  checkLogin();
  showUser();
  showTasks();
  showStats();

  var taskForm = document.getElementById("task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", handleTaskFormSubmit);
  }

  var addTaskBtn = document.getElementById("add-task-btn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
      openTaskForm();
    });
  }

  var cancelTaskBtn = document.getElementById("cancel-task-btn");
  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener("click", function () {
      closeTaskForm();
    });
  }

  var searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", showTasks);
  }

  var statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", showTasks);
  }

  var subjectFilter = document.getElementById("subject-filter");
  if (subjectFilter) {
    subjectFilter.addEventListener("change", showTasks);
  }

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);