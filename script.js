/*
  EDIT DETAIL ACARA DI OBJECT CONFIG INI SAJA.
  eventDate menggunakan YYYY-MM-DD, contoh: 2026-12-01.
  Foto: letakkan file di assets/nenek.jpg atau ubah portraitFile.
  Musik opsional: letakkan file di assets/ambient.mp3 atau ubah musicFile.
*/
const CONFIG = {
  deceasedName: "[ Nama Nenek ]",
  familyName: "Keluarga [ Nama Keluarga ]",
  eventDate: "",        // YYYY-MM-DD
  eventTime: "",        // Contoh: 09.00 WIB
  venue: "",            // Nama tempat
  address: "",          // Alamat lengkap
  mapsUrl: "",          // Opsional: tautan Google Maps
  portraitFile: "assets/nenek.jpg",
  musicFile: ""         // Opsional: assets/ambient.mp3
};

const $ = (id) => document.getElementById(id);
const clean = (value) => typeof value === "string" ? value.trim() : "";
const showText = (id, value, fallback = "Akan diinformasikan") => {
  const node = $(id);
  if (node) node.textContent = clean(value) || fallback;
};

function parseLocalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function setInvitationContent() {
  const name = clean(CONFIG.deceasedName) || "[ Nama Nenek ]";
  const family = clean(CONFIG.familyName) || "Keluarga [ Nama Keluarga ]";
  ["entryName", "heroName", "closingName"].forEach((id) => showText(id, name, "[ Nama Nenek ]"));
  showText("familyName", family);
  showText("closingFamily", family);
  showText("detailTime", CONFIG.eventTime);
  showText("detailVenue", CONFIG.venue);
  showText("detailAddress", CONFIG.address);

  const date = parseLocalDate(clean(CONFIG.eventDate));
  if (date) {
    const weekday = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
    const month = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(date);
    const fullDate = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
    showText("dateDay", String(date.getDate()).padStart(2, "0"), "—");
    showText("dateMonth", month.toUpperCase(), "TANGGAL");
    showText("dateYear", String(date.getFullYear()), "");
    showText("detailDate", weekday + ", " + fullDate);

    const timeMatch = clean(CONFIG.eventTime).match(/(\d{1,2})[.:](\d{2})/);
    const hour = timeMatch ? Math.min(23, Number(timeMatch[1])) : 0;
    const minute = timeMatch ? Math.min(59, Number(timeMatch[2])) : 0;
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
    if (target.getTime() > Date.now()) {
      $("countdownWrap").hidden = false;
      $("gatheringNote").textContent = "Kami menantikan kesempatan untuk berkumpul dalam doa dan kenangan.";
      startCountdown(target);
    } else {
      $("countdownWrap").hidden = true;
      $("gatheringNote").textContent = "Tanggal acara telah berlalu. Informasi ini dapat tetap menjadi arsip kenangan keluarga.";
    }
  } else {
    showText("dateDay", "—", "—");
    showText("dateMonth", "TANGGAL MENYUSUL", "TANGGAL MENYUSUL");
    showText("dateYear", "", "");
    showText("detailDate", "Akan diinformasikan");
    $("countdownWrap").hidden = true;
    $("gatheringNote").textContent = "Informasi waktu dan tempat akan dilengkapi oleh keluarga.";
  }

  const map = $("mapLink");
  const mapUrl = clean(CONFIG.mapsUrl) || (clean(CONFIG.address)
    ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.address)
    : "");
  if (mapUrl) {
    map.href = mapUrl;
    map.hidden = false;
  } else {
    map.hidden = true;
  }

  const photo = $("memorialPhoto");
  const placeholder = $("portraitPlaceholder");
  if (clean(CONFIG.portraitFile)) {
    photo.addEventListener("load", () => {
      photo.classList.add("is-loaded");
      placeholder.hidden = true;
    }, { once: true });
    photo.addEventListener("error", () => {
      photo.classList.remove("is-loaded");
      placeholder.hidden = false;
    }, { once: true });
    photo.src = CONFIG.portraitFile;
  }

  const audio = $("backgroundAudio");
  const audioButton = $("audioToggle");
  if (clean(CONFIG.musicFile)) {
    audio.src = CONFIG.musicFile;
    audioButton.hidden = false;
  }
}

function startCountdown(target) {
  let intervalId;
  const update = () => {
    const remaining = target.getTime() - Date.now();
    if (remaining <= 0) {
      $("countdownWrap").hidden = true;
      if (intervalId) clearInterval(intervalId);
      return;
    }
    const values = {
      cdDays: Math.floor(remaining / 86400000),
      cdHours: Math.floor((remaining % 86400000) / 3600000),
      cdMinutes: Math.floor((remaining % 3600000) / 60000),
      cdSeconds: Math.floor((remaining % 60000) / 1000)
    };
    Object.entries(values).forEach(([id, number]) => showText(id, String(number).padStart(2, "0"), "00"));
  };
  update();
  intervalId = window.setInterval(update, 1000);
}

function openInvitation() {
  const entry = $("entry");
  const site = $("site");
  document.body.classList.remove("is-entering");
  entry.classList.add("is-opening");
  site.classList.add("is-visible");
  site.setAttribute("aria-hidden", "false");
  window.setTimeout(() => { entry.hidden = true; }, 950);
}

function setupAudio() {
  const audio = $("backgroundAudio");
  const button = $("audioToggle");
  const label = $("audioLabel");
  if (!clean(CONFIG.musicFile)) return;
  button.addEventListener("click", async () => {
    if (!audio.paused) {
      audio.pause();
      button.classList.remove("is-playing");
      button.setAttribute("aria-label", "Putar musik");
      label.textContent = "AUDIO OFF";
      return;
    }
    try {
      await audio.play();
      button.classList.add("is-playing");
      button.setAttribute("aria-label", "Jeda musik");
      label.textContent = "AUDIO ON";
    } catch (error) {
      label.textContent = "AUDIO OFF";
    }
  });
  audio.addEventListener("ended", () => button.classList.remove("is-playing"));
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
  elements.forEach((element) => observer.observe(element));
}

function setupReadingProgress() {
  const bar = $("readingProgress");
  let scheduled = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = String(Math.max(0, Math.min(100, progress))) + "%";
    scheduled = false;
  };
  window.addEventListener("scroll", () => {
    if (!scheduled) {
      window.requestAnimationFrame(update);
      scheduled = true;
    }
  }, { passive: true });
  update();
}

$("openInvitation").addEventListener("click", openInvitation);
setInvitationContent();
setupAudio();
setupReveal();
setupReadingProgress();