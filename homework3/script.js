/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/08/2026
Version: 3.1
Description: Homework 3 JS for on-the-fly validation and Validate button that enables Submit.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookLiveValidation();
  hookButtons();
  hookSlider();
  hookFormReset();
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

function getSliderEl() {
  // Supports both IDs so I don’t get stuck debugging
  return document.getElementById("healthScale") || document.getElementById("health");
}

function hookSlider() {
  const slider = getSliderEl();
  if (!slider) return;

  slider.addEventListener("input", updateHealthValue);
  slider.addEventListener("change", updateHealthValue);
  updateHealthValue();
}

function updateHealthValue() {
  const slider = getSliderEl();
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
  if (email) {
    email.addEventListener("blur", function () {
      email.value = email.value.trim().toLowerCase();
      validateField("email");
    });
  }

  const userId = document.getElementById("userId");
  if (userId) {
    userId.addEventListener("blur", function () {
      userId.value = userId.value.trim().toLowerCase();
      validateField("userId");
    });
  }

  // Digits only for ID number (max 9)
  const idNumber = document.getElementById("idNumber");
  if (idNumber) {
    idNumber.addEventListener("input", function () {
      idNumber.value = idNumber.value.replace(/\D/g, "").slice(0, 9);
      validateField("idNumber");
    });
  }

  // Zip digits only
  const zip = document.getElementById("zip");
  if (zip) {
    zip.addEventListener("input", function () {
      zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
      validateField("zip");
    });
  }
}

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
      } else {
        setStatus("Fix the items shown in red, then click VALIDATE again.");
        if (submitBtn) submitBtn.style.display = "none";
      }
    });
  }

  // Safety: block submit if not valid
  if (form) {
    form.addEventListener("submit", function (e) {
      const ok = validateAll();
      if (!ok) {
        e.preventDefault();
        setStatus("Not submitted. Fix the items shown, then click VALIDATE.");
        if (submitBtn) submitBtn.style.display = "none";
      }
    });
  }
}

function hookFormReset() {
  const form = document.getElementById("patientForm");
  const submitBtn = document.getElementById("submitBtn");
  if (!form) return;

  form.addEventListener("reset", function () {
    // let browser reset first
    setTimeout(function () {
      clearMessages();
      setStatus("Form cleared. Fill it out and click VALIDATE.");
      if (submitBtn) submitBtn.style.display = "none";
      updateHealthValue();
    }, 0);
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

  // Cross-field checks (only if elements exist)
  const userIdEl = document.getElementById("userId");
  const pw1El = document.getElementById("password");
  const pw2El = document.getElementById("password2");

  const userId = (userIdEl ? userIdEl.value : "").trim().toLowerCase();
  const pw1 = (pw1El ? pw1El.value : "");
  const pw2 = (pw2El ? pw2El.value : "");

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

  // Optional fields
  const optional = (id === "middleInitial" || id === "addr2" || id === "phone" || id === "symptoms");
  const raw = (el.value || "");
  const value = (id === "password" || id === "password2") ? raw : raw.trim();

  if (optional && value === "") {
    setMsg(msgId, "");
    return true;
  }

  let msg = "";

  // JS-based rules
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
    if (value.length !== 9) msg = "ID Number must be exactly 9 digits.";
    else if (!/^[0-9]{9}$/.test(value)) msg = "Digits only.";
  }

  if (id === "email") {
    if (!value) msg = "Required.";
    else if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(value)) msg = "Email must be like name@domain.tld.";
  }

  if (id === "phone") {
    // optional, but if present it must match
    if (value && !/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(value)) msg = "Phone must be 000-000-0000.";
  }

  if (id === "zip") {
    if (value.length !== 5) msg = "Zip must be 5 digits.";
    else if (!/^[0-9]{5}$/.test(value)) msg = "Digits only.";
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
    else if (!/^[a-z][a-z0-9_-]*$/.test(value)) msg = "User ID must start with a letter. Use letters/numbers/_/- only.";
  }

  if (id === "password") {
    if (value.length < 8 || value.length > 30) msg = "Password must be 8–30 characters.";
    else if (/"/.test(value)) msg = 'Password cannot contain double quotes (").';
    else if (!/[A-Z]/.test(value)) msg = "Password needs at least 1 uppercase letter.";
    else if (!/[a-z]/.test(value)) msg = "Password needs at least 1 lowercase letter.";
    else if (!/[0-9]/.test(value)) msg = "Password needs at least 1 number.";
    else if (!/[!@#%^&*()\-_+=\\\/><\.,`~]/.test(value)) msg = "Password needs at least 1 special character.";
  }

  if (id === "password2") {
  
    if (!value) msg = "Required.";
  }

  // If you didn’t hit a JS rule message, fall back to HTML validity for any extras
  if (!msg) {
    if (!el.checkValidity()) {
      if (el.validity.valueMissing) msg = "Required.";
      else if (el.validity.patternMismatch) msg = "Format is not correct.";
      else if (el.validity.tooShort) msg = "Too short.";
      else if (el.validity.tooLong) msg = "Too long.";
      else if (el.validity.typeMismatch) msg = "Invalid value.";
      else msg = "Fix this field.";
    }
  }

  setMsg(msgId, msg);
  return msg === "";
}
