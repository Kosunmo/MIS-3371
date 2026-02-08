/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 2.0
Description: Homework 2 review logic for patient registration form.
*/

function reviewForm() {
  function val(id) {
    const el = document.getElementById(id);
    return el && el.value ? el.value.trim() : "None selected";
  }

  function radio(name) {
    const r = document.querySelector(`input[name="${name}"]:checked`);
    return r ? r.value : "None selected";
  }

  function checks(name) {
    const list = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (!list.length) return "None selected";
    return Array.from(list).map(c => c.value).join(", ");
  }

  const output =
    "<table class='reviewTable'>" +

    "<tr><td>Name</td><td>" +
      val("firstName") + " " +
      val("middleInitial") + " " +
      val("lastName") +
    "</td></tr>" +

    "<tr><td>Date of Birth</td><td>" + val("dob") + "</td></tr>" +
    "<tr><td>Email</td><td>" + val("email") + "</td></tr>" +
    "<tr><td>Phone</td><td>" + val("phone") + "</td></tr>" +

    "<tr><td>Address</td><td>" +
      val("addr1") + "<br>" +
      (document.getElementById("addr2").value ? val("addr2") + "<br>" : "") +
      val("city") + ", " + val("state") + " " + val("zip") +
    "</td></tr>" +

    "<tr><td>Gender</td><td>" + radio("gender") + "</td></tr>" +
    "<tr><td>Vaccinated</td><td>" + radio("vaccinated") + "</td></tr>" +
    "<tr><td>Insurance</td><td>" + radio("insurance") + "</td></tr>" +

    "<tr><td>Medical History</td><td>" + checks("history") + "</td></tr>" +
    "<tr><td>Health (1–10)</td><td>" + val("healthScale") + "</td></tr>" +
    "<tr><td>Symptoms</td><td>" + val("symptoms") + "</td></tr>" +

    "<tr><td>User ID</td><td>" + val("userId") + "</td></tr>" +
    "<tr><td>Password</td><td>Hidden</td></tr>" +

    "</table>";

  document.getElementById("reviewOutput").innerHTML = output;
}

function clearReview() {
  document.getElementById("reviewOutput").textContent =
    "Click REVIEW to display your entered information here.";
}
