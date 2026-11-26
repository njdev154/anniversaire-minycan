const DATE_OUVERTURE = Date.UTC(2026, 11, 4, 0, 0, 0);
const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const queryParams = new URLSearchParams(window.location.search);
const TEST_MODE = isLocalHost && queryParams.get("test") === "1";
const PREVIEW_MODE = queryParams.get("preview") === "1";

const waitingScreen = document.querySelector("#waitingScreen");
const mailScreen = document.querySelector("#mailScreen");
const experience = document.querySelector("#experience");
const openEnvelope = document.querySelector("#openEnvelope");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const galleryImageVersions = new WeakMap();

const souvenirs = [
  {
    image: "moment-01.jpg",
    note: "Ce clin d'œil là… tu savais très bien ce que tu faisais.",
  },
  {
    image: "moment-02.jpg",
    note: "Ma princesse, même en classe, tu brilles plus que le tableau.",
  },
  {
    image: "moment-03.jpg",
    note: "Simple, naturelle, et toujours la plus belle de la photo.",
  },
  {
    image: "moment-04.jpg",
    note: "Ce regard-là, c'est celui qui me fait craquer à tout moment.",
  },
  {
    image: "moment-05.jpg",
    note: "Photo d'identité ou photo de star ? On ne sait plus.",
  },
  {
    image: "moment-06.jpg",
    note: "Voilà le sourire dont je parle. Celui-là même.",
  },
  {
    image: "moment-07.jpg",
    note: "En noir et blanc ou en couleur, c'est toujours toi la plus douce.",
  },
  {
    image: "moment-08.jpg",
    note: "Quand tu ris comme ça, tout le monde est obligé de rire avec toi.",
  },
  {
    image: "moment-09.jpg",
    note: "Toi, l'air frais, et ce petit air de femme qui sait où elle va.",
  },
  {
    image: "moment-10.jpg",
    note: "Ma maman, posée comme une reine sur son trône.",
  },
];

const petitesFolies = [
  "clin-oeil-01.jpg",
  "clin-oeil-02.jpg",
  "clin-oeil-03.jpg",
  "clin-oeil-04.jpg",
  "clin-oeil-05.jpg",
];

let memoryIndex = 0;
let playIndex = 0;
let voiceMessage;
let surpriseOpened = false;

function updateCountdown() {
  const remaining = Math.max(0, DATE_OUVERTURE - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  Object.entries(values).forEach(([unit, value]) => {
    const element = document.querySelector(`#${unit}`);
    if (element) element.textContent = String(value).padStart(2, "0");
  });

  if (remaining === 0) {
    clearInterval(countdownTimer);
    showMailScreen(true);
  }
}

function showMailScreen(celebrate) {
  if (surpriseOpened) return;
  surpriseOpened = true;
  waitingScreen.hidden = true;
  mailScreen.hidden = false;
  document.title = "Tu as reçu un courrier";
  if (celebrate) makeConfetti(38);
}

function makeConfetti(amount) {
  if (reducedMotion) return;
  const layer = document.querySelector("#confettiLayer");
  const colors = ["#fbf8f1", "#d3b27e", "#75816d", "#bd553b"];
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--size", `${5 + Math.random() * 7}px`);
    piece.style.setProperty("--duration", `${2.8 + Math.random() * 1.8}s`);
    piece.style.setProperty("--delay", `${Math.random() * 0.6}s`);
    piece.style.setProperty("--drift", `${Math.round(Math.random() * 120 - 60)}px`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    layer.append(piece);
    window.setTimeout(() => piece.remove(), 5200);
  }
}

function startExperience() {
  mailScreen.classList.add("is-opening");
  openEnvelope.disabled = true;
  window.setTimeout(() => {
    mailScreen.hidden = true;
    experience.hidden = false;
    document.title = "Pour Minycan Emmanuella";
    makeConfetti(26);
    loadMedia(document.querySelector(".hero-portrait img"));
    initializeExperience();
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, 850);
}

function initializeExperience() {
  createGalleryThumbnails(
    document.querySelector("#memoryThumbnails"),
    souvenirs.map((memory) => memory.image),
    "Souvenir",
    "memory-thumb",
    setMemory,
  );
  createGalleryThumbnails(
    document.querySelector("#playThumbnails"),
    petitesFolies,
    "Photo drôle",
    "play-thumb",
    setPlayImage,
  );
  setMemory(0);
  setPlayImage(0);
  loadNearbyMedia();
  observeReveals();
  observeHeart();
  createWaveform();
  updateProgress();
  window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
  window.addEventListener("resize", scheduleProgressUpdate);
}

function loadNearbyMedia() {
  const deferredMedia = document.querySelectorAll("img[data-src]");
  if (!("IntersectionObserver" in window)) {
    deferredMedia.forEach(loadMedia);
    return;
  }

  const mediaObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMedia(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "260px 0px" },
  );
  deferredMedia.forEach((media) => mediaObserver.observe(media));
}

function loadMedia(media) {
  const source = media.dataset.src;
  if (!source) return;
  media.src = source;
  media.removeAttribute("data-src");
  if (media.tagName === "SOURCE") media.parentElement.load();
}

function observeReveals() {
  const elements = document.querySelectorAll("[data-reveal]");
  elements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
  });
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );
  elements.forEach((element) => revealObserver.observe(element));
}

