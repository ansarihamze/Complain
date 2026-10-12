// ===== Smart Complaint Center - script.js =====
// All data is stored in the browser's localStorage (no server, no real database).

const STORAGE_KEY = "complaints";   // key used in localStorage
const FIRST_ID = 1001;              // first complaint will be CMP1001

// ---------- Helper functions ----------

// Short way to get an element by its id
function $(id) { return document.getElementById(id); }

// Read all complaints (array of objects) from localStorage
function getComplaints() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) { return []; }
  return JSON.parse(saved);          // text -> array
}

// Save the complaints array back to localStorage
function saveComplaints(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); // array -> text
}

// Generate a unique ID: highest existing number + 1 (CMP1001, CMP1002, ...)
function generateId() {
  const list = getComplaints();
  let highest = FIRST_ID - 1;
  for (let i = 0; i < list.length; i++) {
    const num = parseInt(list[i].id.replace("CMP", ""), 10);
    if (num > highest) { highest = num; }
  }
  return "CMP" + (highest + 1);
}

// Show an error under a field and highlight it
function setError(inputId, errorId, text) {
  $(errorId).textContent = text;
  if (text) { $(inputId).classList.add("invalid"); }
  else { $(inputId).classList.remove("invalid"); }
}

// Show a green (success) or red (fail) message box
function showMessage(boxId, text, type) {
  const box = $(boxId);
  box.textContent = text;
  box.className = "message " + type;
}

// Escape special characters so user text can't inject HTML
function safe(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Complaint form ----------

// Check every field; returns true only when everything is valid
function validateComplaint() {
  let ok = true;
  const name = $("fullName").value.trim();
  const phone = $("phone").value.trim();
  const email = $("email").value.trim();

  if (name.length < 3) { setError("fullName", "errName", "Please enter your full name (at least 3 letters)."); ok = false; }
  else { setError("fullName", "errName", ""); }

  // Phone: 10-15 digits, may start with +
  if (!/^\+?[0-9]{10,15}$/.test(phone)) { setError("phone", "errPhone", "Enter a valid phone number (10 to 15 digits)."); ok = false; }
  else { setError("phone", "errPhone", ""); }

  // Email is optional, but if typed it must look valid
  if (email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("email", "errEmail", "Enter a valid email like name@example.com."); ok = false; }
  else { setError("email", "errEmail", ""); }

  if ($("category").value === "") { setError("category", "errCategory", "Please choose a category."); ok = false; }
  else { setError("category", "errCategory", ""); }

  if ($("subject").value.trim().length < 5) { setError("subject", "errSubject", "Subject must be at least 5 characters."); ok = false; }
  else { setError("subject", "errSubject", ""); }

  if ($("location").value.trim() === "") { setError("location", "errLocation", "Please enter a location or department."); ok = false; }
  else { setError("location", "errLocation", ""); }

  if ($("description").value.trim().length < 20) { setError("description", "errDescription", "Description must be at least 20 characters."); ok = false; }
  else { setError("description", "errDescription", ""); }

  if ($("priority").value === "") { setError("priority", "errPriority", "Please select a priority."); ok = false; }
  else { setError("priority", "errPriority", ""); }

  return ok;
}

// Runs when the complaint form is submitted
function handleComplaintSubmit(event) {
  event.preventDefault();             // stop the page from reloading
  $("submitMessage").className = "message";
  $("submitMessage").textContent = "";

  if (!validateComplaint()) {
    showMessage("submitMessage", "Please fix the errors shown above and try again.", "fail");
    return;
  }

  // Build the complaint object
  const complaint = {
    id: generateId(),
    name: $("fullName").value.trim(),
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    category: $("category").value,
    subject: $("subject").value.trim(),
    description: $("description").value.trim(),
    location: $("location").value.trim(),
    priority: $("priority").value,
    status: "Submitted",              // every new complaint starts as Submitted
    date: new Date().toLocaleDateString()
  };

  // Add to the saved list and store it
  const list = getComplaints();
  list.push(complaint);
  saveComplaints(list);

  showMessage("submitMessage", "Complaint submitted successfully! Your Complaint ID is " + complaint.id + ". Please save it to track your complaint.", "success");
  $("complaintForm").reset();         // clear the form
  updateStats();                      // refresh the numbers
}

// ---------- Tracking ----------

// Look up a complaint by ID and display it
function trackComplaint() {
  const searchId = $("trackId").value.trim().toUpperCase();
  const result = $("trackResult");

  if (searchId === "") {
    result.innerHTML = '<div class="message fail">Please enter a complaint ID.</div>';
    return;
  }

  const list = getComplaints();
  let found = null;
  for (let i = 0; i < list.length; i++) {          // loop through all complaints
    if (list[i].id === searchId) { found = list[i]; break; }
  }

  if (found === null) {
    result.innerHTML = '<div class="message fail">No complaint found. Please check your complaint ID.</div>';
    return;
  }

  const statusClass = found.status.replace(" ", ""); // "In Progress" -> "InProgress"
  result.innerHTML =
    '<div class="result-card">' +
    "<p><strong>Complaint ID:</strong> " + safe(found.id) + "</p>" +
    "<p><strong>Subject:</strong> " + safe(found.subject) + "</p>" +
    "<p><strong>Category:</strong> " + safe(found.category) + "</p>" +
    "<p><strong>Submitted on:</strong> " + safe(found.date) + "</p>" +
    "<p><strong>Priority:</strong> " + safe(found.priority) + "</p>" +
    '<p><strong>Status:</strong> <span class="badge ' + statusClass + '">' + safe(found.status) + "</span></p>" +
    "</div>";
}

// Reset the tracking area
function clearTracking() {
  $("trackId").value = "";
  $("trackResult").innerHTML = "";
}

// ---------- Statistics ----------

// Count complaints by status and show the numbers
function updateStats() {
  const list = getComplaints();
  let submitted = 0, progress = 0, resolved = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].status === "Submitted") { submitted++; }
    else if (list[i].status === "In Progress") { progress++; }
    else if (list[i].status === "Resolved") { resolved++; }
  }
  $("statTotal").textContent = list.length;
  $("statSubmitted").textContent = submitted;
  $("statProgress").textContent = progress;
  $("statResolved").textContent = resolved;
}

