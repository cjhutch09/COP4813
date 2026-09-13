
    const form = document.getElementById("contactForm");
    const phone = document.getElementById("phone");
    const birthdate = document.getElementById("birthdate");
    const birthWarning = document.getElementById("birthWarning");
    const errorMessage = document.getElementById("errorMessage");
    const formSection = document.getElementById("formSection");
    const confirmationSection = document.getElementById("confirmationSection");
    const review = document.getElementById("review");
    const today = new Date();
    const todayString =
      today.getFullYear() + "-" +
      String(today.getMonth() + 1).padStart(2, "0") + "-" +
      String(today.getDate()).padStart(2, "0");
    birthdate.max = todayString;

    // Phone input mask: (000) 000-0000
    phone.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "").slice(0, 10);

      if (digits.length > 6) {
        this.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        this.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        this.value = `(${digits}`;
      } else {
        this.value = "";
      }
    });

    // Check the birth date and warn about unreasonable dates.
    birthdate.addEventListener("change", function () {
      birthWarning.style.display = "none";
      birthWarning.textContent = "";

      if (!this.value) return;

      const selected = new Date(this.value + "T00:00:00");
      const now = new Date();

      if (selected > now) {
        birthWarning.textContent = "Warning: The birth date cannot be in the future.";
        birthWarning.style.display = "block";
        this.setCustomValidity("Birth date cannot be in the future.");
        return;
      }

      // Treat dates more than 120 years ago as unreasonable.
      const oldestAllowed = new Date();
      oldestAllowed.setFullYear(oldestAllowed.getFullYear() - 120);

      if (selected < oldestAllowed) {
        birthWarning.textContent =
          "Warning: This birth date is more than 120 years ago. Please verify that it is correct.";
        birthWarning.style.display = "block";
      }

      this.setCustomValidity("");
    });

    function clean(value) {
      return value.trim();
    }

    function validateForm() {
      errorMessage.className = "message";
      errorMessage.textContent = "";

      // Normalize text values.
      document.querySelectorAll("input[type='text'], textarea").forEach(field => {
        field.value = clean(field.value);
      });

      // Re-check birth date.
      if (birthdate.value) {
        const selected = new Date(birthdate.value + "T00:00:00");
        const now = new Date();
        if (selected > now) {
          birthdate.setCustomValidity("Birth date cannot be in the future.");
        } else {
          birthdate.setCustomValidity("");
        }
      }

      if (!form.checkValidity()) {
        errorMessage.textContent =
          "Please correct the highlighted fields. All required fields must contain valid information.";
        errorMessage.className = "message error";

        form.reportValidity();
        return false;
      }

      // Extra check to ensure first and last names are different required entries.
      if (!clean(document.getElementById("firstname").value) ||
          !clean(document.getElementById("lastname").value)) {
        errorMessage.textContent = "Please enter both a first name and a last name.";
        errorMessage.className = "message error";
        return false;
      }

      return true;
    }

    function addReviewRow(label, value) {
      const row = document.createElement("div");
      row.className = "review-row";

      const labelElement = document.createElement("div");
      labelElement.className = "review-label";
      labelElement.textContent = label;

      const valueElement = document.createElement("div");
      valueElement.textContent = value;

      row.appendChild(labelElement);
      row.appendChild(valueElement);
      review.appendChild(row);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm()) return;

      review.innerHTML = "";

      const get = id => document.getElementById(id).value;

      addReviewRow("Name", `${get("firstname")} ${get("lastname")}`);
      addReviewRow(
        "Mailing Address",
        `${get("address")}, ${get("city")}, ${get("state")} ${get("zip")}`
      );
      addReviewRow("Phone Number", get("phone"));
      addReviewRow("Email Address", get("email"));
      addReviewRow("Birth Date", get("birthdate"));
      addReviewRow("Message", get("message"));
      addReviewRow("Confirmation", "Security question answered correctly.");

      formSection.style.display = "none";
      confirmationSection.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.getElementById("editButton").addEventListener("click", function () {
      confirmationSection.style.display = "none";
      formSection.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.getElementById("confirmButton").addEventListener("click", function () {
      const get = id => document.getElementById(id).value;

      const subject = "Form Submission";
      const body =
        "Form Submission\\n\\n" +
        "Name: " + get("firstname") + " " + get("lastname") + "\\n" +
        "Address: " + get("address") + ", " + get("city") + ", " +
          get("state") + " " + get("zip") + "\\n" +
        "Phone Number: " + get("phone") + "\\n" +
        "Email Address: " + get("email") + "\\n" +
        "Birth Date: " + get("birthdate") + "\\n\\n" +
        "Message:\\n" + get("message");

      window.location.href =
        "mailto:" + get("email") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });

    form.addEventListener("reset", function () {
      setTimeout(() => {
        errorMessage.className = "message";
        errorMessage.textContent = "";
        birthWarning.style.display = "none";
        birthWarning.textContent = "";
        birthdate.setCustomValidity("");
      }, 0);
    });
