/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.0
Description: Javascript utilities for Homework 2 review display and a few required edits.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
  setDobRange();
  updateHealthValue();
});

function setToday() {
  const today = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  const el = document.getElementById("today");
  if (el) el.textContent = today.toLocaleDateString(undefined, options);
}

function setDobRange() {
  const dob = document.getElementById("dob");
  if (!dob) return;

  const now = new Date();
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

  dob.max = toISODate(max);
  dob.min = toISODate(min);
}

function toISODate(d) {
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
  if (out) out.innerHTML = "Click REVIEW to display your entered information here.";
  const pwError = document.getElementById("pwError");
  if (pwError) pwError.textContent = "";
  const dobError = document.getElementById("dobError");
  if (dobError) dobError.textContent = "";
}

function getCheckedValues(name) {
  const items = document.querySelectorAll('input[name="' + name + '"]:checked');
  const values = [];
  for (let i = 0; i < items.length; i++) values.push(items[i].value);
  return values;
}

function getRadioValue(name) {
  const item = document.querySelector('input[name="' + name + '"]:checked');
  return item ? item.value : "";
}

function safeText(s) {
  if (!s) return "";
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncateZip(zip) {
  if (!zip) return "";
  // If ZIP+4, keep first 5 digits
  if (zip.length >= 5) return zip.substring(0, 5);
  return zip;
}

function reviewForm() {
  const firstName = document.getElementById("firstName").value.trim();
  const middleInitial = document.getElementById("middleInitial").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const dob = document.getElementById("dob").value;
  const idNumber = document.getElementById("idNumber").value;
  const email = document.getElementById("email").value.trim().toLowerCase();
  document.getElementById("email").value = email;

  const phone = document.getElementById("phone").value.trim();
  const addr1 = document.getElementById("addr1").value.trim();
  const addr2 = document.getElementById("addr2").value.trim();
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("state").value;
  const zipRaw = document.getElementById("zip").value.trim();
  const zip = truncateZip(zipRaw);
  document.getElementById("zip").value = zip;

  let userId = document.getElementById("userId").value.trim();
  userId = userId.toLowerCase();
  document.getElementById("userId").value = userId;

  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;

  const gender = getRadioValue("gender");
  const vaccinated = getRadioValue("vaccinated");
  const insurance = getRadioValue("insurance");

  const health = document.getElementById("health").value;
  const symptoms = document.getElementById("symptoms").value.trim();

  const history = getCheckedValues("history");
  const historyText = history.length ? history.join(", ") : "None selected";

  // JS required check: password match
  const pwError = document.getElementById("pwError");
  if (pwError) pwError.textContent = "";
  if (password !== password2) {
    if (pwError) pwError.textContent = "ERROR: Passwords do not match";
  }

  // Simple DOB range message (HTML min/max does most of the work)
  const dobError = document.getElementById("dobError");
  if (dobError) dobError.textContent = "";
  if (dob) {
    const dobDate = new Date(dob + "T00:00:00");
    const now = new Date();
    const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dobDate < min || dobDate > max) {
      if (dobError) dobError.textContent = "ERROR: Date must be within last 120 years and not in the future.";
    }
  }

  const output =
    "<table class='reviewTable'>" +

    "<tr><th colspan='3'>PLEASE REVIEW THIS INFORMATION</th></tr>" +

    "<tr><td><strong>Name</strong></td><td>" +
      safeText(firstName + " " + middleInitial + " " + lastName) +
    "</td><td></td></tr>" +

    "<tr><td><strong>Date of Birth</strong></td><td>" + safeText(dob) +
    "</td><td>" + (dobError && dobError.textContent ? safeText(dobError.textContent) : "pass") + "</td></tr>" +

    "<tr><td><strong>Email</strong></td><td>" + safeText(email) + "</td><td>pass</td></tr>" +
    "<tr><td><strong>Phone</strong></td><td>" + safeText(phone) + "</td><td>pass</td></tr>" +

    "<tr><td><strong>Address</strong></td><td>" +
      safeText(addr1) + "<br>" + safeText(addr2) + "<br>" +
      safeText(city + ", " + state + " " + zip) +
    "</td><td>" + (zip ? "pass" : "ERROR: Missing Zip Code") + "</td></tr>" +

    "<tr><th colspan='3'>REQUESTED INFO</th></tr>" +
    "<tr><td><strong>History</strong></td><td colspan='2'>" + safeText(historyText) + "</td></tr>" +
    "<tr><td><strong>Gender</strong></td><td colspan='2'>" + safeText(gender) + "</td></tr>" +
    "<tr><td><strong>Vaccinated?</strong></td><td colspan='2'>" + safeText(vaccinated) + "</td></tr>" +
    "<tr><td><strong>Insurance?</strong></td><td colspan='2'>" + safeText(insurance) + "</td></tr>" +
    "<tr><td><strong>Health (1-10)</strong></td><td colspan='2'>" + safeText(health) + "</td></tr>" +
    "<tr><td><strong>Symptoms</strong></td><td colspan='2'>" + safeText(symptoms) + "</td></tr>" +

    "<tr><th colspan='3'>ACCOUNT</th></tr>" +
    "<tr><td><strong>User ID</strong></td><td>" + safeText(userId) + "</td><td>pass</td></tr>" +
    "<tr><td><strong>ID Number</strong></td><td>" + (idNumber ? "Entered" : "") + "</td><td>pass</td></tr>" +
    "<tr><td><strong>Password</strong></td><td>(hidden)</td><td>" +
      (pwError && pwError.textContent ? safeText(pwError.textContent) : "pass") +
    "</td></tr>" +

    "</table>";

  const out = document.getElementById("reviewOutput");
  if (out) out.innerHTML = output;
}
