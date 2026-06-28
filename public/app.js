/* =========================================
   SMART GOVERNANCE - FRONTEND APP.JS
========================================= */

const API = "http://localhost:5000";

/* =========================================
   LOADER
========================================= */

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  }
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

/* =========================================
   TOAST MESSAGE
========================================= */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}

/* =========================================
   REGISTER
========================================= */

async function register() {
  try {
    const nameEl = document.getElementById("name");
    const usernameEl = document.getElementById("username");
    const phoneEl = document.getElementById("phone");
    const addressEl = document.getElementById("address");
    const passwordEl = document.getElementById("password");
    const confirmPasswordEl = document.getElementById("confirmPassword");
    const termsEl = document.getElementById("terms");

    if (!nameEl || !usernameEl || !phoneEl || !addressEl || !passwordEl || !confirmPasswordEl || !termsEl) {
      return showToast("Form elements are missing on this page", "error");
    }

    const name = nameEl.value.trim();
    const username = usernameEl.value.trim();
    const phone = phoneEl.value.trim();
    const address = addressEl.value.trim();
    const password = passwordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    const terms = termsEl.checked;

    /* =====================
       VALIDATION
    ===================== */

    if (!name || !username || !phone || !address || !password || !confirmPassword) {
      return showToast("Please fill all fields", "error");
    }

    if (password !== confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    if (!terms) {
      return showToast("Accept Terms & Conditions", "error");
    }

    showLoader();

    /* =====================
       API CALL
    ===================== */

    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        phone,
        address,
        password,
        role: "citizen",
      }),
    });

    const data = await res.json();
    hideLoader();

    if (data.success) {
      showToast("Registration Successful");
      setTimeout(() => {
        window.location = "login.html";
      }, 1500);
    } else {
      showToast(data.message || "Registration failed", "error");
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    showToast("Server Error", "error");
  }
}

/* =========================================
   LOGIN
========================================= */

async function login() {
  try {
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");

    if (!usernameEl || !passwordEl) {
      return showToast("Login form elements are missing", "error");
    }

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) {
      return showToast("Please fill all fields", "error");
    }

    showLoader();

    /* =====================
       API REQUEST
    ===================== */

    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await res.json();
    hideLoader();

    if (data.success) {
      /* =====================
         STORE TOKEN
      ===================== */

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);

      showToast("Login Successful");

      /* =====================
         REDIRECT
      ===================== */

      setTimeout(() => {
        if (data.user.role === "admin") {
          window.location = "admin.html";
        } else if (data.user.role === "officer") {
          window.location = "officer.html";
        } else {
          window.location = "citizen.html";
        }
      }, 1200);
    } else {
      showToast(data.message || "Invalid Credentials", "error");
    }
  } catch (error) {
    hideLoader();
    console.error(error);
    showToast("Server Error", "error");
  }
}

/* =========================================
   LOGOUT
========================================= */

function logout() {
  localStorage.clear();
  showToast("Logged Out");
  setTimeout(() => {
    window.location = "login.html";
  }, 1000);
}

/* =========================================
   AUTH CHECK
========================================= */

function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location = "login.html";
  }
}

/* =========================================
   PROFILE DISPLAY
========================================= */

window.addEventListener("DOMContentLoaded", () => {
  const name = localStorage.getItem("name");
  const adminName = document.getElementById("adminName");
  const citizenName = document.getElementById("citizenName");
  const officerName = document.getElementById("officerName");

  if (adminName && name) {
    adminName.innerText = name;
  }
  if (citizenName && name) {
    citizenName.innerText = name;
  }
  if (officerName && name) {
    officerName.innerText = name;
  }
});

/* =========================================
   ENTER KEY SUPPORT
========================================= */

document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (window.location.href.includes("login")) {
      login();
    }
    if (window.location.href.includes("register")) {
      register();
    }
  }
});

/* =========================================
   TOKEN GETTER
========================================= */

function getToken() {
  return localStorage.getItem("token");
}

/* =========================================
   FETCH WITH AUTH
========================================= */

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  options.headers = {
    ...options.headers,
    authorization: token,
  };
  return fetch(url, options);
}

/* =========================================
   CHATBOT FUNCTION
========================================= */

async function sendAIMessage(message) {
  try {
    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });
    return await res.json();
  } catch (error) {
    return {
      success: false,
      reply: "AI Service Unavailable",
    };
  }
}

/* =========================================
   FORMAT DATE
========================================= */

function formatDate(date) {
  return new Date(date).toLocaleString();
}

/* =========================================
   STATUS BADGE
========================================= */

function getStatusBadge(status) {
  return `
    <span class="status-badge ${status}">
      ${status}
    </span>
  `;
}

/* =========================================
   RISK BADGE
========================================= */

function getRiskBadge(risk) {
  return `
    <span class="risk ${risk}">
      ${risk}
    </span>
  `;
}

/* =========================================
   DUPLICATE BADGE
========================================= */

function getDuplicateBadge(duplicate) {
  if (duplicate) {
    return `
      <span class="duplicate yes">
        Yes
      </span>
    `;
  }
  return `
    <span class="duplicate no">
      No
    </span>
  `;
}

/* =========================================
   AUTO GEOLOCATION
========================================= */

function autoFillLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = document.getElementById("lat");
        const lng = document.getElementById("lng");
        if (lat) {
          lat.value = position.coords.latitude;
        }
        if (lng) {
          lng.value = position.coords.longitude;
        }
      },
      (error) => {
        console.warn("Geolocation permission was denied or unavailable.");
      }
    );
  }
}

/* =========================================
   AUTO LOAD LOCATION
========================================= */

window.onload = () => {
  autoFillLocation();
};