// ===== Global State =====
let socket = null;
let currentUser = null;
let selectedUser = null;
let allUsers = [];
let messages = [];
let typingTimeout = null;

const API_BASE = "http://localhost:4001";
const SOCKET_URL = "http://localhost:4001";

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  setupEventListeners();
});

// ===== Authentication Functions =====
function checkAuthStatus() {
  // Check if user is logged in (you can enhance this with session storage)
  const storedUser = sessionStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    showChatScreen();
  }
}

async function handleRegister() {
  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const errorDiv = document.getElementById("register-error");

  if (!username || !email || !password) {
    showError(errorDiv, "All fields are required");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (data.success) {
      showLogin();
      showSuccess("Account created! Please login.");
    } else {
      showError(errorDiv, data.message || "Registration failed");
    }
  } catch (error) {
    showError(errorDiv, "Network error. Please try again.");
    console.error("Register error:", error);
  }
}

async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  if (!email || !password) {
    showError(errorDiv, "All fields are required");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      showChatScreen();
    } else {
      showError(errorDiv, data.message || "Login failed");
    }
  } catch (error) {
    showError(errorDiv, "Network error. Please try again.");
    console.error("Login error:", error);
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/users/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (socket) {
      socket.disconnect();
    }

    currentUser = null;
    selectedUser = null;
    sessionStorage.removeItem("currentUser");

    document.getElementById("chat-screen").style.display = "none";
    document.getElementById("auth-screen").style.display = "flex";
    showLogin();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// ===== UI Functions =====
function showLogin() {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("register-form").style.display = "none";
  clearErrors();
}

function showRegister() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
  clearErrors();
}

function showError(element, message) {
  element.textContent = message;
  element.classList.add("show");
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
    el.classList.remove("show");
  });
}

function showSuccess(message) {
  // You can implement a toast notification here
  console.log("Success:", message);
}

function showChatScreen() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "flex";

  // Set current user info
  document.getElementById("current-user-name").textContent =
    currentUser.username;
  document.getElementById("current-user-avatar").src =
    currentUser.profilePicture || getDefaultAvatar(currentUser.username);

  // Initialize Socket.IO and load users
  initializeSocket();
  loadUsers();
}

// ===== Socket.IO Functions =====
function initializeSocket() {
  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    socket.userId = currentUser._id;
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  socket.on("message:reciver", (data) => {
    handleIncomingMessage(data);
  });

  socket.on("message:sender", (data) => {
    handleSentMessage(data);
  });

  socket.on("typing:start", (data) => {
    if (selectedUser && data.reciver === currentUser._id) {
      showTypingIndicator();
    }
  });

  socket.on("typing:stop", (data) => {
    if (selectedUser && data.reciver === currentUser._id) {
      hideTypingIndicator();
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
}

// ===== User Functions =====
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE}/users/`, {
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      allUsers = data.users.filter((user) => user._id !== currentUser._id);
      renderUsers(allUsers);
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

function renderUsers(users) {
  const usersList = document.getElementById("users-list");

  if (users.length === 0) {
    usersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>No users found</p>
            </div>
        `;
    return;
  }

  usersList.innerHTML = users
    .map(
      (user) => `
        <div class="user-item ${selectedUser && selectedUser._id === user._id ? "active" : ""}" 
             onclick="selectUser('${user._id}')">
            <div style="position: relative;">
                <img src="${user.profilePicture || getDefaultAvatar(user.username)}" 
                     alt="${user.username}" 
                     class="avatar">
                ${user.isOnline ? '<div class="online-badge"></div>' : ""}
            </div>
            <div class="user-item-info">
                <h4>${user.username}</h4>
                <p>${user.isOnline ? "Online" : "Offline"}</p>
            </div>
        </div>
    `,
    )
    .join("");
}

function filterUsers() {
  const searchTerm = document.getElementById("user-search").value.toLowerCase();
  const filtered = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm),
  );
  renderUsers(filtered);
}

