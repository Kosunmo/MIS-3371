/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/09/2026
Version: 4.1
Description: Homework 4 JS for on-the-fly validation, Fetch API states list, iFrame support,
cookies (remember first name), and localStorage (non-secure fields). Validate button enables Submit.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookLiveValidation();
  hookButtons();
  hookSlider();

  // HW4 additions
  fetchStatesOptions();        // Fetch API
  initRemembering();           // cookie + localStorage
});

function setToday() {
  const el = document.getElementById("today");
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function setDobRange() {
  const dob = document.getElementById("dob");
  if (!dob) return;

  const now = new Date();
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

  dob.max = toISO(max);
  dob.min = toISO(min);
}

function toISO(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function hookSlider() {
  const slider = document.getElementById("health");
  if (!slider) return;
  slider.addEventListener("input", updateHealthValue);
  updateHealthValue();
}

function updateHealthValue() {
  const slider = document.getElementById("health");
  const out = document.getElementById("healthValue");
  if (slider && out) out.textContent = slider.value;
}

async function fetchStatesOptions() {
  const stateSel = document.getElementById("state");
  if (!stateSel) return;

  try {
    const resp = await fetch("states-options.html", { cache: "no-store" });
    if (!resp.ok) throw new Error("Fetch failed");

    const optionsHtml = await resp.text();

    // Always keep a null option first
    stateSel.innerHTML = '<option value="">Select a State</option>' + optionsHtml;
  } catch (err) {
    // Fallback: still allow the form to work
    stateSel.innerHTML = '<option value="">Select a State</option>';
    setStatus("Could not load states list. (Fetch API error) You can still fill out other fields.");
  }
}

function hookLiveValidation() {
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", function () {
      validateField(id);
    });

    el.addEventListener("blur", function () {
      validateField(id);
      maybeSaveField(id);
      maybeRememberFirstName();
    });
  });

  // Normalize email/userId to lowercase on blur
  const email = document.getElementById("email");
  if (email) email.addEventListener("blur", function () {
    email.value = email.value.trim().toLowerCase();
    validateField("email");
    maybeSaveField("email");
  });

  const userId = document.getElementById("userId");
  if (userId) userId.addEventListener("blur", function () {
    userId.value = userId.value.trim().toLowerCase();
    validateField("userId");
    maybeSaveField("userId");
  });

  // Force digits only for ID number (max 9)
  const idNumber = document.getElementById("idNumber");
  if (idNumber) idNumber.addEventListener("input", function () {
    idNumber.value = idNumber.value.replace(/\D/g, "").slice(0, 9);
  });

  // Zip digits only (max 5)
  const zip = document.getElementById("zip");
  if (zip) zip.addEventListener("input", function () {
    zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
  });

  // Save radios/checkboxes/selects when changed
  const form = document.getElementById("patientForm");
  if (form) {
    form.addEventListener("change", function (e) {
      const t = e.target;
      if (!t) return;

      if (t.type === "checkbox" || t.type === "radio" || t.tagName === "SELECT") {
        maybeSaveAllNonSecure();
      }

      if (t.id === "rememberMe") handleRememberMeToggle();
      if (t.id === "newUserChk") handleNewUserToggle();
    });
  }
}

function hookButtons() {
  const validateBtn = document.getElementById("validateBtn");
  const resetBtn = document.getElementById("resetBtn");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("patientForm");

  if (validateBtn) validateBtn.addEventListener("click", function () {
    const ok = validateAll();
    if (ok) {
      setStatus("All set. Submit is enabled.");
      if (submitBtn) submitBtn.style.display = "inline-block";

      // save data if remember is on
      maybeRememberFirstName();
      maybeSaveAllNonSecure();
    } else {
      setStatus("Fix the items shown in red, then click VALIDATE again.");
      if (submitBtn) submitBtn.style.display = "none";
    }
  });

  if (resetBtn) resetBtn.addEventListener("click", function () {
    clearMessages();
    setStatus("Form cleared. Fill it out and click VALIDATE.");
    if (submitBtn) submitBtn.style.display = "none";
    updateHealthValue();

    // if remember is off, clear storage/cookie
    handleRememberMeToggle();
  });

  // Safety: block submit if not valid
  if (form) form.addEventListener("submit", function (e) {
    const ok = validateAll();
    if (!ok) {
      e.preventDefault();
      setStatus("Not submitted. Fix the items shown, then click VALIDATE.");
      if (submitBtn) submitBtn.style.display = "none";
      return;
    }

    // final save before leaving page
    maybeRememberFirstName();
    maybeSaveAllNonSecure();
  });
}

