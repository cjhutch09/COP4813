
const cardGrid = document.getElementById("cardGrid");
const dealButton = document.getElementById("dealButton");
const drawReplacementButton = document.getElementById("drawReplacementButton");
const discardOnlyButton = document.getElementById("discardOnlyButton");
const decisionPrompt = document.getElementById("decisionPrompt");
const discardPile = document.getElementById("discardPile");
const discardCount = document.getElementById("discardCount");
const deckStatus = document.getElementById("deckStatus");
const cCount = document.getElementById("cardCount");


const suits = ["C", "H", "D", "S"];
const deck = [];
let cardsInPlay = [];
let discardedCards = [];
let drawPile = [];
let pendingDiscardId = null;
let handSize = 5;

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

  const image = document.createElement("img");
  image.src = imagePath(card);
  image.alt = card.id;
  image.draggable = false;

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

  cardElement.addEventListener("mouseenter", () => cardElement.classList.add("hovered"));
  cardElement.addEventListener("mouseleave", () => cardElement.classList.remove("hovered"));

  return cardElement;
}


function renderCardSelection() {
  cardGrid.querySelectorAll(".playing-card").forEach((element) => {
    element.classList.toggle("selected", element.dataset.cardId === pendingDiscardId);
    element.setAttribute("aria-pressed", String(element.dataset.cardId === pendingDiscardId));
  });
}

function updateDecisionControls() {
  const hasSelection = pendingDiscardId !== null &&
    cardsInPlay.some(card => card.id === pendingDiscardId);
  drawReplacementButton.disabled = !hasSelection;
  discardOnlyButton.disabled = !hasSelection;
  decisionPrompt.textContent = hasSelection ? "Card selected. Choose an option." : "Select a card or drag one to the discard pile, then choose whether to draw.";
}

function renderCards() {
  cardGrid.replaceChildren();

  if (cardsInPlay.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<h3>No game currently active</h3><p>Press <strong>Deal</strong> to play</p>';
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
  renderCardSelection();
  deckStatus.textContent = cardsInPlay.length ? (drawPile.length + " left to draw") : "No cards dealt yet";
  renderDiscardPile();
}

function renderDiscardPile() {
  discardPile.replaceChildren();

  const pendingCard = pendingDiscardId
    ? cardsInPlay.find(card => card.id === pendingDiscardId)
    : null;
  const topCard = pendingCard || discardedCards[discardedCards.length - 1];

  if (!topCard) {
    const placeholder = document.createElement("span");
    placeholder.className = "discard-placeholder";
    placeholder.textContent = "DROP CARD HERE";
    discardPile.appendChild(placeholder);
    return;
  }

  const image = document.createElement("img");
  image.className = "discard-top-card" + (pendingCard ? " pending-card" : "");
  image.src = imagePath(topCard);
  discardPile.appendChild(image);


}

function dealCards() {
  dealButton.disabled = true;
  cCount.disabled = true;
  const sze = parseInt(cCount.value);
  handSize = sze;
  const shuffledDeck = shuffle([...deck]);
  cardsInPlay = shuffledDeck.splice(0, handSize);
  drawPile = shuffledDeck;
  discardedCards = [];
  renderCards();
}

function discardCard(cardId, drawReplacement = null) {
  const cardIndex = cardsInPlay.findIndex(card => card.id === cardId);
  if (cardIndex === -1) return;

  if (drawReplacement === null) {
    pendingDiscardId = cardId;
    updateDecisionControls();
    renderCardSelection();
    renderDiscardPile();
    return;
  }

  const [card] = cardsInPlay.splice(cardIndex, 1);
  discardedCards.push(card);
  pendingDiscardId = null;

  if (drawReplacement && drawPile.length > 0) {
    const replacement = drawPile.pop();
    cardsInPlay.push(replacement);
    renderCards();

  } else {
    renderCards();
    if (cardsInPlay.length === 0) {
	dealButton.disabled = false;
	 cCount.disabled = false;

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
