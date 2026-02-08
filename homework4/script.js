/*
Program name: script.js
Author: Kai Osunmo
Date created: 02/07/2026
Date last edited: 02/07/2026
Version: 4.0
Description: Homework 4 JS: date, DOB range, slider value, fetch state list, cookies, localStorage.
*/

document.addEventListener("DOMContentLoaded", () => {
  setToday();
  setDobRange();
  setHealthValue();
  wireHealthSlider();

  applyRememberMeDefaults();
  loadCookieWelcome();
  wireNotYou();
  wireRememberMe();

  fetchStatesIntoSelect();

  wirePasswordMatch();
  wireLocalStorageSaving();
  wireReset();
});

function setToday(){
  const el = document.getElementById("today");
  if(!el) return;
  const now = new Date();
  const options = { weekday:"long", year:"numeric", month:"long", day:"numeric" };
  el.textContent = now.toLocaleDateString(undefined, options);
}

function setDobRange(){
  const dob = document.getElementById("dob");
  if(!dob) return;

  const now = new Date();
  const max = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

  dob.max = toISO(max);
  dob.min = toISO(min);
}

function toISO(d){
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function setHealthValue(){
  const slider = document.getElementById("healthScale");
  const out = document.getElementById("healthValue");
  if(slider && out) out.textContent = slider.value;
}

function wireHealthSlider(){
  const slider = document.getElementById("healthScale");
  if(!slider) return;
  slider.addEventListener("input", () => {
    setHealthValue();
    saveFieldToLocal("healthScale", slider.value);
  });
}

/* ===== Fetch API: State list ===== */
async function fetchStatesIntoSelect(){
  const sel = document.getElementById("state");
  if(!sel) return;

  try{
    const res = await fetch("states-options.html", { cache: "no-store" });
    if(!res.ok) throw new Error("Fetch failed");
    const html = await res.text();

    sel.innerHTML = '<option value="">Select a State</option>' + html;

    const saved = getLocal("state");
    if(saved) sel.value = saved;

  }catch(e){
    sel.innerHTML = '<option value="">Select a State</option>';
  }
}

/* ===== Cookies: Remember first name ===== */
function setCookie(name, value, hours){
  const d = new Date();
  d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

function getCookie(name){
  const target = name + "=";
  const parts = document.cookie.split(";");
  for(let i=0;i<parts.length;i++){
    const c = parts[i].trim();
    if(c.indexOf(target) === 0) return decodeURIComponent(c.substring(target.length));
  }
  return "";
}

function deleteCookie(name){
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function applyRememberMeDefaults(){
  const remember = document.getElementById("rememberMe");
  if(!remember) return;
  if(remember.checked !== true) remember.checked = true;
}

function loadCookieWelcome(){
  const first = getCookie("nf_first");
  const welcome = document.getElementById("welcomeText");
  const notYouRow = document.getElementById("notYouRow");
  const inlineName = document.getElementById("cookieNameInline");

  if(first){
    if(welcome) welcome.textContent = `Welcome back, ${first}`;
    if(notYouRow) notYouRow.style.display = "inline-block";
    if(inlineName) inlineName.textContent = first;

    const firstBox = document.getElementById("firstName");
    if(firstBox) firstBox.value = first;

    loadLocalStorageIntoForm();
  }else{
    if(welcome) welcome.textContent = "Hello New User";
    if(notYouRow) notYouRow.style.display = "none";
  }
}

function wireNotYou(){
  const chk = document.getElementById("notYouChk");
  if(!chk) return;

  chk.addEventListener("change", () => {
    if(chk.checked){
      startNewUser();
      chk.checked = false;
    }
  });
}

function wireRememberMe(){
  const remember = document.getElementById("rememberMe");
  if(!remember) return;

  remember.addEventListener("change", () => {
    if(!remember.checked){
      deleteCookie("nf_first");
      clearAllLocal();
      loadCookieWelcome();
    }else{
      const firstBox = document.getElementById("firstName");
      const first = firstBox ? firstBox.value.trim() : "";
      if(first) setCookie("nf_first", first, 48);
      loadCookieWelcome();
    }
  });
}

function startNewUser(){
  deleteCookie("nf_first");
  clearAllLocal();
  const form = document.getElementById("patientForm");
  if(form) form.reset();
  setHealthValue();
  setToday();
  loadCookieWelcome();
}

/* ===== localStorage: save non-secure fields ===== */
const LOCAL_KEYS = [
  "middleInitial","lastName","dob","email","phone","zip",
  "addr1","addr2","city","state","userId","healthScale","symptoms",
  "vaccinated","insurance","history"
];

function setLocal(key, val){
  localStorage.setItem("nf_" + key, val);
}
function getLocal(key){
  return localStorage.getItem("nf_" + key) || "";
}
function clearAllLocal(){
  for(const k of LOCAL_KEYS){
    localStorage.removeItem("nf_" + k);
  }
  localStorage.removeItem("nf_firstName");
}

function saveFieldToLocal(key, val){
  const remember = document.getElementById("rememberMe");
  if(remember && !remember.checked) return;
  setLocal(key, val);
}

function wireLocalStorageSaving(){
  const remember = document.getElementById("rememberMe");

  const firstName = document.getElementById("firstName");
  if(firstName){
    firstName.addEventListener("blur", () => {
      const v = firstName.value.trim();
      if(remember && remember.checked && v){
        setCookie("nf_first", v, 48);
        loadCookieWelcome();
      }
    });
  }

  const ids = ["middleInitial","lastName","dob","email","phone","zip","addr1","addr2","city","userId","symptoms"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;

    el.addEventListener("blur", () => {
      let v = el.value || "";
      if(id === "email") v = v.trim().toLowerCase();
      if(id === "zip") v = truncateZip(v.trim());
      if(id === "userId") v = v.trim().toLowerCase();

      el.value = v;
      saveFieldToLocal(id, v);
    });
  });

  const state = document.getElementById("state");
  if(state){
    state.addEventListener("change", () => {
      saveFieldToLocal("state", state.value);
    });
  }

  document.querySelectorAll('input[name="vaccinated"]').forEach(r => {
    r.addEventListener("change", () => saveFieldToLocal("vaccinated", r.value));
  });
  document.querySelectorAll('input[name="insurance"]').forEach(r => {
    r.addEventListener("change", () => saveFieldToLocal("insurance", r.value));
  });

  document.querySelectorAll('input[name="history"]').forEach(c => {
    c.addEventListener("change", () => {
      const vals = [];
      document.querySelectorAll('input[name="history"]:checked').forEach(x => vals.push(x.value));
      saveFieldToLocal("history", vals.join("|"));
    });
  });
}

function loadLocalStorageIntoForm(){
  const remember = document.getElementById("rememberMe");
  if(remember && !remember.checked) return;

  const map = {
    "middleInitial":"middleInitial",
    "lastName":"lastName",
    "dob":"dob",
    "email":"email",
    "phone":"phone",
    "zip":"zip",
    "addr1":"addr1",
    "addr2":"addr2",
    "city":"city",
    "state":"state",
    "userId":"userId",
    "symptoms":"symptoms"
  };

  Object.keys(map).forEach(k => {
    const el = document.getElementById(map[k]);
    if(!el) return;
    const v = getLocal(k);
    if(v) el.value = v;
  });

  const health = getLocal("healthScale");
  const slider = document.getElementById("healthScale");
  if(slider && health){
    slider.value = health;
    setHealthValue();
  }

  const vacc = getLocal("vaccinated");
  if(vacc){
    const r = document.querySelector(`input[name="vaccinated"][value="${cssEscape(vacc)}"]`);
    if(r) r.checked = true;
  }

  const ins = getLocal("insurance");
  if(ins){
    const r = document.querySelector(`input[name="insurance"][value="${cssEscape(ins)}"]`);
    if(r) r.checked = true;
  }

  const hist = getLocal("history");
  if(hist){
    const parts = hist.split("|").filter(Boolean);
    parts.forEach(v => {
      const c = document.querySelector(`input[name="history"][value="${cssEscape(v)}"]`);
      if(c) c.checked = true;
    });
  }
}

function cssEscape(s){
  return String(s).replace(/"/g, '\\"');
}

function truncateZip(zip){
  if(!zip) return "";
  const m = zip.match(/^([0-9]{5})/);
  return m ? m[1] : zip;
}

/* ===== Password match ===== */
function wirePasswordMatch(){
  const p1 = document.getElementById("password");
  const p2 = document.getElementById("password2");
  if(!p1 || !p2) return;

  const check = () => {
    const msg = document.getElementById("pwMsg");
    if(!msg) return;

    if(p1.value && p2.value && p1.value !== p2.value){
      msg.textContent = "Passwords do not match.";
    }else{
      msg.textContent = "";
    }
  };

  p1.addEventListener("input", check);
  p2.addEventListener("input", check);
}

/* ===== Reset ===== */
function wireReset(){
  const reset = document.getElementById("resetBtn");
  if(!reset) return;

  reset.addEventListener("click", () => {
    const remember = document.getElementById("rememberMe");
    if(remember && !remember.checked){
      deleteCookie("nf_first");
      clearAllLocal();
    }else{
      clearAllLocal();
    }
    setTimeout(() => {
      setHealthValue();
      setToday();
    }, 0);
  });
}