function setStatus(text) {
  const el = document.getElementById("statusBox");
  if (el) el.textContent = text;
}

function setMsg(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function clearMessages() {
  const msgs = document.querySelectorAll(".errorMsg");
  for (let i = 0; i < msgs.length; i++) msgs[i].textContent = "";
}

function validateAll() {
  let ok = true;
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  for (let i = 0; i < ids.length; i++) {
    if (!validateField(ids[i])) ok = false;
  }

  // Cross-field checks
  const userId = (document.getElementById("userId").value || "").trim().toLowerCase();
  const pw1 = document.getElementById("password").value || "";
  const pw2 = document.getElementById("password2").value || "";

  if (userId && pw1 && pw1.toLowerCase() === userId) {
    ok = false;
    setMsg("passwordMsg", "Password cannot be the same as your User ID.");
  }

  if ((pw1 || pw2) && pw1 !== pw2) {
    ok = false;
    setMsg("password2Msg", "Passwords must match.");
  }

  return ok;
}

function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;

  const msgId = id + "Msg";
  let msg = "";

  // Optional fields
  const optional = (id === "middleInitial" || id === "addr2" || id === "phone" || id === "symptoms");
  const value = (el.value || "").trim();
  if (optional && value === "") {
    setMsg(msgId, "");
    return true;
  }

  if (!el.checkValidity()) {
    if (el.validity.valueMissing) msg = "Required.";
    else if (el.validity.patternMismatch) msg = "Format is not correct.";
    else if (el.validity.tooShort) msg = "Too short.";
    else if (el.validity.tooLong) msg = "Too long.";
    else if (el.validity.typeMismatch) msg = "Invalid value.";
    else msg = "Fix this field.";
  }

  // DOB range message
  if (!msg && id === "dob" && value) {
    const dobDate = new Date(value + "T00:00:00");
    const now = new Date();
    const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dobDate < min) msg = "DOB looks too far in the past.";
    if (dobDate > max) msg = "DOB cannot be in the future.";
  }

  // Block double quotes in text area
  if (!msg && id === "symptoms" && value.includes('"')) msg = 'Remove double quotes (").';

  setMsg(msgId, msg);
  return msg === "";
}

// Cookie helpers
function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const target = name + "=";
  const parts = document.cookie.split(";");
  for (let i = 0; i < parts.length; i++) {
    let c = parts[i].trim();
    if (c.indexOf(target) === 0) return decodeURIComponent(c.substring(target.length, c.length));
  }
  return "";
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const COOKIE_NAME = "hw4_firstName";

// Local storage per user (key includes cookie name)
function storageKeyForUser(name) {
  const safe = String(name || "").trim().toLowerCase();
  if (!safe) return "";
  return "hw4_patient_nonsecure_" + safe;
}

function initRemembering() {
  const remember = document.getElementById("rememberMe");
  const firstNameCookie = getCookie(COOKIE_NAME);

  if (firstNameCookie) {
    showReturningBox(firstNameCookie);

    // Prefill first name
    const fn = document.getElementById("firstName");
    if (fn && !fn.value) fn.value = firstNameCookie;

    setWelcomeLine(true, firstNameCookie);

    // Load localStorage values if remember is checked (or checkbox missing)
    if (!remember || remember.checked) {
      loadNonSecureFromStorage(firstNameCookie);
    }
  } else {
    setWelcomeLine(false, "");
  }

  // If rememberMe unchecked at load, do not keep data
  handleRememberMeToggle();
}

function setWelcomeLine(isReturning, name) {
  const line = document.getElementById("welcomeLine");
  if (!line) return;

  if (isReturning && name) {
    line.innerHTML = 'Welcome back, <strong>' + escapeHtml(name) + '</strong>. Today is: <span id="today">Loading...</span>';
    setToday();
  } else {
    line.innerHTML = 'Hello new user. Today is: <span id="today">Loading...</span>';
    setToday();
  }
}

function showReturningBox(name) {
  const box = document.getElementById("returningBox");
  const txt = document.getElementById("returningText");
  if (!box || !txt) return;

  box.style.display = "block";
  txt.textContent = "Cookie found for first name: " + name + ". If this is not you, check the box below.";
}