// ---------- Category cards ----------

// Clicking a card scrolls to the form and selects that category
function selectCategory(name) {
  $("category").value = name;
  setError("category", "errCategory", "");
  $("submit").scrollIntoView({ behavior: "smooth" });
}

// ---------- Contact form (DEMO ONLY: no email is really sent) ----------

function handleContactSubmit(event) {
  event.preventDefault();
  let ok = true;

  if ($("cName").value.trim().length < 3) { setError("cName", "errCName", "Please enter your name."); ok = false; }
  else { setError("cName", "errCName", ""); }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("cEmail").value.trim())) { setError("cEmail", "errCEmail", "Enter a valid email address."); ok = false; }
  else { setError("cEmail", "errCEmail", ""); }

  if ($("cMessage").value.trim().length < 10) { setError("cMessage", "errCMessage", "Message must be at least 10 characters."); ok = false; }
  else { setError("cMessage", "errCMessage", ""); }

  if (!ok) { showMessage("contactMessage", "Please fix the errors above.", "fail"); return; }

  // Demo only: we just show a message. Nothing is sent anywhere.
  showMessage("contactMessage", "Demo only: your message was validated, but no real email was sent.", "success");
  $("contactForm").reset();
}

// ---------- Event listeners (connect buttons to functions) ----------

$("complaintForm").addEventListener("submit", handleComplaintSubmit);
$("contactForm").addEventListener("submit", handleContactSubmit);
$("trackBtn").addEventListener("click", trackComplaint);
$("clearBtn").addEventListener("click", clearTracking);
$("trackId").addEventListener("keydown", function (e) { if (e.key === "Enter") { trackComplaint(); } });

// Add a click listener to every category card
const cards = document.querySelectorAll(".cat-card");
for (let i = 0; i < cards.length; i++) {
  cards[i].addEventListener("click", function () { selectCategory(cards[i].dataset.category); });
}

// Mobile menu: open/close, and close after choosing a link
$("menuBtn").addEventListener("click", function () { $("nav").classList.toggle("open"); });
const navLinks = document.querySelectorAll("#nav a");
for (let i = 0; i < navLinks.length; i++) {
  navLinks[i].addEventListener("click", function () { $("nav").classList.remove("open"); });
}

// Show current numbers when the page first loads
updateStats();
