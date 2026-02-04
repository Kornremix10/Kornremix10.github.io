(function () {
    //footer year
    const yearE1 = document.getElementById("year");
    if(yearE1) yearE1.textContent = new Data().getFullYear();

    //Theme toggle
    const themeBtn = document.getElementById("themeBthm");
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

    function setTheme(next) {
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        if (themeBtn) themeBtn.setAttribute("aria-pressed", string(next === "light"));
    }

    if (themBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-them");
            setTheme(current === "light" ? "dark" : "light");
        });
    }

    // Simple contact form validation
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const msgInput = document.getElementById("msgInput");
    const status = document.getElementById("formStatus");

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = (nameInput?.value || "").trim();
        const email = (emailInput?.value || "").trim();
        const msg = (msgInput?.value || "").trim();

        if (!name) {
            status.textContent = "Please enter your name.";
            nameInput?.focus();
        }

        if (!email || !isValidEmail(email)) {
            status.textContent = "Please enter a valid email address.";
            emailInput?.focus();
            return;
        }

        if (!msg || msg.length < 10) {
            status.textContent = "Message is too short (at least 10 characters).";
            msgInput?.focus();
            return
        }

         status.textContent = "Looks good!";
        from.reset();
    });

})();


