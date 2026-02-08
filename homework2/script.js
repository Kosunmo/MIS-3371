/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.1
Description: Homework 2 JS for dynamic date and Review output.
*/

document.addEventListener("DOMContentLoaded", function () {
  setToday();
});

function setToday() {
  const el = document.getElementById("today");
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function reviewForm() {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
  };

  const radio = (name) => {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return r ? r.value : "";
  };

  const checks = (name) => {
    const list = document.querySelectorAll(`input[name="${name}"]:checked`);
    return list.length ? Array.from(list).map(c => c.value) : [];
  };

  const display = (v) => v ? v : "None selected";

  // Name: do NOT show "None selected" for each piece
  const first = get("firstName");
  const mi = get("middleInitial");
  const last = get("lastName");
  const nameParts = [first, mi, last].filter(Boolean);
  const fullName = nameParts.length ? nameParts.join(" ") : "None selected";

  // Email and User ID: show lowercase
  const email = get("email").toLowerCase();
  const userId = get("userId").toLowerCase();

  // Address: only show lines that exist, otherwise show None selected once
  const addr1 = get("addr1");
  const addr2 = get("addr2");
  const city = get("city");
  const state = get("state");
  const zipRaw = get("zip");
  const zip5 = zipRaw ? zipRaw.substring(0, 5) : "";

  const addressLines = [];
  if (addr1) addressLines.push(addr1);
  if (addr2) addressLines.push(addr2);

  const cityStateZip = [city, state, zip5].filter(Boolean).join(" ");
  if (cityStateZip) addressLines.push(cityStateZip);

  const addressDisplay = addressLines.length ? addressLines.join("<br>") : "None selected";

  // Health scale
  const health = get("healthScale");

  // Symptoms
  const symptoms = get("symptoms");

  // History
  const historyList = checks("history");
  const historyText = historyList.length ? historyList.join(", ") : "None selected";

  const output =
    "<table class='reviewTable'>" +
      "<tr><td><strong>Name</strong></td><td>" + display(fullName) + "</td></tr>" +
      "<tr><td><strong>Date of Birth</strong></td><td>" + display(get("dob")) + "</td></tr>" +
      "<tr><td><strong>Email</strong></td><td>" + display(email) + "</td></tr>" +
      "<tr><td><strong>Phone</strong></td><td>" + display(get(\"phone\")) + "</td></tr>" +
      "<tr><td><strong>Address</strong></td><td>" + addressDisplay + "</td></tr>" +
      "<tr><td><strong>Gender</strong></td><td>" + display(radio(\"gender\")) + "</td></tr>" +
      "<tr><td><strong>Vaccinated</strong></td><td>" + display(radio(\"vaccinated\")) + "</td></tr>" +
      "<tr><td><strong>Insurance</strong></td><td>" + display(radio(\"insurance\")) + "</td></tr>" +
      "<tr><td><strong>Medical History</strong></td><td>" + historyText + "</td></tr>" +
      "<tr><td><strong>Health (1–10)</strong></td><td>" + display(health) + " <span class='hintInline'>(1 = Dead, 10 = Not Dead)</span></td></tr>" +
      "<tr><td><strong>Describe Symptoms</strong></td><td>" + display(symptoms) + "</td></tr>" +
      "<tr><td><strong>User ID</strong></td><td>" + display(userId) + "</td></tr>" +
      "<tr><td><strong>Password</strong></td><td>Hidden</td></tr>" +
    "</table>";

  const out = document.getElementById("reviewOutput");
  if (out) out.innerHTML = output;
}

function clearReview() {
  const out = document.getElementById("reviewOutput");
  if (out) out.textContent = "Click REVIEW to display your entered information here.";
}
