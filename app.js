// Simple flash-card logic with progress tracking + animated flip

const STORAGE_KEY = "flashCards";

let cards = [];
let currentIndex = 0;
let seen = []; // boolean per card (has this card been visited?)

// DOM references
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const addBtn = document.getElementById("addBtn");

const studyCard = document.getElementById("studyCard");
const cardFrontText = document.getElementById("cardFrontText");
const cardBackText = document.getElementById("cardBackText");
const cardIndexFront = document.getElementById("cardIndexFront");
const cardIndexBack = document.getElementById("cardIndexBack");

const prevBtn = document.getElementById("prevBtn");
const flipBtn = document.getElementById("flipBtn");
const nextBtn = document.getElementById("nextBtn");

const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");

let showingFront = true;

// ---- Storage helpers ----

function loadCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cards = raw ? JSON.parse(raw) : [];
  } catch (e) {
    cards = [];
  }
  seen = cards.map(() => false);
}

function saveCards() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn("Could not save cards:", e);
  }
}

// ---- UI rendering ----

function updateButtonsState() {
  const hasCards = cards.length > 0;
  prevBtn.disabled = !hasCards;
  flipBtn.disabled = !hasCards;
  nextBtn.disabled = !hasCards;
}

function updateProgress() {
  if (!cards.length) {
    progressText.textContent = "No cards yet. Add some on the left to start.";
    progressFill.style.width = "0%";
    return;
  }

  const seenCount = seen.filter(Boolean).length;
  const percent = Math.round((seenCount / cards.length) * 100);

  progressText.textContent = ${seenCount} of ${cards.length} cards seen (${percent}%);
  progressFill.style.width = ${percent}%;
}

function renderCard() {
  if (!cards.length) {
    studyCard.classList.remove("is-flipped");
    showingFront = true;
    cardFrontText.textContent = "Add your first card on the left to start studying.";
    cardBackText.textContent = "The answer will appear here when you flip the card.";
    cardIndexFront.textContent = "0 / 0";
    cardIndexBack.textContent = "0 / 0";
    return;
  }

  const idx = Math.min(Math.max(currentIndex, 0), cards.length - 1);
  const card = cards[idx];

  cardFrontText.textContent = card.question;
  cardBackText.textContent = card.answer;

  const indexText = ${idx + 1} / ${cards.length};
  cardIndexFront.textContent = indexText;
  cardIndexBack.textContent = indexText;

  // Always show question side when we move to a new card
  if (!showingFront) {
    studyCard.classList.remove("is-flipped");
    showingFront = true;
  }
}

function markSeen(i) {
  if (i >= 0 && i < seen.length) {
    seen[i] = true;
  }
}

// ---- Navigation ----

function goToCard(index) {
  if (!cards.length) return;
  currentIndex = Math.min(Math.max(index, 0), cards.length - 1);
  markSeen(currentIndex);
  renderCard();
  updateProgress();
}

function nextCard() {
  if (!cards.length) return;
  const nextIndex = currentIndex + 1 >= cards.length ? 0 : currentIndex + 1;
  goToCard(nextIndex);
}

function prevCard() {
  if (!cards.length) return;
  const prevIndex = currentIndex - 1 < 0 ? cards.length - 1 : currentIndex - 1;
  goToCard(prevIndex);
}

function flipCard() {
  if (!cards.length) return;
  showingFront = !showingFront;
  studyCard.classList.toggle("is-flipped");
}

// ---- Event handlers ----

addBtn.addEventListener("click", () => {
  const q = questionInput.value.trim();
  const a = answerInput.value.trim();

  if (!q || !a) {
    alert("Please enter both a question and an answer.");
    return;
  }

  cards.push({ question: q, answer: a });
  seen.push(false);
  saveCards();

  questionInput.value = "";
  answerInput.value = "";

  if (cards.length === 1) {
    currentIndex = 0;
  }

  updateButtonsState();
  goToCard(currentIndex);
});

prevBtn.addEventListener("click", prevCard);
nextBtn.addEventListener("click", nextCard);
flipBtn.addEventListener("click", flipCard);

// Flip by clicking the card area
studyCard.addEventListener("click", flipCard);

// Keyboard shortcuts: left/right arrows + space
document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "TEXTAREA" || tag === "INPUT") return;

  if (e.code === "ArrowRight") {
    nextCard();
  } else if (e.code === "ArrowLeft") {
    prevCard();
  } else if (e.code === "Space") {
    e.preventDefault();
    flipCard();
  }
});

// ---- Init ----

loadCards();
updateButtonsState();

if (cards.length > 0) {
  currentIndex = 0;
  markSeen(0);
}
renderCard();
updateProgress();
