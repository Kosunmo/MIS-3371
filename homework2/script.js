/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/08/2026
Version: 2.2
Description: Homework 2 JS for date display, DOB range, slider live value, reset sync, and REVIEW output.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookDobValidation();
  hookSlider();
  hookReset();
  hookReview();
  hookPasswordMatch();
  hookUserIdLowercase();
  hookContactButton();
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

/* DOB: show message and ensure validity is cleared when fixed */
function hookDobValidation() {
  const dob = document.getElementById("dob");
  const msg = document.getElementById("dobMsg");
  if (!dob) return;

  function validateDob() {
    // clear first
    dob.setCustomValidity("");
    if (msg) msg.textContent = "";

    if (!dob.value) return;

    const picked = new Date(dob.value + "T00:00:00");
    const min = new Date(dob.min + "T00:00:00");
    const max = new Date(dob.max + "T00:00:00");

    if (picked < min) {
      dob.setCustomValidity("DOB is too old.");
      if (msg) msg.textContent = "DOB must be within the last 120 years.";
      return;
    }
    if (picked > max) {
      dob.setCustomValidity("DOB cannot be in the future.");
      if (msg) msg.textContent = "DOB cannot be in the future.";
      return;
    }
  }

  dob.addEventListener("input", validateDob);
  dob.addEventListener("change", validateDob);
  dob.addEventListener("blur", validateDob);

  // run once in case browser autofilled something
  validateDob();
}

function hookSlider() {
  const slider = document.getElementById("healthScale");
  const out = document.getElementById("healthValue");
  if (!slider || !out) return;

  function updateHealth() {
    out.textContent = slider.value;
  }

  // initial value
  updateHealth();

  // live updates while dragging
  slider.addEventListener("input", updateHealth);
  slider.addEventListener("change", updateHealth);

  // helps on some browsers where input doesn't fire until interaction starts
  slider.addEventListener("pointerdown", updateHealth);
}

function hookReset() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.addEventListener("reset", function () {
    // allow browser to reset first, then sync UI + clear custom validity/messages
    setTimeout(function () {
      // slider label sync
      const slider = document.getElementById("healthScale");
      const out = document.getElementById("healthValue");
      if (slider && out) out.textContent = slider.value;

      // clear review box
      const reviewOutput = document.getElementById("reviewOutput");
      if (reviewOutput) {
        reviewOutput.textContent = "Click REVIEW to display your entered information here.";
      }

      // clear password mismatch state + message
      const pw1 = document.getElementById("password");
      const pw2 = document.getElementById("password2");
      const pwMsg = document.getElementById("pwMsg");
      if (pw1) pw1.setCustomValidity("");
      if (pw2) pw2.setCustomValidity("");
      if (pwMsg) pwMsg.textContent = "";

      // clear DOB message/custom validity
      const dob = document.getElementById("dob");
      const dobMsg = document.getElementById("dobMsg");
      if (dob) dob.setCustomValidity("");
      if (dobMsg) dobMsg.textContent = "";
    }, 0);
  });
}

function hookPasswordMatch() {
  const pw1 = document.getElementById("password");
  const pw2 = document.getElementById("password2");
  const msg = document.getElementById("pwMsg");
  if (!pw1 || !pw2) return;

  function checkMatch() {
    // clear first
    pw2.setCustomValidity("");
    if (msg) msg.textContent = "";

    if (!pw1.value || !pw2.value) return;

    if (pw1.value !== pw2.value) {
      pw2.setCustomValidity("Passwords must match.");
      if (msg) msg.textContent = "Passwords must match.";
    }
  }

  pw1.addEventListener("input", checkMatch);
  pw2.addEventListener("input", checkMatch);
  pw2.addEventListener("blur", checkMatch);
}

/* UserID: force lowercase live so it matches the assignment note */
function hookUserIdLowercase() {
  const userId = document.getElementById("userId");
  if (!userId) return;

  userId.addEventListener("input", function () {
    const start = userId.selectionStart;
    const end = userId.selectionEnd;
    userId.value = userId.value.toLowerCase();
    // keep cursor position stable
    userId.setSelectionRange(start, end);
  });
}

function hookReview() {
  const btn = document.getElementById("reviewBtn");
  const out = document.getElementById("reviewOutput");
  const form = document.getElementById("patientForm");
  if (!btn || !out || !form) return;

  btn.addEventListener("click", function () {
    // reportValidity highlights the exact field that is failing
    if (!form.reportValidity()) {
      out.innerHTML = "<strong>Fix the required fields and formatting first.</strong>";
      return;
    }

    const get = (id) => (document.getElementById(id)?.value || "").trim();

    // zip: show only first 5 digits
    let zip = get("zip");
    if (zip.includes("-")) zip = zip.split("-")[0];

    // userId: show lowercase
    let userId = get("userId").toLowerCase();

    // checkboxes: history
    const history = Array.from(document.querySelectorAll('input[name="history"]:checked'))
      .map((x) => x.value);

    const gender = document.querySelector('input[name="gender"]:checked')?.value || "";
    const vaccinated = document.querySelector('input[name="vaccinated"]:checked')?.value || "";
    const insurance = document.querySelector('input[name="insurance"]:checked')?.value || "";

    const addr2 = get("addr2");

    const lines = [];
    lines.push("<strong>PLEASE REVIEW THIS INFORMATION</strong><br><br>");

    lines.push(`<strong>Name:</strong> ${get("firstName")} ${get("middleInitial")} ${get("lastName")}<br>`);
    lines.push(`<strong>Date of Birth:</strong> ${get("dob")}<br>`);
    lines.push(`<strong>Email:</strong> ${get("email")}<br>`);
    lines.push(`<strong>Phone:</strong> ${get("phone") || "(blank)"}<br>`);
    lines.push(`<strong>ID Number:</strong> (hidden)<br><br>`);

    lines.push("<strong>Address</strong><br>");
    lines.push(`${get("addr1")}<br>`);
    if (addr2) lines.push(`${addr2}<br>`);
    lines.push(`${get("city")}, ${get("state")} ${zip}<br><br>`);

    lines.push("<strong>Requested Info</strong><br>");
    lines.push(`<strong>User ID:</strong> ${userId}<br>`);
    lines.push(`<strong>Vaccinated:</strong> ${vaccinated || "(not selected)"}<br>`);
    lines.push(`<strong>Insurance:</strong> ${insurance || "(not selected)"}<br>`);
    lines.push(`<strong>Gender:</strong> ${gender || "(not selected)"}<br>`);
    lines.push(`<strong>Health (1-10):</strong> ${get("healthScale")}<br>`);
    lines.push(`<strong>History:</strong> ${history.length ? history.join(", ") : "(none)"}<br>`);
    lines.push(`<strong>Symptoms:</strong> ${get("symptoms") || "(blank)"}<br>`);

    out.innerHTML = lines.join("");
  });
}

function hookContactButton() {
  const btn = document.getElementById("contactBtn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    alert("Contact us at info@example.com");
  });
}