function handleNewUserToggle() {
  const chk = document.getElementById("newUserChk");
  if (!chk) return;

  if (chk.checked) {
    const priorName = getCookie(COOKIE_NAME);

    // Clear cookie + this user's local storage
    deleteCookie(COOKIE_NAME);
    if (priorName) {
      const k = storageKeyForUser(priorName);
      if (k) localStorage.removeItem(k);
    }

    const form = document.getElementById("patientForm");
    if (form) form.reset();

    clearMessages();
    setStatus("Started as NEW USER. Saved cookie/storage cleared. Fill out the form and click VALIDATE.");

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.style.display = "none";

    setWelcomeLine(false, "");

    const box = document.getElementById("returningBox");
    if (box) box.style.display = "none";

    updateHealthValue();
  }
}

function handleRememberMeToggle() {
  const remember = document.getElementById("rememberMe");
  if (!remember) return;

  if (!remember.checked) {
    const priorName = getCookie(COOKIE_NAME);

    // Requirement: if not checked, expire cookie and delete local data
    deleteCookie(COOKIE_NAME);
    if (priorName) {
      const k = storageKeyForUser(priorName);
      if (k) localStorage.removeItem(k);
    }

    const box = document.getElementById("returningBox");
    if (box) box.style.display = "none";

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.style.display = "none";

    // IMPORTANT: update heading immediately
    setWelcomeLine(false, "");
  } else {
    // If checked, save immediately if first name exists
    maybeRememberFirstName();
    maybeSaveAllNonSecure();
  }
}

function maybeRememberFirstName() {
  const remember = document.getElementById("rememberMe");
  if (!remember || !remember.checked) return;

  const fn = document.getElementById("firstName");
  if (!fn) return;

  const name = (fn.value || "").trim();
  if (name) {
    setCookie(COOKIE_NAME, name, 48);
    setWelcomeLine(true, name);
    showReturningBox(name);
  }
}

function maybeSaveField(id) {
  const remember = document.getElementById("rememberMe");
  if (!remember || !remember.checked) return;

  // Do NOT store secure fields
  if (id === "idNumber" || id === "password" || id === "password2") return;

  maybeSaveAllNonSecure();
}

function maybeSaveAllNonSecure() {
  const remember = document.getElementById("rememberMe");
  if (!remember || !remember.checked) return;

  const name = getCookie(COOKIE_NAME);
  const k = storageKeyForUser(name);
  if (!k) return;

  const data = {};

  // text/select/textarea
  const ids = [
    "firstName","middleInitial","lastName","dob","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","health"
  ];

  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (el) data[ids[i]] = el.value;
  }

  // checkboxes (history)
  const history = document.querySelectorAll('input[name="history"]');
  data.history = [];
  for (let i = 0; i < history.length; i++) {
    if (history[i].checked) data.history.push(history[i].value);
  }

  // radios
  data.gender = getRadioValue("gender");
  data.vaccinated = getRadioValue("vaccinated");
  data.insurance = getRadioValue("insurance");

  localStorage.setItem(k, JSON.stringify(data));
}

function loadNonSecureFromStorage(name) {
  const k = storageKeyForUser(name);
  if (!k) return;

  const raw = localStorage.getItem(k);
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }

  // basic fields
  const ids = [
    "firstName","middleInitial","lastName","dob","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","health"
  ];

  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (el && typeof data[ids[i]] !== "undefined" && data[ids[i]] !== null) {
      el.value = data[ids[i]];
    }
  }

  // checkbox history
  if (Array.isArray(data.history)) {
    const history = document.querySelectorAll('input[name="history"]');
    for (let i = 0; i < history.length; i++) {
      history[i].checked = data.history.indexOf(history[i].value) !== -1;
    }
  }

  // radios
  setRadioValue("gender", data.gender);
  setRadioValue("vaccinated", data.vaccinated);
  setRadioValue("insurance", data.insurance);

  updateHealthValue();
}

function getRadioValue(name) {
  const nodes = document.querySelectorAll('input[name="' + name + '"]');
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].checked) return nodes[i].value;
  }
  return "";
}

function setRadioValue(name, value) {
  if (!value) return;
  const nodes = document.querySelectorAll('input[name="' + name + '"]');
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].checked = (nodes[i].value === value);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
