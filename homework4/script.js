/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 4.0
Description: Homework 4 JavaScript for validation, Fetch API, cookies, and local storage.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  loadStates();
  hookSlider();
  hookButtons();
  loadFromStorage();
  applyCookie();
});

/* ---------- DATE ---------- */
function setToday() {
  const el = document.getElementById("today");
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function setDobRange() {
  const dob = document.getElementById("dob");
  if (!dob) return;

  const now = new Date();
  dob.max = toISO(now);
  dob.min = toISO(new Date(now.getFullYear() - 120, now.getMonth(), now.getDate()));
}

function toISO(d) {
  return d.toISOString().split("T")[0];
}

/* ---------- SLIDER ---------- */
function hookSlider() {
  const slider = document.getElementById("health");
  const out = document.getElementById("healthValue");
  if (!slider || !out) return;

  out.textContent = slider.value;
  slider.addEventListener("input", () => {
    out.textContent = slider.value;
    localStorage.setItem("health", slider.value);
  });
}

/* ---------- FETCH STATES ---------- */
async function loadStates() {
  const sel = document.getElementById("state");
  if (!sel) return;

  try {
    const res = await fetch("states.json");
    const states = await res.json();

    sel.innerHTML = '<option value="">Select a State</option>';

    states.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s.code;
      opt.textContent = s.code;
      sel.appendChild(opt);
    });

    if (localStorage.getItem("state")) {
      sel.value = localStorage.getItem("state");
    }
  } catch {
    sel.innerHTML = '<option value="">Select a State</option>';
  }
}

/* ---------- BUTTONS ---------- */
function hookButtons() {
  document.getElementById("validateBtn").addEventListener("click", validateAll);
  document.getElementById("resetBtn").addEventListener("click", clearAll);
}

/* ---------- VALIDATION ---------- */
function validateAll() {
  clearMessages();
  let valid = true;

  const fields = document.querySelectorAll("input, select, textarea");
  fields.forEach(f => {
    if (!f.checkValidity()) {
      valid = false;
      showMsg(f.id, "Please check this field.");
    }
  });

  const pw1 = document.getElementById("password").value;
  const pw2 = document.getElementById("password2").value;
  const userId = document.getElementById("userId").value.toLowerCase();

  if (pw1 !== pw2) {
    valid = false;
    showMsg("password2", "Passwords must match.");
  }

  if (pw1.toLowerCase().includes(userId)) {
    valid = false;
    showMsg("password", "Password cannot contain your User ID.");
  }

  if (valid) {
    document.getElementById("submitBtn").style.display = "inline-block";
    document.getElementById("statusBox").textContent = "All good. You can submit now.";
    saveData();
    setCookie();
  } else {
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("statusBox").textContent = "Fix the highlighted fields and click VALIDATE again.";
  }
}

/* ---------- MESSAGES ---------- */
function showMsg(id, text) {
  const el = document.getElementById(id + "Msg");
  if (el) el.textContent = text;
}

function clearMessages() {
  document.querySelectorAll(".errorMsg").forEach(m => m.textContent = "");
}

/* ---------- STORAGE ---------- */
function saveData() {
  const ids = [
    "firstName","lastName","dob","email","phone","idNumber",
    "addr1","addr2","city","state","zip","health","userId"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && id !== "password" && id !== "password2") {
      localStorage.setItem(id, el.value);
    }
  });
}

function loadFromStorage() {
  const ids = [
    "firstName","lastName","dob","email","phone","idNumber",
    "addr1","addr2","city","zip","health","userId"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    const val = localStorage.getItem(id);
    if (el && val) el.value = val;
  });
}

/* ---------- COOKIE ---------- */
function setCookie() {
  const first = document.getElementById("firstName").value;
  document.cookie = "firstName=" + first + "; max-age=172800; path=/";
}

function applyCookie() {
  const match = document.cookie.match(/firstName=([^;]+)/);
  if (match) {
    document.getElementById("welcomeMsg").textContent = "Welcome back, " + match[1];
  }
}

/* ---------- RESET ---------- */
function clearAll() {
  clearMessages();
  document.getElementById("submitBtn").style.display = "none";
  document.getElementById("statusBox").textContent = "Form cleared.";
  localStorage.clear();
}
