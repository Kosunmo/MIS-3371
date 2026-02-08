/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 3.0
Description: Homework 3 JS for on-the-fly validation and Validate button that enables Submit.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookLiveValidation();
  hookButtons();
  hookSlider();
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

function hookLiveValidation() {
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", function () { validateField(id); });
    el.addEventListener("blur", function () { validateField(id); });
  });

  // Normalize email/userId to lowercase on blur
  const email = document.getElementById("email");
  if (email) email.addEventListener("blur", function () {
    email.value = email.value.trim().toLowerCase();
    validateField("email");
  });

  const userId = document.getElementById("userId");
  if (userId) userId.addEventListener("blur", function () {
    userId.value = userId.value.trim().toLowerCase();
    validateField("userId");
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
  });

  // Safety: block submit if not valid
  if (form) form.addEventListener("submit", function (e) {
    const ok = validateAll();
    if (!ok) {
      e.preventDefault();
      setStatus("Not submitted. Fix the items shown, then click VALIDATE.");
      if (submitBtn) submitBtn.style.display = "none";
    }
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

  // Optional fields: if blank, accept them (middleInitial, addr2, phone, symptoms)
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
