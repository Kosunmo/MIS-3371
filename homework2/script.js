/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/08/2026
Version: 2.1
Description: Homework 2 JS for date display, DOB range, slider live value, reset sync, and REVIEW output.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookSlider();
  hookReset();
  hookReview();
  hookPasswordMatch();
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

  // backup for browsers that only fire change on release
  slider.addEventListener("change", updateHealth);
}

function hookReset() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.addEventListener("reset", function () {
    // let browser reset first, then sync UI
    setTimeout(function () {
      // reset slider label
      const slider = document.getElementById("healthScale");
      const out = document.getElementById("healthValue");
      if (slider && out) out.textContent = slider.value;

      // clear review box
      const reviewOutput = document.getElementById("reviewOutput");
      if (reviewOutput) {
        reviewOutput.textContent = "Click REVIEW to display your entered information here.";
      }

      // clear password mismatch message
      const pwMsg = document.getElementById("pwMsg");
      if (pwMsg) pwMsg.textContent = "";
    }, 0);
  });
}

function hookPasswordMatch() {
  const pw1 = document.getElementById("password");
  const pw2 = document.getElementById("password2");
  const msg = document.getElementById("pwMsg");
  if (!pw1 || !pw2 || !msg) return;

  function checkMatch() {
    if (!pw1.value || !pw2.value) {
      msg.textContent = "";
      return;
    }
    msg.textContent = (pw1.value === pw2.value) ? "" : "Passwords must match.";
  }

  pw1.addEventListener("input", checkMatch);
  pw2.addEventListener("input", checkMatch);
  pw2.addEventListener("blur", checkMatch);
}

function hookReview() {
  const btn = document.getElementById("reviewBtn");
  const out = document.getElementById("reviewOutput");
  const form = document.getElementById("patientForm");
  if (!btn || !out || !form) return;

  btn.addEventListener("click", function () {
    // force the browser to evaluate built-in HTML validation first
    if (!form.checkValidity()) {
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
