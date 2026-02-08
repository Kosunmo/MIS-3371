/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.0
Description: Homework 2 JS for date, DOB range, slider value, review output, and password match.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  wireButtons();
  wireSlider();
  wirePasswordMatch();
});

function wireButtons() {
  const reviewBtn = document.getElementById("reviewBtn");
  const resetBtn = document.getElementById("resetBtn");
  const contactBtn = document.getElementById("contactBtn");

  if (reviewBtn) reviewBtn.addEventListener("click", reviewForm);
  if (resetBtn) resetBtn.addEventListener("click", clearReview);
  if (contactBtn) contactBtn.addEventListener("click", function () {
    alert("Contact us at info@example.com");
  });
}

function wireSlider() {
  const slider = document.getElementById("healthScale");
  if (!slider) return;
  slider.addEventListener("input", updateHealthValue);
  updateHealthValue();
}

function wirePasswordMatch() {
  const pw1 = document.getElementById("password");
  const pw2 = document.getElementById("password2");
  if (!pw1 || !pw2) return;

  function check() {
    const msg = document.getElementById("pwMsg");
    if (!msg) return;

    if (pw2.value.length === 0) {
      msg.textContent = "";
      return;
    }

    if (pw1.value !== pw2.value) msg.textContent = "Passwords do not match.";
    else msg.textContent = "";
  }

  pw1.addEventListener("input", check);
  pw2.addEventListener("input", check);
}