function observeHeart() {
  const heart = document.querySelector(".heart-trail");
  if (!("IntersectionObserver" in window)) {
    heart.classList.add("is-visible");
    return;
  }
  const heartObserver = new IntersectionObserver(
    (entries, observer) => {
      if (entries[0].isIntersecting) {
        heart.classList.add("is-visible");
        observer.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  heartObserver.observe(heart);
}

function createGalleryThumbnails(container, images, label, className, onSelect) {
  container.replaceChildren();
  images.forEach((image, index) => {
    const button = document.createElement("button");
    const thumbnail = document.createElement("img");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", `${label} ${index + 1} sur ${images.length}`);
    button.setAttribute("aria-pressed", "false");
    thumbnail.dataset.src = `assets/photos/${image}`;
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    button.append(thumbnail);
    button.addEventListener("click", () => onSelect(index));
    container.append(button);
  });
}

function updateGalleryThumbnails(container, index) {
  container.querySelectorAll("button").forEach((button, buttonIndex) => {
    button.setAttribute("aria-pressed", String(buttonIndex === index));
  });
}

function updateGalleryImage(image, filename, alt) {
  const version = (galleryImageVersions.get(image) || 0) + 1;
  galleryImageVersions.set(image, version);
  image.classList.remove("is-developing");
  image.src = `assets/photos/${filename}`;
  image.alt = alt;
  if (reducedMotion) return;

  const revealImage = () => {
    if (galleryImageVersions.get(image) !== version) return;
    if (!image.complete || image.naturalWidth === 0) return;
    image.classList.remove("is-developing");
    void image.offsetWidth;
    image.classList.add("is-developing");
  };

  if (image.complete) {
    window.requestAnimationFrame(revealImage);
  } else {
    image.addEventListener("load", revealImage, { once: true });
  }
}

function setMemory(index) {
  memoryIndex = (index + souvenirs.length) % souvenirs.length;
  const memory = souvenirs[memoryIndex];
  const image = document.querySelector("#memoryImage");
  const polaroid = document.querySelector("#polaroid");

  polaroid.classList.remove("is-flipped");
  updateGalleryImage(
    image,
    memory.image,
    `Souvenir ${memoryIndex + 1} sur ${souvenirs.length} de Minycan`,
  );
  document.querySelector("#memoryNote").textContent = memory.note;
  document.querySelector("#memoryLabel").textContent = `Un petit instant à garder · ${String(memoryIndex + 1).padStart(2, "0")}`;
  document.querySelector("#memoryCount").innerHTML =
    `${String(memoryIndex + 1).padStart(2, "0")} <i>/</i> ${String(souvenirs.length).padStart(2, "0")}`;
  updateGalleryThumbnails(document.querySelector("#memoryThumbnails"), memoryIndex);
}

function setPlayImage(index) {
  playIndex = (index + petitesFolies.length) % petitesFolies.length;
  const image = document.querySelector("#playImage");
  updateGalleryImage(
    image,
    petitesFolies[playIndex],
    `Petit moment drôle de Minycan, photo ${playIndex + 1} sur ${petitesFolies.length}`,
  );
  document.querySelector("#playCount").textContent =
    `${String(playIndex + 1).padStart(2, "0")} / ${String(petitesFolies.length).padStart(2, "0")}`;
  updateGalleryThumbnails(document.querySelector("#playThumbnails"), playIndex);
}

function createWaveform() {
  const waveform = document.querySelector("#waveform");
  for (let index = 0; index < 38; index += 1) {
    const bar = document.createElement("span");
    const variation = 20 + Math.abs(Math.sin(index * 2.31)) * 74;
    bar.style.setProperty("--bar-height", `${variation}%`);
    bar.style.setProperty("--delay", `${(index % 9) * -90}ms`);
    waveform.append(bar);
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function updateVoiceProgress() {
  const progress = document.querySelector("#audioProgress");
  if (!voiceMessage || !Number.isFinite(voiceMessage.duration)) return;
  progress.value = String((voiceMessage.currentTime / voiceMessage.duration) * 100);
  document.querySelector("#audioElapsed").textContent = formatTime(voiceMessage.currentTime);
  document.querySelector("#audioDuration").textContent = formatTime(voiceMessage.duration);
}

async function toggleVoiceMessage() {
  const button = document.querySelector("#voiceButton");
  const errorMessage = document.querySelector("#audioError");
  errorMessage.textContent = "";

  if (!voiceMessage) {
    voiceMessage = new Audio("assets/audio/message-vocal.mp3");
    voiceMessage.preload = "metadata";
    voiceMessage.addEventListener("timeupdate", updateVoiceProgress);
    voiceMessage.addEventListener("loadedmetadata", () => {
      document.querySelector("#audioProgressWrap").hidden = false;
      updateVoiceProgress();
    });
    voiceMessage.addEventListener("ended", () => {
      button.classList.remove("is-playing");
      document.querySelector("#waveform").classList.remove("is-playing");
      document.querySelector(".voice-play-icon").textContent = "▶";
      document.querySelector(".voice-button-label").textContent = "Réécouter mon message";
      button.setAttribute("aria-label", "Réécouter le message vocal");
    });
    voiceMessage.addEventListener("error", () => {
      errorMessage.textContent = "Le message vocal n'a pas pu être chargé. Réessaie quand tu seras connectée.";
    });
  }

  if (voiceMessage.paused) {
    try {
      await voiceMessage.play();
      button.classList.add("is-playing");
      document.querySelector("#waveform").classList.add("is-playing");
      document.querySelector(".voice-play-icon").textContent = "Ⅱ";
      document.querySelector(".voice-button-label").textContent = "Mettre en pause";
      button.setAttribute("aria-label", "Mettre en pause le message vocal");
    } catch {
      errorMessage.textContent = "Le message vocal n'a pas pu démarrer. Vérifie ta connexion puis réessaie.";
    }
    return;
  }

  voiceMessage.pause();
  button.classList.remove("is-playing");
  document.querySelector("#waveform").classList.remove("is-playing");
  document.querySelector(".voice-play-icon").textContent = "▶";
  document.querySelector(".voice-button-label").textContent = "Reprendre mon message";
  button.setAttribute("aria-label", "Reprendre le message vocal");
}

let progressFrame = null;

function scheduleProgressUpdate() {
  if (progressFrame !== null) return;
  progressFrame = window.requestAnimationFrame(() => {
    progressFrame = null;
    updateProgress();
  });
}

function updateProgress() {
  const progress = document.querySelector("#readingProgress");
  if (!progress || experience.hidden) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  if (!reducedMotion) {
    const hero = document.querySelector(".hero-portrait");
    hero.style.setProperty("--hero-offset", `${Math.min(window.scrollY * 0.025, 16)}px`);
  }
}

function prepareDateLock() {
  const choices = document.querySelectorAll(".date-choice");
  const feedback = document.querySelector("#dateFeedback");
  const letter = document.querySelector("#letterPaper");

  choices.forEach((choice) => {
    choice.addEventListener("click", () => {
      if (choice.dataset.date !== "04/12") {
        choice.classList.add("is-wrong");
        feedback.textContent = "Pas cette fois, ma princesse.";
        window.setTimeout(() => choice.classList.remove("is-wrong"), 550);
        return;
      }

      choice.classList.add("is-right");
      choices.forEach((option) => { option.disabled = true; });
      feedback.textContent = "C'est bien la tienne. La lettre est à toi.";
      letter.hidden = false;
      makeConfetti(18);
      window.setTimeout(() => {
        letter.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }, 450);
    });
  });
}

function startCountdown() {
  if (TEST_MODE || PREVIEW_MODE) {
    showMailScreen(false);
    return;
  }
  if (Date.now() >= DATE_OUVERTURE) {
    showMailScreen(false);
    return;
  }
  updateCountdown();
  return window.setInterval(updateCountdown, 1000);
}

const countdownTimer = startCountdown();

openEnvelope.addEventListener("click", startExperience);
document.querySelector("#previousMemory").addEventListener("click", () => setMemory(memoryIndex - 1));
document.querySelector("#nextMemory").addEventListener("click", () => setMemory(memoryIndex + 1));
document.querySelector("#flipMemory").addEventListener("click", () => {
  const polaroidCard = document.querySelector("#polaroid");
  const flipped = polaroidCard.classList.toggle("is-flipped");
  document.querySelector("#flipMemory").setAttribute("aria-pressed", String(flipped));
});
let swipeStartX = null;
const polaroid = document.querySelector("#polaroid");
polaroid.addEventListener("pointerdown", (event) => {
  swipeStartX = event.clientX;
});
polaroid.addEventListener("pointerup", (event) => {
  if (swipeStartX === null) return;
  const distance = event.clientX - swipeStartX;
  swipeStartX = null;
  if (Math.abs(distance) > 48) setMemory(memoryIndex + (distance < 0 ? 1 : -1));
});
polaroid.addEventListener("pointercancel", () => { swipeStartX = null; });
document.querySelector("#playMemory").addEventListener("click", () => setPlayImage(playIndex + 1));
const videoNote = document.querySelector("#videoNote");
const memoryVideo = document.querySelector("#memoryVideo");
const videoSource = memoryVideo.querySelector("source");
videoNote.addEventListener("toggle", () => {
  if (videoNote.open) {
    loadMedia(videoSource);
    return;
  }
  if (!memoryVideo.paused) memoryVideo.pause();
});
memoryVideo.addEventListener("error", () => {
  const error = document.querySelector("#videoError");
  error.hidden = false;
  error.textContent = "La vidéo ne peut pas être lue pour le moment. Réessaie après avoir vérifié ta connexion.";
});
document.querySelector("#voiceButton").addEventListener("click", toggleVoiceMessage);
document.querySelector("#audioProgress").addEventListener("input", (event) => {
  if (!voiceMessage || !Number.isFinite(voiceMessage.duration)) return;
  voiceMessage.currentTime = (Number(event.target.value) / 100) * voiceMessage.duration;
  updateVoiceProgress();
});
document.querySelector("#restartExperience").addEventListener("click", () => {
  document.querySelector("#accueil").scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
});

prepareDateLock();
