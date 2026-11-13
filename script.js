/* =========================================================
   EDIT DETAIL UNDANGAN DI BAGIAN CONFIG INI SAJA
   Tanggal memakai format YYYY-MM-DD, contoh: 2026-12-01
   Kosongkan tanggal jika belum ditentukan.
   ========================================================= */
const CONFIG = {
  deceasedName: "[ Nama Nenek ]",
  familyName: "Keluarga [ Nama Keluarga ]",
  eventDate: "",             // Contoh: 2026-12-01
  eventTime: "",             // Contoh: 09.00 WIB
  venue: "",                 // Nama tempat acara
  address: "",               // Alamat lengkap acara
  mapsUrl: "",               // Opsional: tautan Google Maps langsung
  musicFile: "assets/ambient.mp3" // Opsional: tambahkan file musik milik keluarga
};

const $ = (id) => document.getElementById(id);
const intro = $("intro");
const site = $("mainContent");
const music = $("backgroundMusic");
let isPlaying = false;

function setText(id, value, fallback) {
  const el = $(id);
  if (el) el.textContent = value && String(value).trim() ? value : fallback;
}

function setupContent() {
  const name = CONFIG.deceasedName || "[ Nama Nenek ]";
  setText("introName", name, "[ Nama Nenek ]");
  setText("heroName", name, "[ Nama Nenek ]");
  setText("closingName", name, "[ Nama Nenek ]");
  setText("familyName", CONFIG.familyName, "Keluarga [ Nama Keluarga ]");

  const hasDate = /^\d{4}-\d{2}-\d{2}$/.test(CONFIG.eventDate);
  let date = null;
  if (hasDate) {
    const [year, month, day] = CONFIG.eventDate.split("-").map(Number);
    date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) date = null;
  }

  if (date) {
    const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
    const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(date);
    const dateLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
    setText("dateDay", String(date.getDate()).padStart(2, "0"), "—");
    setText("dateMonth", monthName.toUpperCase(), "");
    setText("dateYear", String(date.getFullYear()), "");
    setText("detailDate", `${weekday}, ${dateLabel}`, "Akan diinformasikan");
    const countdownDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (countdownDate.getTime() >= new Date(new Date().toDateString()).getTime()) {
      $("countdownWrap").hidden = false;
      $("detailsNote").textContent = "Kami menantikan kesempatan untuk berkumpul dalam doa dan kenangan.";
      startCountdown(date);
    } else {
      $("countdownWrap").hidden = true;
      $("detailsNote").textContent = "Tanggal acara telah berlalu. Informasi undangan ditampilkan sebagai arsip kenangan keluarga.";
    }
  } else {
    setText("dateDay", "—", "—");
    setText("dateMonth", "TANGGAL MENYUSUL", "TANGGAL MENYUSUL");
    setText("dateYear", "", "");
    setText("detailDate", "Akan diinformasikan", "Akan diinformasikan");
    $("countdownWrap").hidden = true;
  }

  setText("detailTime", CONFIG.eventTime, "Akan diinformasikan");
  setText("detailVenue", CONFIG.venue, "Akan diinformasikan");
  setText("detailAddress", CONFIG.address, "Akan diinformasikan");

  const mapLink = $("mapLink");
  const mapTarget = CONFIG.mapsUrl || (CONFIG.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.address)}` : "");
  if (mapTarget) {
    mapLink.href = mapTarget;
    mapLink.hidden = false;
  }

  const photo = $("memorialPhoto");
  const placeholder = $("photoPlaceholder");
  photo.addEventListener("load", () => { placeholder.hidden = true; });
  photo.addEventListener("error", () => { photo.hidden = true; placeholder.hidden = false; });

  if (CONFIG.musicFile) {
    music.src = CONFIG.musicFile;
    music.addEventListener("error", () => { $("soundButton").hidden = true; });
    // Tampilkan kontrol setelah sumber tersedia; bila file tidak ada, kontrol disembunyikan saat error.
    $("soundButton").hidden = false;
  }
}

function startCountdown(eventDate) {
  // Ikuti jam acara bila ditulis sebagai 09.00 / 09:00; jika belum diisi, gunakan awal hari.
  const timeMatch = String(CONFIG.eventTime || "").match(/(\d{1,2})[.:](\d{2})/);
  const hour = timeMatch ? Math.min(23, Number(timeMatch[1])) : 0;
  const minute = timeMatch ? Math.min(59, Number(timeMatch[2])) : 0;
  const target = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), hour, minute, 0);
  const update = () => {
    const distance = target.getTime() - Date.now();
    if (distance <= 0) {
      $("countdownWrap").hidden = true;
      return;
    }
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    setText("cdDays", String(days).padStart(2, "0"), "00");
    setText("cdHours", String(hours).padStart(2, "0"), "00");
    setText("cdMinutes", String(minutes).padStart(2, "0"), "00");
    setText("cdSeconds", String(seconds).padStart(2, "0"), "00");
  };
  update();
  window.setInterval(update, 1000);
}

function enterInvitation() {
  intro.classList.add("is-leaving");
  site.classList.add("is-visible");
  site.setAttribute("aria-hidden", "false");
  window.setTimeout(() => { intro.hidden = true; }, 1050);
  if (CONFIG.musicFile) {
    music.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
  }
}

function setMusicState(playing) {
  isPlaying = playing;
  const button = $("soundButton");
  button.classList.toggle("is-playing", playing);
  button.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  setText("soundLabel", playing ? "Musik aktif" : "Suara", "Suara");
}

$("enterButton").addEventListener("click", enterInvitation);
$("skipButton").addEventListener("click", enterInvitation);
$("soundButton").addEventListener("click", async () => {
  if (isPlaying) {
    music.pause();
    setMusicState(false);
    return;
  }
  try {
    await music.play();
    setMusicState(true);
  } catch (error) {
    setMusicState(false);
  }
});

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
  items.forEach((item) => observer.observe(item));
}

function setupProgress() {
  const bar = $("progressBar");
  let ticking = false;
  const update = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
}

setupContent();
setupReveal();
setupProgress();
