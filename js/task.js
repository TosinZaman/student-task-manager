function getTasks() {
  var tasks = localStorage.getItem("tasks");
  return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTotalTasks() {
  return getTasks().length;
}

function getCompletedTasks() {
  return getTasks().filter(function (task) {
    return task.status === "completed";
  }).length;
}

function getPendingTasks() {
  return getTasks().filter(function (task) {
    return task.status === "pending";
  }).length;
}

function searchTasks(tasks, query) {
  if (!query) return tasks;
  var lowerQuery = query.toLowerCase();
  return tasks.filter(function (task) {
    return (
      task.title.toLowerCase().indexOf(lowerQuery) !== -1 ||
      task.subject.toLowerCase().indexOf(lowerQuery) !== -1
    );
  });
}

function filterTasks(tasks, status, subject) {
  return tasks.filter(function (task) {
    var statusMatch = status === "all" || task.status === status;
    var subjectMatch = subject === "all" || task.subject === subject;
    return statusMatch && subjectMatch;
  });
}

function addTask(event) {
  if (event) event.preventDefault();

  var title = document.getElementById("task-title").value.trim();
  var subject = document.getElementById("task-subject").value.trim();
  var date = document.getElementById("task-due-date").value;

  hideFormError();

  if (!title || !subject || !date) {
    showFormError("Please fill in all fields.");
    return;
  }

  var tasks = getTasks();

  var newTask = {
    id: Date.now(),
    title: title,
    subject: subject,
    date: date,
    status: "pending"
  };

  tasks.push(newTask);
  saveTasks(tasks);

  closeTaskForm();
  renderTasks();
}

function editTask(id) {
  var tasks = getTasks();
  var task = tasks.find(function (t) {
    return t.id === id;
  });

  if (!task) return;

  document.getElementById("task-id").value = task.id;
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-subject").value = task.subject;
  document.getElementById("task-due-date").value = task.date;
  document.getElementById("task-form-title").textContent = "Edit Task";
  document.getElementById("save-task-btn").textContent = "Update Task";

  openTaskForm();
}

function updateTask(event) {
  if (event) event.preventDefault();

  var id = Number(document.getElementById("task-id").value);
  var title = document.getElementById("task-title").value.trim();
  var subject = document.getElementById("task-subject").value.trim();
  var date = document.getElementById("task-due-date").value;

  hideFormError();

  if (!title || !subject || !date) {
    showFormError("Please fill in all fields.");
    return;
  }

  var tasks = getTasks();
  var task = tasks.find(function (t) {
    return t.id === id;
  });

  if (!task) return;

  task.title = title;
  task.subject = subject;
  task.date = date;

  saveTasks(tasks);
  closeTaskForm();
  renderTasks();
}

function deleteTask(id) {
  var confirmed = window.confirm("Are you sure you want to delete this task?");
  if (!confirmed) return;

  var tasks = getTasks();
  var updatedTasks = tasks.filter(function (t) {
    return t.id !== id;
  });

  saveTasks(updatedTasks);
  renderTasks();
}

function completeTask(id) {
  var tasks = getTasks();
  var task = tasks.find(function (t) {
    return t.id === id;
  });

  if (!task) return;

  task.status = task.status === "completed" ? "pending" : "completed";

  saveTasks(tasks);
  renderTasks();
}

function showFormError(message) {
  var el = document.getElementById("task-form-error");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideFormError() {
  var el = document.getElementById("task-form-error");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function openTaskForm() {
  var overlay = document.getElementById("task-form-overlay");
  if (overlay) overlay.hidden = false;
}

function closeTaskForm() {
  var overlay = document.getElementById("task-form-overlay");
  if (overlay) overlay.hidden = true;

  var form = document.getElementById("task-form");
  if (form) form.reset();

  document.getElementById("task-id").value = "";
  document.getElementById("task-form-title").textContent = "Add Task";
  document.getElementById("save-task-btn").textContent = "Add Task";

  hideFormError();
}

function updateSubjectFilterOptions() {
  var subjectFilter = document.getElementById("subject-filter");
  if (!subjectFilter) return;

  var tasks = getTasks();
  var subjects = [];

  tasks.forEach(function (task) {
    if (subjects.indexOf(task.subject) === -1) {
      subjects.push(task.subject);
    }
  });

  var currentValue = subjectFilter.value;

  subjectFilter.innerHTML = "";

  var allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Subjects";
  subjectFilter.appendChild(allOption);

  subjects.forEach(function (subject) {
    var option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectFilter.appendChild(option);
  });

  if (subjects.indexOf(currentValue) !== -1 || currentValue === "all") {
    subjectFilter.value = currentValue;
  }
}

function updateStats() {
  document.getElementById("total-tasks-count").textContent = getTotalTasks();
  document.getElementById("completed-tasks-count").textContent = getCompletedTasks();
  document.getElementById("pending-tasks-count").textContent = getPendingTasks();
}

function renderTasks() {
  var taskList = document.getElementById("task-list");
  var noTasksMessage = document.getElementById("no-tasks-message");
  var template = document.getElementById("task-item-template");

  if (!taskList || !template) return;

  updateSubjectFilterOptions();
  updateStats();

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

    var statusEl = clone.querySelector(".task-status");
    statusEl.textContent = task.status;

    var completeBtn = clone.querySelector(".task-complete-btn");
    completeBtn.textContent = task.status === "completed" ? "Undo" : "Complete";
    completeBtn.addEventListener("click", function () {
      completeTask(task.id);
    });

    var editBtn = clone.querySelector(".task-edit-btn");
    editBtn.addEventListener("click", function () {
      editTask(task.id);
    });

    var deleteBtn = clone.querySelector(".task-delete-btn");
    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });

    taskList.appendChild(clone);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var taskList = document.getElementById("task-list");
  if (!taskList) return;

  renderTasks();

  var taskForm = document.getElementById("task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", function (event) {
      var id = document.getElementById("task-id").value;
      if (id) {
        updateTask(event);
      } else {
        addTask(event);
      }
    });
  }

  var addTaskBtn = document.getElementById("add-task-btn");
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
      closeTaskForm();
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
    searchInput.addEventListener("input", renderTasks);
  }

  var statusFilter = document.getElementById("status-filter");
  if (statusFilter) {
    statusFilter.addEventListener("change", renderTasks);
  }

  var subjectFilter = document.getElementById("subject-filter");
  if (subjectFilter) {
    subjectFilter.addEventListener("change", renderTasks);
  }
});