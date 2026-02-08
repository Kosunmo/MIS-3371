/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.0
Description: Homework 2 JS for dynamic date, DOB range, slider value, review output, and password match.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  hookSlider();
});

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

function clearReview() {
  const out = document.getElementById("reviewOutput");
  if (out) out.textContent = "Click REVIEW to display your entered information here.";
  setMsg("pwMsg", "");
  setMsg("dobMsg", "");
}

function setMsg(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
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

function displayOrNone(value) {
  const v = (value || "").toString().trim();
  return v ? v : "None selected";
}

function truncateZip(zip) {
  if (!zip) return "";
  return zip.substring(0, 5);
}

function reviewForm() {

  const firstName = document.getElementById("firstName").value.trim();
  const middleInitial = document.getElementById("middleInitial").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const dob = document.getElementById("dob").value;

  const idNumber = document.getElementById("idNumber").value;

  const emailEl = document.getElementById("email");
  let email = emailEl.value.trim().toLowerCase();
  emailEl.value = email;

  const phone = document.getElementById("phone").value.trim();

  const addr1 = document.getElementById("addr1").value.trim();
  const addr2 = document.getElementById("addr2").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value;

  const zipEl = document.getElementById("zip");
  let zip = zipEl.value.trim();
  zip = truncateZip(zip);
  zipEl.value = zip;

  const userIdEl = document.getElementById("userId");
  let userId = userIdEl.value.trim().toLowerCase();
  userIdEl.value = userId;

  const pw1 = document.getElementById("password").value;
  const pw2 = document.getElementById("password2").value;


  if (pw1 || pw2) {
    if (pw1 !== pw2) setMsg("pwMsg", "Passwords do not match. Please re-enter them.");
    else setMsg("pwMsg", "");
  } else {
    setMsg("pwMsg", "");
  }

  
  setMsg("dobMsg", "");
  if (dob) {
    const dobDate = new Date(dob + "T00:00:00");
    const now = new Date();
    const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dobDate < min) setMsg("dobMsg", "Please double-check: date seems more than 120 years ago.");
    if (dobDate > max) setMsg("dobMsg", "Please double-check: date of birth cannot be in the future.");
  }

  const gender = getRadio("gender");
  const vaccinated = getRadio("vaccinated");
  const insurance = getRadio("insurance");
  const history = getChecks("history");
  const health = document.getElementById("health").value;
  const symptoms = document.getElementById("symptoms").value.trim();


  const fullName = [firstName, middleInitial, lastName].filter(Boolean).join(" ");
  const historyText = history.length ? history.join(", ") : "None selected";

  const anyAddressEntered = !!(addr1 || addr2 || city || state || zip);
  let addressDisplay = "None selected";
  if (anyAddressEntered) {
    const lines = [];
    if (addr1) lines.push(escapeHtml(addr1));
    if (addr2) lines.push(escapeHtml(addr2));
    const csZ = [city, state, zip].filter(Boolean).join(" ");
    if (csZ) lines.push(escapeHtml(csZ));
    addressDisplay = lines.join("<br>");
  }


  const output =
    "<table class='reviewTable'>" +
      "<tr><th colspan='2'>Please review your information</th></tr>" +
      "<tr><td><strong>Name</strong></td><td>" + escapeHtml(displayOrNone(fullName)) + "</td></tr>" +
      "<tr><td><strong>Date of Birth</strong></td><td>" + escapeHtml(displayOrNone(dob)) + "</td></tr>" +
      "<tr><td><strong>Email</strong></td><td>" + escapeHtml(displayOrNone(email)) + "</td></tr>" +
      "<tr><td><strong>Phone</strong></td><td>" + escapeHtml(displayOrNone(phone)) + "</td></tr>" +
      "<tr><td><strong>ID Number</strong></td><td>" + (idNumber ? "Provided" : "None selected") + "</td></tr>" +

      "<tr><th colspan='2'>Address</th></tr>" +
      "<tr><td colspan='2'>" + addressDisplay + "</td></tr>" +

      "<tr><th colspan='2'>Health Info</th></tr>" +
      "<tr><td><strong>History</strong></td><td>" + escapeHtml(displayOrNone(historyText)) + "</td></tr>" +
      "<tr><td><strong>Gender</strong></td><td>" + escapeHtml(displayOrNone(gender)) + "</td></tr>" +
      "<tr><td><strong>Vaccinated</strong></td><td>" + escapeHtml(displayOrNone(vaccinated)) + "</td></tr>" +
      "<tr><td><strong>Insurance</strong></td><td>" + escapeHtml(displayOrNone(insurance)) + "</td></tr>" +
      "<tr><td><strong>Health (1-10)</strong></td><td>" + escapeHtml(displayOrNone(health)) + "</td></tr>" +
      "<tr><td><strong>Symptoms</strong></td><td>" + escapeHtml(displayOrNone(symptoms)) + "</td></tr>" +

      "<tr><th colspan='2'>Account</th></tr>" +
      "<tr><td><strong>User ID</strong></td><td>" + escapeHtml(displayOrNone(userId)) + "</td></tr>" +
      "<tr><td><strong>Password</strong></td><td>Hidden</td></tr>" +
    "</table>";

  const out = document.getElementById("reviewOutput");
  if (out) out.innerHTML = output;
}
