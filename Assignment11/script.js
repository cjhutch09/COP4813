const DATA_URL = "courses.json";
const REQUIRED_PROGRAM_HOURS = 48;
const SEMESTER_COUNT = 6;

let courses = [];
let locations = new Map();
let historyStack = [];

const els = {
  completed: document.getElementById("completed"),
  allCourses: document.getElementById("allCourses"),
  semesters: document.getElementById("semesters"),
  completedHours: document.getElementById("completedHours"),
  programHours: document.getElementById("programHours"),
  courseCount: document.getElementById("courseCount"),
  status: document.getElementById("status"),
  search: document.getElementById("courseSearch"),
  filter: document.getElementById("programFilter"),
  undo: document.getElementById("undoButton"),
  dialog: document.getElementById("availableDialog"),
  availableList: document.getElementById("availableList")
};

function courseKey(course) { return course.Course; }
function prerequisites(course) { return Array.isArray(course.PreReq) ? course.PreReq : []; }

async function loadCourses() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status}).`);
    const data = await response.json();
    courses = Array.isArray(data) ? data : data.courses;
    if (!Array.isArray(courses)) throw new Error('JSON must contain a "courses" array.');
    validateCourses(courses);
    courses.forEach(course => locations.set(course.Course, course.taken ? "completed" : "catalog"));
    buildSemesters();
    render();
    setStatus(`Loaded ${courses.length} courses from ${DATA_URL}.`);
  } catch (error) {
    els.allCourses.innerHTML = `<p class="empty-message">${escapeHTML(error.message)} Check that the JSON file is beside index.html and run the page using a local web server.</p>`;
    setStatus("Course data could not be loaded.");
  }
}

function validateCourses(list) {
  const seen = new Set();
  list.forEach((course, index) => {
    if (!course.Course || !course.Name) throw new Error(`Course at position ${index + 1} must have Course and Name fields.`);
    if (seen.has(course.Course)) throw new Error(`Duplicate course code: ${course.Course}`);
    seen.add(course.Course);
    if (course.PreReq != null && !Array.isArray(course.PreReq)) throw new Error(`${course.Course}: PreReq must be an array.`);
  });
}

function buildSemesters() {
  els.semesters.innerHTML = "";
  for (let i = 1; i <= SEMESTER_COUNT; i++) {
    const zone = document.createElement("section");
    zone.className = "semester";
    zone.dataset.zone = `semester-${i}`;
    zone.innerHTML = `<h3>Semester ${i}<small class="semester-hours">0 credit hours</small></h3><div class="semester-courses"></div>`;
    els.semesters.appendChild(zone);
  }
}

function isCompleted(code) {
  return locations.get(code) === "completed";
}
function prereqsMet(course) {
  return prerequisites(course).every(code => isCompleted(code));
}
function canDrag(course) {
  const location = locations.get(course.Course);
  return location === "completed" || prereqsMet(course);
}
function courseHours(course) { return Number(course.hours) || 0; }
function programCourse(course) { return course.program === true; }

function makeCourseCard(course) {
  const location = locations.get(course.Course);
  const card = document.createElement("article");
  const eligible = prereqsMet(course);
  card.className = `course ${location === "completed" ? "completed" : location.startsWith("semester-") ? "planned" : eligible ? "available" : "blocked"}`;
  card.draggable = canDrag(course);
  card.tabIndex = 0;
  card.dataset.course = course.Course;
  card.title = course.details || course.Name;

  const prereqText = prerequisites(course).length
    ? `Prerequisites: ${prerequisites(course).join(", ")}`
    : "No prerequisites listed";
  card.innerHTML = `
    <span class="course-code">${escapeHTML(course.Course)} · ${courseHours(course)} credits</span>
    <span class="course-name">${escapeHTML(course.Name)}</span>
    <span class="course-meta">${course.required ? "Required" : "Elective"}${programCourse(course) ? " · Program course" : ""} · ${escapeHTML(course.offered || "Offering not specified")}</span>
    <span class="course-details">${escapeHTML(prereqText)}${course.details ? " · " + escapeHTML(course.details) : ""}</span>`;
  card.addEventListener("dragstart", event => {
    if (!canDrag(course)) { event.preventDefault(); return; }
    event.dataTransfer.setData("text/plain", course.Course);
    event.dataTransfer.effectAllowed = "move";
  });
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      moveCourse(course.Course, location === "completed" ? "catalog" : "completed");
    }
  });
  return card;
}

function render() {
  const search = els.search.value.trim().toLowerCase();
  const filter = els.filter.value;
  els.completed.innerHTML = "";
  els.allCourses.innerHTML = "";
  document.querySelectorAll(".semester-courses").forEach(node => node.innerHTML = "");

  const filtered = courses.filter(course => {
    const matchesSearch = `${course.Course} ${course.Name}`.toLowerCase().includes(search);
    const matchesFilter = filter === "all" || (filter === "program" && programCourse(course)) || (filter === "required" && course.required === true);
    return matchesSearch && matchesFilter;
  });

  let completedCount = 0;
  let catalogCount = 0;
  courses.forEach(course => {
    const location = locations.get(course.Course);
    const card = makeCourseCard(course);
    if (location === "completed") {
      els.completed.appendChild(card);
      completedCount++;
    } else if (location === "catalog") {
      if (filtered.includes(course)) els.allCourses.appendChild(card);
      catalogCount++;
    } else {
      const target = document.querySelector(`[data-zone="${location}"] .semester-courses`);
      if (target) target.appendChild(card);
    }
  });

  addEmptyMessage(els.completed, "Drop completed courses here");
  addEmptyMessage(els.allCourses, "No courses match your search.");
  document.querySelectorAll(".semester").forEach(zone => {
    const count = zone.querySelectorAll(".course").length;
    const total = [...zone.querySelectorAll(".course")].reduce((sum, card) => {
      const course = courses.find(item => item.Course === card.dataset.course);
      return sum + courseHours(course);
    }, 0);
    zone.querySelector(".semester-hours").textContent = `${total} credit hours`;
    addEmptyMessage(zone.querySelector(".semester-courses"), "Drop courses here");
  });

  const completedHours = courses.filter(course => isCompleted(course.Course)).reduce((sum, course) => sum + courseHours(course), 0);
  const programHours = courses.filter(course => programCourse(course) && locations.get(course.Course) !== "catalog").reduce((sum, course) => sum + courseHours(course), 0);
  els.completedHours.textContent = completedHours;
  els.programHours.textContent = `${programHours} / ${REQUIRED_PROGRAM_HOURS}`;
  els.courseCount.textContent = courses.length;
  els.undo.disabled = historyStack.length === 0;
}

function addEmptyMessage(container, message) {
  if (container.children.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-message";
    p.textContent = message;
    container.appendChild(p);
  }
}

function setupDropTargets() {
  document.querySelectorAll("[data-zone]").forEach(zone => {
    zone.addEventListener("dragover", event => {
      event.preventDefault();
      zone.classList.add(zone.classList.contains("semester") ? "drop-over" : "drag-over");
    });
    zone.addEventListener("dragleave", event => {
      if (!zone.contains(event.relatedTarget)) zone.classList.remove("drag-over", "drop-over");
    });
    zone.addEventListener("drop", event => {
      event.preventDefault();
      zone.classList.remove("drag-over", "drop-over");
      const code = event.dataTransfer.getData("text/plain");
      if (code) moveCourse(code, zone.dataset.zone);
    });
  });
}

function moveCourse(code, destination) {
  const course = courses.find(item => item.Course === code);
  if (!course) return;
  if (destination.startsWith("semester-") && !prereqsMet(course)) {
    setStatus(`${code} cannot be planned yet. Complete its prerequisites first.`);
    return;
  }
  if (destination === "completed" && !course.taken && !confirm(`Mark ${code} as completed?`)) return;
  if (destination !== "completed" && destination !== "catalog" && !destination.startsWith("semester-")) return;
  const oldLocation = locations.get(code);
  if (oldLocation === destination) return;
  historyStack.push({ code, from: oldLocation, to: destination });
  locations.set(code, destination);
  render();
  setStatus(`${code} moved to ${destination === "completed" ? "Completed Courses" : destination === "catalog" ? "All Courses" : destination.replace("-", " ").replace("semester", "Semester ")}.`);
}

function undo() {
  const last = historyStack.pop();
  if (!last) return;
  locations.set(last.code, last.from);
  render();
  setStatus(`Undo: ${last.code} returned to its previous location.`);
}

function showAvailable() {
  const available = courses.filter(course => locations.get(course.Course) === "catalog" && prereqsMet(course));
  els.availableList.innerHTML = "";
  if (!available.length) {
    els.availableList.textContent = "No additional courses are currently available. Complete or plan prerequisite courses first.";
  } else {
    available.forEach(course => {
      const item = document.createElement("div");
      item.className = "available-result";
      item.textContent = `${course.Course} — ${course.Name} (${courseHours(course)} credits)`;
      els.availableList.appendChild(item);
    });
  }
  els.dialog.showModal();
}

function resetPlan() {
  if (!confirm("Reset all course placements to their original taken/not-taken status?")) return;
  historyStack = [];
  courses.forEach(course => locations.set(course.Course, course.taken ? "completed" : "catalog"));
  render();
  setStatus("Planner reset to the original JSON data.");
}

function setStatus(message) { els.status.textContent = message; }
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

els.search.addEventListener("input", render);
els.filter.addEventListener("change", render);
els.undo.addEventListener("click", undo);
document.getElementById("availableButton").addEventListener("click", showAvailable);
document.getElementById("resetButton").addEventListener("click", resetPlan);
document.getElementById("closeDialog").addEventListener("click", () => els.dialog.close());
document.getElementById("closeDialogBottom").addEventListener("click", () => els.dialog.close());
document.getElementById("printButton").addEventListener("click", () => window.print());

setupDropTargets();
loadCourses();
