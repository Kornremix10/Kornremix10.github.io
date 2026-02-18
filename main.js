// ── Footer year ───────────────────────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Theme toggle ──────────────────────────────────────────────────────────────
const themeBtn = document.getElementById('themeBtn');

// Load saved theme or default to dark
const saved = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = saved;
if (themeBtn) themeBtn.setAttribute('aria-pressed', saved === 'light');

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.dataset.theme;
        const next    = current === 'light' ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        themeBtn.setAttribute('aria-pressed', next === 'light');
    });
}

// ── Contact form (no-op handler so page doesn't reload) ───────────────────────
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (status) {
            status.textContent = 'Message sent! (demo only)';
            setTimeout(() => { status.textContent = ''; }, 3000);
        }
        form.reset();
    });
}