function setToday() {
  const el = document.getElementById("today");
  if (!el) return;
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  el.textContent = now.toLocaleDateString(undefined, options);
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

function updateHealthValue() {
  const slider = document.getElementById("healthScale");
  const out = document.getElementById("healthValue");
  if (slider && out) out.textContent = slider.value;
}

function clearReview() {
  const out = document.getElementById("reviewOutput");
  if (out) out.textContent = "Click REVIEW to display your entered information here.";
  const dobMsg = document.getElementById("dobMsg");
  const pwMsg = document.getElementById("pwMsg");
  if (dobMsg) dobMsg.textContent = "";
  if (pwMsg) pwMsg.textContent = "";
}

function reviewForm() {
  const firstName = getTrim("firstName");
  const middleInitial = getTrim("middleInitial");
  const lastName = getTrim("lastName");

  const name = buildName(firstName, middleInitial, lastName);

  const dobIso = getValue("dob");
  const dobFriendly = dobIso ? formatDob(dobIso) : "None selected";

  const idNumber = getValue("idNumber");
  const idDisplay = idNumber ? "Provided" : "None selected";

  const emailEl = document.getElementById("email");
  let email = (emailEl ? emailEl.value : "").trim().toLowerCase();
  if (emailEl) emailEl.value = email;
  email = email ? email : "None selected";

  const phone = cleanOrNone(getValue("phone"));

  const addr1 = getTrim("addr1");
  const addr2 = getTrim("addr2");
  const city = getTrim("city");
  const state = getValue("state");
  const zipEl = document.getElementById("zip");
  let zipRaw = zipEl ? zipEl.value.trim() : "";
  let zip5 = zipRaw ? zipRaw.substring(0, 5) : "";
  if (zipEl && zip5) zipEl.value = zip5;

  const address = buildAddress(addr1, addr2, city, state, zip5);

  const userIdEl = document.getElementById("userId");
  let userId = (userIdEl ? userIdEl.value : "").trim().toLowerCase();
  if (userIdEl) userIdEl.value = userId;
  userId = userId ? userId : "None selected";

  const gender = getRadio("gender") || "None selected";
  const vaccinated = getRadio("vaccinated") || "None selected";
  const insurance = getRadio("insurance") || "None selected";

  const history = getChecks("history");
  const historyText = history.length ? history.join(", ") : "None selected";

  const health = getValue("healthScale") || "5";

  const symptomsRaw = getTrim("symptoms");
  const symptoms = symptomsRaw ? escapeHtml(symptomsRaw) : "None selected";

  const pw1 = getValue("password");
  const pw2 = getValue("password2");

  const pwMsg = document.getElementById("pwMsg");
  if (pwMsg) {
    if (pw1 || pw2) {
      if (pw1 !== pw2) pwMsg.textContent = "Passwords do not match.";
      else pwMsg.textContent = "";
    } else {
      pwMsg.textContent = "";
    }
  }

  const dobMsg = document.getElementById("dobMsg");
  if (dobMsg) dobMsg.textContent = dobNote(dobIso);

  const out = document.getElementById("reviewOutput");
  if (!out) return;

  out.innerHTML =
    "<table class='reviewTable'>" +
      "<tr><th colspan='2'>Patient Information</th></tr>" +
      row("Name", escapeHtml(name)) +
      row("Date of Birth", escapeHtml(dobFriendly)) +
      row("Email", escapeHtml(email)) +
      row("Phone", escapeHtml(phone)) +
      row("ID Number", escapeHtml(idDisplay)) +

      "<tr><th colspan='2'>Address</th></tr>" +
      "<tr><td class='reviewLabel'>Address</td><td class='reviewValue'>" + address + "</td></tr>" +

      "<tr><th colspan='2'>Health Info</th></tr>" +
      row("History", escapeHtml(historyText)) +
      row("Gender", escapeHtml(gender)) +
      row("Vaccinated", escapeHtml(vaccinated)) +
      row("Insurance", escapeHtml(insurance)) +
      row("Health (1-10)", escapeHtml(health)) +
      "<tr><td class='reviewLabel'>Symptoms</td><td class='reviewValue'>" + symptoms + "</td></tr>" +

      "<tr><th colspan='2'>Account</th></tr>" +
      row("User ID", escapeHtml(userId)) +
      row("Password", (pw1 || pw2) ? "Hidden" : "None selected") +
    "</table>";
}

function row(label, value) {
  return "<tr><td class='reviewLabel'>" + label + "</td><td class='reviewValue'>" + value + "</td></tr>";
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function getTrim(id) {
  return getValue(id).trim();
}

function cleanOrNone(v) {
  const t = (v || "").trim();
  return t ? t : "None selected";
}

function buildName(first, mi, last) {
  const parts = [];
  if (first) parts.push(first);
  if (mi) parts.push(mi);
  if (last) parts.push(last);
  return parts.length ? parts.join(" ") : "None selected";
}

function buildAddress(a1, a2, city, state, zip5) {
  const any = a1 || a2 || city || state || zip5;
  if (!any) return "None selected";

  const lines = [];
  if (a1) lines.push(escapeHtml(a1));
  if (a2) lines.push(escapeHtml(a2));

  const line3parts = [];
  if (city) line3parts.push(city);
  if (state) line3parts.push(state);
  if (zip5) line3parts.push(zip5);

  if (line3parts.length) lines.push(escapeHtml(line3parts.join(" ")));

  return lines.length ? lines.join("<br>") : "None selected";
}

function getRadio(name) {
  const el = document.querySelector('input[name="' + name + '"]:checked');
  return el ? el.value : "";
}

function getChecks(name) {
  const els = document.querySelectorAll('input[name="' + name + '"]:checked');
  const vals = [];
  for (let i = 0; i < els.length; i++) vals.push(els[i].value);
  return vals;
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDob(iso) {
  // iso like YYYY-MM-DD
  if (!iso) return "None selected";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return parts[1] + "/" + parts[2] + "/" + parts[0];
}

function dobNote(dobIso) {
  if (!dobIso) return "";

  const dobDate = new Date(dobIso + "T00:00:00");
  const now = new Date();

  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dobDate < min) return "Date seems more than 120 years ago.";
  if (dobDate > max) return "Date of birth cannot be in the future.";
  return "";
}
