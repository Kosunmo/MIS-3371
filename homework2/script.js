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
  updateHealthValue();
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
  if (!s) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  const gender = getRadio("gender");
  const vaccinated = getRadio("vaccinated");
  const insurance = getRadio("insurance");
  const history = getChecks("history");
  const health = document.getElementById("health").value;
  const symptoms = document.getElementById("symptoms").value.trim();

  // Required JS: password match
  if (pw1 !== pw2) setMsg("pwMsg", "ERROR: Passwords do not match");
  else setMsg("pwMsg", "");

  // DOB range message (HTML min/max handles most)
  let dobStatus = "pass";
  const dobMsg = document.getElementById("dobMsg");
  if (dobMsg) dobMsg.textContent = "";
  if (dob) {
    const dobDate = new Date(dob + "T00:00:00");
    const now = new Date();
    const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dobDate < min || dobDate > max) {
      dobStatus = "ERROR: DOB out of range";
      setMsg("dobMsg", "ERROR: Must be within last 120 years and not in the future.");
    }
  }

  const historyText = history.length ? history.join(", ") : "None selected";
  const pwStatus = (pw1 === pw2) ? "pass" : "ERROR: Passwords do not match";

  const output =
    "<table class='reviewTable'>" +
      "<tr><th colspan='3'>PLEASE REVIEW THIS INFORMATION</th></tr>" +

      "<tr><td><strong>Name</strong></td><td>" +
        escapeHtml(firstName + " " + middleInitial + " " + lastName) +
      "</td><td>pass</td></tr>" +

      "<tr><td><strong>Date of Birth</strong></td><td>" +
        escapeHtml(dob) +
      "</td><td>" + escapeHtml(dobStatus) + "</td></tr>" +

      "<tr><td><strong>Email</strong></td><td>" +
        escapeHtml(email) +
      "</td><td>pass</td></tr>" +

      "<tr><td><strong>Phone</strong></td><td>" +
        escapeHtml(phone) +
      "</td><td>pass</td></tr>" +

      "<tr><td><strong>Address</strong></td><td>" +
        escapeHtml(addr1) + "<br>" +
        escapeHtml(addr2) + "<br>" +
        escapeHtml(city + ", " + state + " " + zip) +
      "</td><td>" + (zip ? "pass" : "ERROR: Missing Zip Code") + "</td></tr>" +

      "<tr><th colspan='3'>REQUESTED INFO</th></tr>" +
      "<tr><td><strong>History</strong></td><td colspan='2'>" + escapeHtml(historyText) + "</td></tr>" +
      "<tr><td><strong>Gender</strong></td><td colspan='2'>" + escapeHtml(gender) + "</td></tr>" +
      "<tr><td><strong>Vaccinated?</strong></td><td colspan='2'>" + escapeHtml(vaccinated) + "</td></tr>" +
      "<tr><td><strong>Insurance?</strong></td><td colspan='2'>" + escapeHtml(insurance) + "</td></tr>" +
      "<tr><td><strong>Health (1-10)</strong></td><td colspan='2'>" + escapeHtml(health) + "</td></tr>" +
      "<tr><td><strong>Symptoms</strong></td><td colspan='2'>" + escapeHtml(symptoms) + "</td></tr>" +

      "<tr><th colspan='3'>ACCOUNT</th></tr>" +
      "<tr><td><strong>User ID</strong></td><td>" + escapeHtml(userId) + "</td><td>pass</td></tr>" +
      "<tr><td><strong>ID Number</strong></td><td>" + (idNumber ? "Entered" : "") + "</td><td>pass</td></tr>" +
      "<tr><td><strong>Password</strong></td><td>(hidden)</td><td>" + escapeHtml(pwStatus) + "</td></tr>" +
    "</table>";

  const out = document.getElementById("reviewOutput");
  if (out) out.innerHTML = output;
}
