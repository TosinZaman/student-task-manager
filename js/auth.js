function getUsers() {
  var users = localStorage.getItem("users");
  return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function isValidEmail(email) {
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function showError(elementId, message) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function showSuccess(elementId, message) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideMessage(elementId) {
  var el = document.getElementById(elementId);
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function registerUser(event) {
  if (event) event.preventDefault();

  hideMessage("error-message");
  hideMessage("success-message");

  var name = document.getElementById("fullname").value.trim();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirm-password").value;

  if (!name || !email || !password || !confirmPassword) {
    showError("error-message", "Please fill in all fields.");
    return;
  }

  if (!isValidEmail(email)) {
    showError("error-message", "Please enter a valid email address.");
    return;
  }

  if (password.length < 6) {
    showError("error-message", "Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showError("error-message", "Passwords do not match.");
    return;
  }

  var users = getUsers();

  var existingUser = users.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase();
  });

  if (existingUser) {
    showError("error-message", "An account with this email already exists.");
    return;
  }

  var newUser = {
    name: name,
    email: email,
    password: password
  };

  users.push(newUser);
  saveUsers(users);

  showSuccess("success-message", "Account created successfully! Redirecting to login...");

  setTimeout(function () {
    window.location.href = "login.html";
  }, 1500);
}

function loginUser(event) {
  if (event) event.preventDefault();

  hideMessage("error-message");
  hideMessage("success-message");

  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  if (!email || !password) {
    showError("error-message", "Please fill in all fields.");
    return;
  }

  var users = getUsers();

  var matchedUser = users.find(function (user) {
    return user.email.toLowerCase() === email.toLowerCase() && user.password === password;
  });

  if (!matchedUser) {
    showError("error-message", "Invalid email or password.");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));

  showSuccess("success-message", "Login successful! Redirecting...");

  setTimeout(function () {
    window.location.href = "dashboard.html";
  }, 1000);
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}

function getUser() {
  var user = localStorage.getItem("loggedInUser");
  return user ? JSON.parse(user) : null;
}

function checkLogin() {
  var user = getUser();
  var currentPage = window.location.pathname.split("/").pop();

  if (!user && currentPage === "dashboard.html") {
    window.location.href = "login.html";
    return;
  }

  if (user && (currentPage === "login.html" || currentPage === "register.html")) {
    window.location.href = "dashboard.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  checkLogin();

  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
  }

  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }

  var userNameEl = document.getElementById("user-name");
  if (userNameEl) {
    var currentUser = getUser();
    if (currentUser) {
      userNameEl.textContent = currentUser.name;
    }
  }
});