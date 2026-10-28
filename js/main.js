// The Cost of a Prompt — shared behavior for every page.

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });
}

// Fade sections in as they scroll into view, and grow bar charts
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      entry.target.querySelectorAll(".bar-fill[data-width]").forEach((bar) => {
        bar.style.width = bar.dataset.width;
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal, .bars").forEach((el) => observer.observe(el));

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------------------------------------------------------------------------
// Prompt calculator (overview page)
// Rough per-prompt estimates. Published estimates vary a lot by model, data
// center and year, so we show a low-high range instead of a single number.
//   Energy: ~0.3 Wh (Epoch AI, 2025) to ~3 Wh (earlier estimates, e.g. de Vries 2023)
//   Water:  ~10 to ~50 mL per response (Li et al., "Making AI Less Thirsty", 2023)
// ---------------------------------------------------------------------------
const calc = document.getElementById("calc");
if (calc) {
  const WH_LOW = 0.3, WH_HIGH = 3;
  const ML_LOW = 10, ML_HIGH = 50;
  const PHONE_CHARGE_WH = 15;   // a typical smartphone battery, fully charged
  const BOTTLE_ML = 500;        // a standard water bottle

  const prompts = document.getElementById("prompts");
  const days = document.getElementById("days");
  const students = document.getElementById("students");
  const fmt = (n) => n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 1 : 0 });

  const update = () => {
    const p = +prompts.value, d = +days.value, s = +students.value;
    document.getElementById("prompts-out").textContent = p;
    document.getElementById("days-out").textContent = d;
    document.getElementById("students-out").textContent = s.toLocaleString();

    const total = p * d;
    const kwhLow = (total * WH_LOW) / 1000, kwhHigh = (total * WH_HIGH) / 1000;
    const lLow = (total * ML_LOW) / 1000, lHigh = (total * ML_HIGH) / 1000;

    document.getElementById("r-prompts").textContent = fmt(total);
    document.getElementById("r-energy").textContent = `${fmt(kwhLow)}–${fmt(kwhHigh)}`;
    document.getElementById("r-phones").textContent =
      `≈ ${fmt((total * WH_LOW) / PHONE_CHARGE_WH)}–${fmt((total * WH_HIGH) / PHONE_CHARGE_WH)} phone charges`;
    document.getElementById("r-water").textContent = `${fmt(lLow)}–${fmt(lHigh)}`;
    document.getElementById("r-bottles").textContent =
      `≈ ${fmt((total * ML_LOW) / BOTTLE_ML)}–${fmt((total * ML_HIGH) / BOTTLE_ML)} water bottles`;

    const campusKwh = ((kwhLow + kwhHigh) / 2) * s;
    const campusL = ((lLow + lHigh) / 2) * s;
    document.getElementById("r-campus").textContent =
      `${fmt(campusKwh / 1000)} MWh of electricity and ${fmt(campusL / 3.785)} gallons of water`;
  };

  [prompts, days, students].forEach((input) => input.addEventListener("input", update));
  update();
}

// ---------------------------------------------------------------------------
// Pledge checklist (action page). Saved in this browser only.
// ---------------------------------------------------------------------------
const pledge = document.getElementById("pledge");
if (pledge) {
  const boxes = [...pledge.querySelectorAll("input[type=checkbox]")];
  const fill = document.getElementById("pledge-fill");
  const count = document.getElementById("pledge-count");
  const KEY = "cost-of-a-prompt-pledge";

  let saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
  boxes.forEach((box) => { box.checked = saved.includes(box.value); });

  const update = () => {
    const checked = boxes.filter((b) => b.checked).map((b) => b.value);
    fill.style.width = `${(checked.length / boxes.length) * 100}%`;
    count.textContent = `${checked.length} of ${boxes.length}`;
    try { localStorage.setItem(KEY, JSON.stringify(checked)); } catch (e) {}
  };
  boxes.forEach((box) => box.addEventListener("change", update));
  update();
}

// Copy-link button (action page)
const copyBtn = document.getElementById("copy-link");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const url = location.href.replace(/[^/]*$/, "index.html");
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = "Link copied!";
    } catch (e) {
      copyBtn.textContent = url;
    }
    setTimeout(() => { copyBtn.textContent = "Copy site link"; }, 2500);
  });
}
