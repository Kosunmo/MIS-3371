/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 3.0
Description: Homework 3 JS for on-the-fly validation and Validate button that enables Submit.
*/

document.addEventListener("DOMContentLoaded", () => {
  setToday();
  setDobRange();
  wireEvents();
  updateHealthValue();
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
  return `${yyyy}-${mm}-${dd}`;
}

function wireEvents() {
  const form = document.getElementById("patientForm");
  const validateBtn = document.getElementById("validateBtn");
  const resetBtn = document.getElementById("resetBtn");
  const slider = document.getElementById("health");

  // Validate-on-the-fly: on input + on blur
  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => validateField(id));
    el.addEventListener("blur", () => validateField(id));
  });

  // Normalize some fields live
  const email = document.getElementById("email");
  if (email) email.addEventListener("blur", () => { email.value = email.value.trim().toLowerCase(); });

  const userId = document.getElementById("userId");
  if (userId) userId.addEventListener("blur", () => { userId.value = userId.value.trim().toLowerCase(); });

  const idNumber = document.getElementById("idNumber");
  if (idNumber) {
    idNumber.addEventListener("input", () => {
      // keep digits only, max 9
      idNumber.value = idNumber.value.replace(/\D/g, "").slice(0, 9);
    });
  }

  const zip = document.getElementById("zip");
  if (zip) {
    zip.addEventListener("input", () => {
      zip.value = zip.value.replace(/\D/g, "").slice(0, 5);
    });
  }

  if (slider) slider.addEventListener("input", updateHealthValue);

  validateBtn.addEventListener("click", () => {
    const ok = validateAll();
    const submitBtn = document.getElementById("submitBtn");
    if (ok) {
      setStatus("All set. You can submit now.");
      submitBtn.style.display = "inline-block";
    } else {
      setStatus("Fix the highlighted items, then click VALIDATE again.");
      submitBtn.style.display = "none";
    }
  });

  resetBtn.addEventListener("click", () => {
    clearAllMessages();
    setStatus("Form cleared. Fill it out again, then click VALIDATE.");
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.style.display = "none";
    updateHealthValue();
  });

  // Prevent submit if someone forces it
  form.addEventListener("submit", (e) => {
    if (!validateAll()) {
      e.preventDefault();
      setStatus("Not submitted. Please fix the items shown and click VALIDATE again.");
      document.getElementById("submitBtn").style.display = "none";
    }
  });
}

function updateHealthValue() {
  const slider = document.getElementById("health");
  const out = document.getElementById("healthValue");
  if (slider && out) out.textContent = slider.value;
}

function setStatus(msg) {
  const box = document.getElementById("statusBox");
  if (box) box.textContent = msg;
}

function setMsg(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearAllMessages() {
  const msgSpans = document.querySelectorAll(".msg");
  msgSpans.forEach((s) => (s.textContent = ""));
}

function validateAll() {
  let ok = true;

  const ids = [
    "firstName","middleInitial","lastName","dob","idNumber","email","zip","phone",
    "addr1","addr2","city","state","symptoms","userId","password","password2"
  ];

  ids.forEach((id) => {
    const fieldOk = validateField(id);
    if (!fieldOk) ok = false;
  });

  // Cross-field check: password cannot equal userId
  const userId = (document.getElementById("userId").value || "").trim().toLowerCase();
  const pw = document.getElementById("password").value || "";
  if (userId && pw && pw.toLowerCase() === userId) {
    ok = false;
    setMsg("passwordMsg", "Password cannot be the same as your User ID.");
  }

  // Cross-field check: passwords match
  const pw2 = document.getElementById("password2").value || "";
  if (pw && pw2 && pw !== pw2) {
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



  if (!el.checkValidity()) {
    // Make messages user-friendly (not system-y)
    if (el.validity.valueMissing) msg = "This field is required.";
    else if (el.validity.patternMismatch) msg = "Please follow the format shown in the field instructions.";
    else if (el.validity.tooShort) msg = `Please enter at least ${el.minLength} characters.`;
    else if (el.validity.tooLong) msg = `Please keep it under ${el.maxLength} characters.`;
    else if (el.validity.typeMismatch) msg = "Please enter a valid value.";
    else if (el.validity.rangeUnderflow || el.validity.rangeOverflow) msg = "Please enter a valid date.";
    else msg = "Please correct this field.";
  }

  // Extra HW3 logic for DOB range (on top of min/max)
  if (!msg && id === "dob") {
    const val = el.value;
    if (val) {
      const dob = new Date(val + "T00:00:00");
      const now = new Date();
      const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
      const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (dob < min) msg = "Date of birth looks too far in the past (over 120 years).";
      if (dob > max) msg = "Date of birth cannot be in the future.";
    }
  }

  // Optional phone: if entered must match pattern; HTML already checks, but we give clearer wording
  if (!msg && id === "phone") {
    const v = (el.value || "").trim();
    if (v && !/^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/.test(v)) {
      msg = "Use this format: 000-000-0000";
    }
  }

  // Symptoms: block double quotes
  if (!msg && id === "symptoms") {
    const v = el.value || "";
    if (v.includes('"')) msg = 'Please remove double quotes (").';
  }

  // Password: also block quotes (HTML pattern blocks, but we set clear message)
  if (!msg && id === "password") {
    const v = el.value || "";
    if (v.includes('"')) msg = 'Password cannot include double quotes (").';
  }

  setMsg(msgId, msg);
  return msg === "";
}
