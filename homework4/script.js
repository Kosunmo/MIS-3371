/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/09/2026
Version: 4.2
Description: HW4: Uses HW3-style validation gating (any invalid change hides SUBMIT until VALIDATE),
plus Fetch API for states, iFrame support (HTML), sticky header/fixed footer (CSS),
cookies (remember first name), and localStorage (non-secure fields).
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookSlider();
  hookLiveValidation();
  hookButtons();
  hookFormReset();

  // HW4 additions
  fetchStatesOptions();  // Fetch API
  initRemembering();     // cookie + localStorage
});

/* -----------------------------
   Banner date
----------------------------- */
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

/* -----------------------------
   DOB range
----------------------------- */
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

/* -----------------------------
   Slider
----------------------------- */
function hookSlider() {
  const slider = document.getElementById("health");
  if (!slider) return;

  slider.addEventListener("input", updateHealthValue);
  slider.addEventListener("change", updateHealthValue);
  updateHealthValue();
}

function updateHealthValue() {
  const slider = document.getElementById("health");
  const out = document.getElementById("healthValue");
  if (slider && out) out.textContent = slider.value;
}

/* -----------------------------
   Fetch API: load states from separate file
----------------------------- */
async function fetchStatesOptions() {
  const stateSel = document.getElementById("state");
  if (!stateSel) return;

  try {
    const resp = await fetch("states-options.html", { cache: "no-store" });
    if (!resp.ok) throw new Error("Fetch failed");
    const optionsHtml = await resp.text();
    stateSel.innerHTML = '<option value="">Select a State</option>' + optionsHtml;
  } catch (err) {
    stateSel.innerHTML = '<option value="">Select a State</option>';
    setStatus("Could not load states list. (Fetch API error) You can still fill out other fields.");
  }
}

/* -----------------------------
   Live validation wiring
   Any invalid edit hides SUBMIT until re-VALIDATE.
   Also saves localStorage + cookie on blur/change.
----------------------------- */
function hookLiveValidation() {
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", function () {
      const ok = validateField(id);
      if (!ok) hideSubmit();
    });

    el.addEventListener("blur", function () {
      const ok = validateField(id);
      if (!ok) hideSubmit();

      // persistence
      maybeRememberFirstName();
      maybeSaveField(id);
    });
  });

  // normalize email and userId
  const email = document.getElementById("email");
  if (email) {
    email.addEventListener("blur", function () {
      email.value = email.value.trim().toLowerCase();
      const ok = validateField("email");
      if (!ok) hideSubmit();
      maybeSaveField("email");
    });
  }

  const userId = document.getElementById("userId");
  if (userId) {
    userId.addEventListener("blur", function () {
      userId.value = userId.value.trim().toLowerCase();
      const ok = validateField("userId");
      if (!ok) hideSubmit();
      maybeSaveField("userId");
    });
  }

  // ID number digits only (9)
  const idNumber = document.getElementById("idNumber");
  if (idNumber) {
    idNumber.addEventListener("input", function () {
      idNumber.value = idNumber.value.replace(/\D/g, "").slice(0, 9);
      const ok = validateField("idNumber");
      if (!ok) hideSubmit();
    });
  }

  // zip digits only (5)
  const zip = document.getElementById("zip");
  if (zip) {
    zip.addEventListener("input", function () {
      zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
      const ok = validateField("zip");
      if (!ok) hideSubmit();
    });
  }

  // changes for checkboxes/radios/select + remember/new user toggles
  const form = document.getElementById("patientForm");
  if (form) {
    form.addEventListener("change", function (e) {
      const t = e.target;
      if (!t) return;

      if (t.id === "rememberMe") handleRememberMeToggle();
      if (t.id === "newUserChk") handleNewUserToggle();

      if (t.type === "checkbox" || t.type === "radio" || t.tagName === "SELECT") {
        maybeSaveAllNonSecure();
      }
    });
  }
}

/* -----------------------------
   Buttons + submit gating
----------------------------- */
function hookButtons() {
  const validateBtn = document.getElementById("validateBtn");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("patientForm");

  if (validateBtn) {
    validateBtn.addEventListener("click", function () {
      const ok = validateAll();
      if (ok) {
        setStatus("All set. Submit is enabled.");
        if (submitBtn) submitBtn.style.display = "inline-block";

        // persistence on validate
        maybeRememberFirstName();
        maybeSaveAllNonSecure();
      } else {
        setStatus("Fix the items shown in red, then click VALIDATE again.");
        hideSubmit();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      const ok = validateAll();
      if (!ok) {
        e.preventDefault();
        setStatus("Not submitted. Fix the items shown, then click VALIDATE.");
        hideSubmit();
        return;
      }

      // final save before leaving page
      maybeRememberFirstName();
      maybeSaveAllNonSecure();
    });
  }
}

function hookFormReset() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.addEventListener("reset", function () {
    setTimeout(function () {
      clearMessages();
      hideSubmit();
      setStatus("Form cleared. Fill it out and click VALIDATE.");
      updateHealthValue();

      // If remember is OFF, this will clear cookie/storage.
      handleRememberMeToggle();
    }, 0);
  });
}

/* -----------------------------
   UI helpers
----------------------------- */
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

function hideSubmit() {
  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.style.display = "none";
}

