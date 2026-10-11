
const cardGrid = document.getElementById("cardGrid");
const dealButton = document.getElementById("dealButton");
const drawReplacementButton = document.getElementById("drawReplacementButton");
const discardOnlyButton = document.getElementById("discardOnlyButton");
const decisionPrompt = document.getElementById("decisionPrompt");
const discardPile = document.getElementById("discardPile");
const discardCount = document.getElementById("discardCount");
const gameMessage = document.getElementById("gameMessage");
const deckStatus = document.getElementById("deckStatus");

const suits = ["C", "H", "D", "S"];
const deck = [];
let cardsInPlay = [];
let discardedCards = [];
let drawPile = [];
let pendingDiscardId = null;
const HAND_SIZE = 5;

for (const suit of suits) {
  for (let rank = 1; rank <= 13; rank++) {
    deck.push({ id: (suit + rank), suit, rank });
  }
}

function imagePath(card) {
  return ("images/"+card.id+".png");
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function makeCardElement(card) {
  const cardElement = document.createElement("button");
  cardElement.className = "playing-card";
  cardElement.type = "button";
  cardElement.draggable = true;
  cardElement.dataset.cardId = card.id;
  cardElement.setAttribute("aria-label", `Card ${card.id}. Drag to discard pile.`);
  cardElement.title = `Drag ${card.id} to the discard pile`;

  const image = document.createElement("img");
  image.src = imagePath(card);
  image.alt = card.id;
  image.draggable = false;
  image.addEventListener("error", () => {
    image.alt = `Missing image: ${card.id}.${IMAGE_EXTENSION}`;
    image.style.aspectRatio = "5 / 7";
    image.style.padding = "8px";
    image.style.background = "#fff";
    image.style.color = "#222";
    image.style.fontSize = "12px";
    image.style.objectFit = "contain";
    if (!image.dataset.errorShown) {
      image.dataset.errorShown = "true";
      gameMessage.textContent = `Could not load ${imagePath(card)}. Check the images folder and file extension.`;
    }
  }, { once: true });

  cardElement.appendChild(image);

  cardElement.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", card.id);
    event.dataTransfer.effectAllowed = "move";
    cardElement.classList.add("dragging");
  });

  cardElement.addEventListener("dragend", () => {
    cardElement.classList.remove("dragging");
    discardPile.classList.remove("drag-over");
  });

  // Single click selects a card; the player chooses an action below the discard pile.
  cardElement.addEventListener("click", () => {
    pendingDiscardId = card.id;
    updateDecisionControls();
    gameMessage.textContent = `${card.id} selected. Choose whether to draw a replacement below the discard pile.`;
  });

  return cardElement;
}

function updateDecisionControls() {
  const hasSelection = pendingDiscardId !== null &&
    cardsInPlay.some(card => card.id === pendingDiscardId);
  drawReplacementButton.disabled = !hasSelection;
  discardOnlyButton.disabled = !hasSelection;
  decisionPrompt.textContent = hasSelection
    ? `Selected card: ${pendingDiscardId}. Choose an option.`
    : "Select a card or drag one to the discard pile, then choose whether to draw.";
}

function renderCards() {
  cardGrid.replaceChildren();

  if (cardsInPlay.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<span class="empty-icon">🂠</span><h3>No cards in play</h3><p>Press <strong>Deal</strong> to shuffle a fresh deck.</p>';
    cardGrid.appendChild(empty);
  } else {
    const fragment = document.createDocumentFragment();
    cardsInPlay.forEach((card) => fragment.appendChild(makeCardElement(card)));
    cardGrid.appendChild(fragment);
  }

  discardCount.textContent = discardedCards.length;
  if (pendingDiscardId && !cardsInPlay.some(card => card.id === pendingDiscardId)) {
    pendingDiscardId = null;
  }
  updateDecisionControls();
  deckStatus.textContent = cardsInPlay.length ? `${drawPile.length} left to draw` : "Not dealt";
  renderDiscardPile();
}

function renderDiscardPile() {
  discardPile.replaceChildren();

  if (discardedCards.length === 0) {
    const placeholder = document.createElement("span");
    placeholder.className = "discard-placeholder";
    placeholder.textContent = "DROP CARD HERE";
    discardPile.appendChild(placeholder);
    return;
  }

  const topCard = discardedCards[discardedCards.length - 1];
  const image = document.createElement("img");
  image.className = "discard-top-card";
  image.src = imagePath(topCard);
  image.alt = `Top discarded card: ${topCard.id}`;
  discardPile.appendChild(image);

  const badge = document.createElement("span");
  badge.className = "discard-badge";
  badge.textContent = discardedCards.length;
  badge.setAttribute("aria-label", `${discardedCards.length} cards discarded`);
  discardPile.appendChild(badge);
}

function dealCards() {
  const shuffledDeck = shuffle([...deck]);
  cardsInPlay = shuffledDeck.splice(0, HAND_SIZE);
  drawPile = shuffledDeck;
  discardedCards = [];
  renderCards();
  gameMessage.textContent = "Five cards dealt. Discard one to draw a replacement.";
}

function discardCard(cardId, drawReplacement = null) {
  const cardIndex = cardsInPlay.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return;

  // Dropping a card selects it; the player must choose whether to draw.
  if (drawReplacement === null) {
    pendingDiscardId = cardId;
    updateDecisionControls();
    gameMessage.textContent = `${cardId} is ready to discard. Choose "Discard & Draw" or "Discard Only" below the discard pile.`;
    return;
  }

  const [card] = cardsInPlay.splice(cardIndex, 1);
  discardedCards.push(card);
  pendingDiscardId = null;

  if (drawReplacement && drawPile.length > 0) {
    const replacement = drawPile.pop();
    cardsInPlay.push(replacement);
    renderCards();
    gameMessage.textContent = `${card.id} discarded; ${replacement.id} drawn as a replacement.`;
  } else {
    renderCards();
    gameMessage.textContent = drawReplacement
      ? `${card.id} discarded. The draw pile is empty, so no replacement is available.`
      : `${card.id} discarded without drawing a replacement.`;
    if (cardsInPlay.length === 0) {
      gameMessage.textContent = "No cards remain in play. Press Deal to start a new round.";
    }
  }
}

discardPile.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  discardPile.classList.add("drag-over");
});

discardPile.addEventListener("dragleave", (event) => {
  if (!discardPile.contains(event.relatedTarget)) {
    discardPile.classList.remove("drag-over");
  }
});

discardPile.addEventListener("drop", (event) => {
  event.preventDefault();
  discardPile.classList.remove("drag-over");
  const cardId = event.dataTransfer.getData("text/plain");
  if (cardId) discardCard(cardId, null);
});

dealButton.addEventListener("click", dealCards);

drawReplacementButton.addEventListener("click", () => {
  if (pendingDiscardId) discardCard(pendingDiscardId, true);
});

discardOnlyButton.addEventListener("click", () => {
  if (pendingDiscardId) discardCard(pendingDiscardId, false);
});


renderCards();