async function selectUser(userId) {
  selectedUser = allUsers.find((user) => user._id === userId);

  if (!selectedUser) return;

  // Update UI
  document.getElementById("chat-user-name").textContent = selectedUser.username;
  document.getElementById("chat-user-avatar").src =
    selectedUser.profilePicture || getDefaultAvatar(selectedUser.username);
  document.getElementById("chat-user-status").textContent =
    selectedUser.isOnline ? "Online" : "Offline";

  // Update active user in sidebar
  renderUsers(allUsers);

  // Load messages
  await loadMessages(userId);

  // Hide empty state
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.style.display = "none";
  }
}

// ===== Message Functions =====
async function loadMessages(userId) {
  try {
    const response = await fetch(`${API_BASE}/messages/${userId}`, {
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      messages = data.data || [];
      renderMessages();
    }
  } catch (error) {
    console.error("Error loading messages:", error);
    messages = [];
    renderMessages();
  }
}

function renderMessages() {
  const container = document.getElementById("messages-container");

  if (messages.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#f0f0f0"/>
                    <path d="M40 50C40 45.5817 43.5817 42 48 42H72C76.4183 42 80 45.5817 80 50V66C80 70.4183 76.4183 74 72 74H62L50 84V74C47.7909 74 46 72.2091 46 70V50Z" fill="#667eea" opacity="0.3"/>
                </svg>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message</p>
            </div>
        `;
    return;
  }

  container.innerHTML = messages
    .map((msg) => {
      const isSent =
        msg.sender._id === currentUser._id || msg.sender === currentUser._id;
      const time = formatTime(msg.createdAt);

      return `
            <div class="message ${isSent ? "sent" : "received"}">
                <div class="message-content">
                    <div class="message-bubble">
                        ${escapeHtml(msg.message)}
                    </div>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
    })
    .join("");

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("message-input");
  const message = input.value.trim();

  if (!message || !selectedUser) return;

  if (!socket || !socket.connected) {
    alert("Not connected to server. Please refresh the page.");
    return;
  }

  // Emit message via Socket.IO
  socket.emit("message:send", {
    reciver: selectedUser._id,
    message: message,
  });

  // Clear input
  input.value = "";
  input.style.height = "auto";

  // Stop typing indicator
  stopTyping();
}

function handleIncomingMessage(data) {
  // Only add if it's from the currently selected user
  if (
    selectedUser &&
    (data.sender._id === selectedUser._id || data.sender === selectedUser._id)
  ) {
    messages.push(data);
    renderMessages();
  }
}

function handleSentMessage(data) {
  // Add sent message to the list
  if (
    selectedUser &&
    (data.reciver._id === selectedUser._id || data.reciver === selectedUser._id)
  ) {
    messages.push(data);
    renderMessages();
  }
}

// ===== Typing Indicator Functions =====
let isTyping = false;

function handleTyping() {
  if (!selectedUser || !socket) return;

  if (!isTyping) {
    isTyping = true;
    socket.emit("typing:start", { reciver: selectedUser._id });
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 1000);
}

function stopTyping() {
  if (isTyping && selectedUser && socket) {
    isTyping = false;
    socket.emit("typing:stop", { reciver: selectedUser._id });
  }
}

function showTypingIndicator() {
  document.getElementById("chat-user-status").textContent = "typing...";
}

function hideTypingIndicator() {
  document.getElementById("chat-user-status").textContent =
    selectedUser.isOnline ? "Online" : "Offline";
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Enter key to send message
  document.getElementById("message-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  document
    .getElementById("message-input")
    ?.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

  // Login form enter key
  document
    .getElementById("login-password")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleLogin();
      }
    });

  // Register form enter key
  document
    .getElementById("register-password")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleRegister();
      }
    });
}

function handleKeyPress(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// ===== Utility Functions =====
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Different year
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDefaultAvatar(username) {
  // Generate a default avatar using DiceBear API
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Refresh Users Periodically =====
setInterval(() => {
  if (
    currentUser &&
    document.getElementById("chat-screen").style.display !== "none"
  ) {
    loadUsers();
  }
}, 30000); // Refresh every 30 seconds