/* -----------------------------
   Validation logic
----------------------------- */
function validateAll() {
  let ok = true;
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  for (let i = 0; i < ids.length; i++) {
    if (!validateField(ids[i])) ok = false;
  }

  // cross-field checks
  const userId = (document.getElementById("userId")?.value || "").trim().toLowerCase();
  const pw1 = document.getElementById("password")?.value || "";
  const pw2 = document.getElementById("password2")?.value || "";

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

  const optional = (id === "middleInitial" || id === "addr2" || id === "phone" || id === "symptoms");
  const raw = (el.value || "");
  const value = (id === "password" || id === "password2") ? raw : raw.trim();

  if (optional && value === "") {
    setMsg(msgId, "");
    return true;
  }

  let msg = "";

  if (id === "firstName") {
    if (value.length < 1 || value.length > 30) msg = "First name must be 1–30 characters.";
    else if (!/^[A-Za-z'-]+$/.test(value)) msg = "Letters, apostrophes, and dashes only.";
  }

  if (id === "middleInitial") {
    if (value.length > 1) msg = "Middle initial must be 1 character.";
    else if (value && !/^[A-Za-z]$/.test(value)) msg = "Middle initial must be a letter.";
  }

  if (id === "lastName") {
    if (value.length < 1 || value.length > 30) msg = "Last name must be 1–30 characters.";
    else if (!/^[A-Za-z'-]+$/.test(value)) msg = "Letters, apostrophes, and dashes only.";
  }

  if (id === "dob") {
    if (!value) msg = "Required.";
    else {
      const dobDate = new Date(value + "T00:00:00");
      const now = new Date();
      const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
      const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dobDate < min) msg = "DOB looks too far in the past.";
      else if (dobDate > max) msg = "DOB cannot be in the future.";
    }
  }

  if (id === "idNumber") {
    if (!/^[0-9]{9}$/.test(value)) msg = "ID Number must be exactly 9 digits.";
  }

  if (id === "email") {
    if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(value)) msg = "Email must be like name@domain.tld.";
  }

  if (id === "zip") {
    if (!/^[0-9]{5}$/.test(value)) msg = "Zip must be 5 digits.";
  }

  if (id === "phone") {
    if (value && !/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(value)) msg = "Phone must be 000-000-0000.";
  }

  if (id === "addr1") {
    if (value.length < 2 || value.length > 30) msg = "Address Line 1 must be 2–30 characters.";
  }

  if (id === "addr2") {
    if (value && (value.length < 2 || value.length > 30)) msg = "Address Line 2 must be 2–30 characters if entered.";
  }

  if (id === "city") {
    if (value.length < 2 || value.length > 30) msg = "City must be 2–30 characters.";
  }

  if (id === "state") {
    if (!value) msg = "Select a state.";
  }

  if (id === "symptoms") {
    if (value.includes('"')) msg = 'Remove double quotes (").';
  }

  if (id === "userId") {
    if (value.length < 5 || value.length > 20) msg = "User ID must be 5–20 characters.";
    else if (!/^[a-z][a-z0-9_-]*$/.test(value)) msg = "Start with a letter. Use letters/numbers/_/- only.";
  }

  if (id === "password") {
    if (value.length < 8 || value.length > 30) msg = "Password must be 8–30 characters.";
    else if (/"/.test(value)) msg = 'Password cannot contain double quotes (").';
    else if (!/[A-Z]/.test(value)) msg = "Needs at least 1 uppercase letter.";
    else if (!/[a-z]/.test(value)) msg = "Needs at least 1 lowercase letter.";
    else if (!/[0-9]/.test(value)) msg = "Needs at least 1 number.";
  }

  if (id === "password2") {
    if (!value) msg = "Required.";
  }

  setMsg(msgId, msg);
  return msg === "";
}

/* -----------------------------
   Cookies + Local Storage
----------------------------- */

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

// localStorage per user
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

    const fn = document.getElementById("firstName");
    if (fn && !fn.value) fn.value = firstNameCookie;

    setWelcomeLine(true, firstNameCookie);

    if (!remember || remember.checked) {
      loadNonSecureFromStorage(firstNameCookie);
    }
  } else {
    setWelcomeLine(false, "");
  }

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

    deleteCookie(COOKIE_NAME);
    if (priorName) {
      const k = storageKeyForUser(priorName);
      if (k) localStorage.removeItem(k);
    }

    const form = document.getElementById("patientForm");
    if (form) form.reset();

    clearMessages();
    hideSubmit();
    setStatus("Started as NEW USER. Saved cookie/storage cleared. Fill out the form and click VALIDATE.");

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

    deleteCookie(COOKIE_NAME);
    if (priorName) {
      const k = storageKeyForUser(priorName);
      if (k) localStorage.removeItem(k);
    }

    const box = document.getElementById("returningBox");
    if (box) box.style.display = "none";

    hideSubmit();
    setWelcomeLine(false, "");

    const chk = document.getElementById("newUserChk");
    if (chk) chk.checked = false;
  } else {
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

  const ids = [
    "firstName","middleInitial","lastName","dob","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","health"
  ];

  for (let i = 0; i < ids.length; i++) {
    const el = document.getElementById(ids[i]);
    if (el) data[ids[i]] = el.value;
  }

  const history = document.querySelectorAll('input[name="history"]');
  data.history = [];
  for (let i = 0; i < history.length; i++) {
    if (history[i].checked) data.history.push(history[i].value);
  }

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

  if (Array.isArray(data.history)) {
    const history = document.querySelectorAll('input[name="history"]');
    for (let i = 0; i < history.length; i++) {
      history[i].checked = data.history.indexOf(history[i].value) !== -1;
    }
  }

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
