// ---------- Single source of truth ----------
const titles = [
  { title: "Inception", genre: "Sci-Fi", runtime: 148, rating: 8.8, watched: true },
  { title: "The Office", genre: "Comedy", runtime: 660, rating: 8.9, watched: true },
  { title: "Parasite", genre: "Drama", runtime: 132, rating: 8.5, watched: true },
  { title: "Free Solo", genre: "Documentary", runtime: 100, rating: 8.1, watched: true },
  { title: "Mad Max: Fury Road", genre: "Action", runtime: 120, rating: 8.1, watched: true },
  { title: "Arrival", genre: "Sci-Fi", runtime: 116, rating: 7.9, watched: true },
  { title: "Knives Out", genre: "Comedy", runtime: 130, rating: 7.9, watched: true },
  { title: "The Grand Budapest Hotel", genre: "Comedy", runtime: 99, rating: 8.1, watched: false },
  { title: "Dune: Part Two", genre: "Sci-Fi", runtime: 166, rating: 8.5, watched: false },
  { title: "Moonlight", genre: "Drama", runtime: 111, rating: 7.4, watched: false },
  { title: "My Octopus Teacher", genre: "Documentary", runtime: 85, rating: 8.1, watched: false },
  { title: "John Wick", genre: "Action", runtime: 101, rating: 7.4, watched: false },
  { title: "The Social Dilemma", genre: "Documentary", runtime: 94, rating: 7.6, watched: false },
  { title: "Whiplash", genre: "Drama", runtime: 107, rating: 8.5, watched: false }
];

const users = [
  { email: "maya@reel.test", password: "popcorn1" },
  { email: "leo@reel.test", password: "matinee22" },
  { email: "sam@reel.test", password: "credits!" }
];

const genres = ["Action", "Comedy", "Drama", "Sci-Fi", "Documentary"];

// ---------- Helpers and state ----------
const $ = (id) => document.getElementById(id);
const state = { genre: "all", watched: "all", query: "" };
const fmt = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- Login: show/hide the two views ----------
function showDashboard() {
  $("login-view").classList.add("hidden");
  $("dash-view").classList.remove("hidden");
  render();
}
function showLogin() {
  $("dash-view").classList.add("hidden");
  $("login-view").classList.remove("hidden");
}

$("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const match = users.some((u) => u.email === email && u.password === password); // checked fresh every time
  if (!match) {
    $("login-error").classList.remove("hidden");
    return;
  }
  $("login-error").classList.add("hidden");
  $("login-form").reset(); // nothing remembered
  showDashboard();
});

$("logout").addEventListener("click", showLogin);

// ---------- Fill the genre dropdowns from the array ----------
$("genre").innerHTML = `<option value="all">All genres</option>` + genres.map((g) => `<option>${g}</option>`).join("");
$("n-genre").innerHTML = genres.map((g) => `<option>${g}</option>`).join("");

// ---------- Render everything from the array ----------
function render() {
  // Stats (reduce)
  const watchedMinutes = titles.reduce((sum, t) => sum + (t.watched ? t.runtime : 0), 0);
  const unwatchedCount = titles.reduce((sum, t) => sum + (t.watched ? 0 : 1), 0);
  const rated = titles.filter((t) => t.rating > 0); // new titles start unrated, so they don't drag the average down
  const ratingTotal = rated.reduce((sum, t) => sum + t.rating, 0);

  $("stat-runtime").textContent = fmt(watchedMinutes);
  $("stat-rating").textContent = rated.length ? (ratingTotal / rated.length).toFixed(1) : "–";
  $("stat-unwatched").textContent = unwatchedCount;

  // Filters: genre and watched are two separate conditions, then the search
  const q = state.query.trim().toLowerCase();
  const shown = titles
    .filter((t) => state.genre === "all" || t.genre === state.genre)
    .filter((t) => state.watched === "all" || (state.watched === "watched") === t.watched)
    .filter((t) => t.title.toLowerCase().includes(q));

  $("count").textContent = `Showing ${shown.length} of ${titles.length} titles`;

  // Ticket rows: each row is relative, the two notches are absolute
  $("list").innerHTML = shown.length
    ? shown.map((t) => `
      <li class="relative flex flex-col rounded-xl border border-line bg-white sm:flex-row">
        <span class="absolute -top-2 right-[123px] hidden h-3.5 w-3.5 rounded-full border border-line bg-bg [clip-path:inset(50%_0_0_0)] sm:block"></span>
        <span class="absolute -bottom-2 right-[123px] hidden h-3.5 w-3.5 rounded-full border border-line bg-bg [clip-path:inset(0_0_50%_0)] sm:block"></span>
        <div class="min-w-0 flex-1 px-5 py-4">
          <p class="truncate font-display text-[19px] font-bold">${esc(t.title)}</p>
          <p class="mt-1 text-sm text-muted">${esc(t.genre)} · ${fmt(t.runtime)}</p>
        </div>
        <div class="flex items-center justify-between gap-1.5 border-t-2 border-dashed border-field px-5 py-3 sm:w-[130px] sm:flex-col sm:justify-center sm:border-l-2 sm:border-t-0 sm:px-0 sm:py-0">
          <p class="font-display text-[26px] font-bold">${t.rating > 0 ? t.rating.toFixed(1) : '<span class="text-sm font-medium text-muted">Unrated</span>'}</p>
          <span class="rounded-full px-3 py-1 text-xs font-bold ${t.watched ? "bg-ok-bg text-ok" : "bg-accent text-ink"}">${t.watched ? "Watched" : "To watch"}</span>
        </div>
      </li>`).join("")
    : `<li class="rounded-xl border border-dashed border-field p-8 text-center text-muted">No titles match. Clear the search or change a filter to see more.</li>`;

  // Watched toggle look
  document.querySelectorAll("#seg button").forEach((b) => {
    const on = b.dataset.w === state.watched;
    b.className = "rounded-[7px] px-4 py-2 " + (on ? "bg-plum text-plum-ink" : "text-muted hover:text-ink");
    b.setAttribute("aria-pressed", on);
  });
}

// ---------- Events ----------
$("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
$("genre").addEventListener("change", (e) => { state.genre = e.target.value; render(); });
$("seg").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  state.watched = btn.dataset.w;
  render();
});

$("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("n-title").value.trim();
  const runtime = parseInt($("n-runtime").value, 10);
  const err = $("add-error");
  if (!title || !(runtime > 0)) {
    err.textContent = "Enter a title and a runtime above 0 minutes.";
    err.classList.remove("hidden");
    return;
  }
  err.classList.add("hidden");
  titles.push({ title, genre: $("n-genre").value, runtime, rating: 0, watched: false });
  e.target.reset();
  state.genre = "all"; state.watched = "all"; state.query = "";
  $("genre").value = "all"; $("search").value = "";
  render();
});