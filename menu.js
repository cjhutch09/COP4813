document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.querySelector(".mobile-menu-toggle");
  const primaryNavigation = document.querySelector("#primary-navigation");
  const navTriggers = Array.from(document.querySelectorAll(".nav-trigger"));
  const nav = document.querySelector(".site-nav");
  const mobileLayout = window.matchMedia("(max-width: 760px)");

  function closeSubmenus(except = null) {
    navTriggers.forEach((trigger) => {
      const submenu = document.getElementById(trigger.getAttribute("aria-controls"));
      if (trigger !== except) {
        trigger.setAttribute("aria-expanded", "false");
        submenu.hidden = true;
      }
    });
  }

  function closeMobileMenu() {
    primaryNavigation.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
    closeSubmenus();
  }

  mobileToggle.addEventListener("click", () => {
    const isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
    mobileToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
    if (isOpen) closeSubmenus();
  });

  navTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const submenu = document.getElementById(trigger.getAttribute("aria-controls"));
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      closeSubmenus(trigger);
      trigger.setAttribute("aria-expanded", String(willOpen));
      submenu.hidden = !willOpen;
    });
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) {
      closeSubmenus();
      if (mobileLayout.matches) {
        primaryNavigation.classList.remove("is-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const expandedTrigger = navTriggers.find(
      (trigger) => trigger.getAttribute("aria-expanded") === "true"
    );

    if (expandedTrigger) {
      closeSubmenus();
      expandedTrigger.focus();
    } else if (mobileToggle.getAttribute("aria-expanded") === "true") {
      closeMobileMenu();
      mobileToggle.focus();
    }
  });

  mobileLayout.addEventListener("change", () => {
    closeSubmenus();
    primaryNavigation.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
  });

  const assignmentList = document.querySelector("#assignments-menu");
  const assignments = ["Assignment1", "Assignment2", "Assignment3", "Assignment4","Assignment5", "Assignment6",
  "Assignment7", "Assignment9", "Assignment10"];

  assignments.forEach((assignment) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `../${assignment}/index.html`;
    link.textContent = assignment;
    item.append(link);
    assignmentList.append(item);
  });

  nav.querySelectorAll(".submenu a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileLayout.matches) closeMobileMenu();
    });
  });
});
