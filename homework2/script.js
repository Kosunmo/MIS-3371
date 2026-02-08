/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.0
Description: Homework 2 JS for dynamic date, DOB range, slider value, review output, and password match.
*/

function reviewForm() {

  function displayOrNone(value) {
    const v = (value || "").toString().trim();
    return v ? v : "None selected";
  }

  function safe(value) {
    return escapeHtml(displayOrNone(value));
  }

  function yesNo(value) {
    return value ? "Yes" : "No";
  }

  function formatDate(iso) {
    
    return displayOrNone(iso);
  }

  function dobFriendlyNote(dobIso) {
    if (!dobIso) return "";
    const dobDate = new Date(dobIso + "T00:00:00");
    const now = new Date();

    const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dobDate < min) return "Please double-check: date seems more than 120 years ago.";
    if (dobDate > max) return "Please double-check: date of birth cannot be in the future.";
    return "";
  }

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

 
  const pwMsg = document.getElementById("pwMsg");
  if (pw1 || pw2) {
    if (pw1 !== pw2) setMsg("pwMsg", "Passwords do not match. Please re-enter them.");
    else setMsg("pwMsg", "");
  } else {
    setMsg("pwMsg", "");
  }


  const dobNote = dobFriendlyNote(dob);
  setMsg("dobMsg", dobNote);

  const gender = getRadio("gender");
  const vaccinated = getRadio("vaccinated");
  const insurance = getRadio("insurance");
  const history = getChecks("history");
  const health = document.getElementById("health").value;
  const symptoms = document.getElementById("symptoms").value.trim();


  const nameParts = [firstName, middleInitial, lastName].filter(Boolean);
  const fullName = nameParts.join(" ");

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

  const historyText = history.length ? history.join(", ") : "None selected";


  const notes = [];
  if ((pw1 || pw2) && pw1 !== pw2) notes.push("Please fix: passwords do not match.");
  if (dobNote) notes.push(dobNote);


  const output =
    "<div class='reviewCard'>" +
      "<h3>Review Your Information</h3>" +
      "<p class='reviewSub'>Please confirm everything looks correct before submitting.</p>" +

      (notes.length
        ? "<div class='reviewNotice'><strong>Quick note:</strong><ul>" +
            notes.map(n => "<li>" + escapeHtml(n) + "</li>").join("") +
          "</ul></div>"
        : "<div class='reviewOk'>Looks good so far.</div>"
      ) +

      "<div class='reviewSection'>" +
        "<div class='reviewTitle'>Patient Information</div>" +
        "<table class='reviewTable'>" +
          "<tr><td>Name</td><td>" + safe(fullName) + "</td></tr>" +
          "<tr><td>Date of Birth</td><td>" + escapeHtml(formatDate(dob)) + "</td></tr>" +
          "<tr><td>Email</td><td>" + safe(email) + "</td></tr>" +
          "<tr><td>Phone</td><td>" + safe(phone) + "</td></tr>" +
          "<tr><td>ID Number</td><td>" + escapeHtml(idNumber ? \"Provided\" : \"None selected\") + "</td></tr>" +
        "</table>" +
      "</div>" +

      "<div class='reviewSection'>" +
        "<div class='reviewTitle'>Address</div>" +
        "<div class='reviewAddress'>" + addressDisplay + "</div>" +
      "</div>" +

      "<div class='reviewSection'>" +
        "<div class='reviewTitle'>Health History & Preferences</div>" +
        "<table class='reviewTable'>" +
          "<tr><td>History</td><td>" + escapeHtml(displayOrNone(historyText)) + "</td></tr>" +
          "<tr><td>Gender</td><td>" + safe(gender) + "</td></tr>" +
          "<tr><td>Vaccinated</td><td>" + safe(vaccinated) + "</td></tr>" +
          "<tr><td>Insurance</td><td>" + safe(insurance) + "</td></tr>" +
          "<tr><td>Health (1–10)</td><td>" + safe(health) + "</td></tr>" +
          "<tr><td>Symptoms</td><td>" + safe(symptoms) + "</td></tr>" +
        "</table>" +
      "</div>" +

      "<div class='reviewSection'>" +
        "<div class='reviewTitle'>Account</div>" +
        "<table class='reviewTable'>" +
          "<tr><td>User ID</td><td>" + safe(userId) + "</td></tr>" +
          "<tr><td>Password</td><td>" + ((pw1 || pw2) ? \"Hidden\" : \"None selected\") + "</td></tr>" +
        "</table>" +
      "</div>" +
    "</div>";

  const out = document.getElementById("reviewOutput");
  if (out) out.innerHTML = output;
}
