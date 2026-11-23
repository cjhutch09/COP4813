
const minSpeed = 0.2;
const maxSpeed = 0.28;
const WORDS = ["planet","garden","castle","window","rabbit","forest",
  "silver","orange","bridge","rocket","summer","pencil","thunder","blanket","journey","diamond","picture",
  "morning","village","monster","rainbow","freedom","teacher","library","sunset"
];
const extraLetters = 15;
const startingLives = 3;
const playArea = document.getElementById("playArea");
const wordDisplay = document.getElementById("wordDisplay");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const restartButton = document.getElementById("restartButton");

let score = 0;
let lives = startingLives;
let currentWord = "";
let foundLetters = [];
let movingLetters = [];
let animationId = null;
let gameOver = false;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomLetter() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function chooseWord() {
  currentWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
  foundLetters = new Array(currentWord.length).fill(false);
}

function renderWord() {
  wordDisplay.innerHTML = "";

  for (let i = 0; i < currentWord.length; i++) {
    const span = document.createElement("span");
    span.className = "word-letter" + (foundLetters[i] ? " found" : "");
    span.textContent = currentWord[i];
    wordDisplay.appendChild(span);
  }
}

function createLetter(character, isTarget) {
  const element = document.createElement("div");
  element.className = "letter";
  element.textContent = character;
  element.setAttribute("aria-label", `Letter ${character}`);

  const width = playArea.clientWidth - 22;
  const height = playArea.clientHeight - 22;

  const letter = {
    element,
    character,
    isTarget,
    x: randomBetween(2, Math.max(2, width)),
    y: randomBetween(2, Math.max(2, height)),
    vx: randomBetween(minSpeed, maxSpeed) * (Math.random() < 0.5 ? -1 : 1),
    vy: randomBetween(minSpeed, maxSpeed) * (Math.random() < 0.5 ? -1 : 1)
  };

  element.style.left = `${letter.x}px`;
  element.style.top = `${letter.y}px`;

  element.addEventListener("click", () => selectLetter(letter));

  playArea.appendChild(element);
  movingLetters.push(letter);
}

function buildLetterField() {
  movingLetters.forEach(letter => letter.element.remove());
  movingLetters = [];

  for (const character of currentWord) {
    createLetter(character, true);
  }

  for (let i = 0; i < extraLetters; i++) {
    createLetter(randomLetter(), false);
  }
}

function selectLetter(letter) {
  if (gameOver || !movingLetters.includes(letter)) return;

  if (letter.isTarget) {
    const index = foundLetters.findIndex(
      (found, i) => !found && currentWord[i] === letter.character
    );

    if (index !== -1) {
      foundLetters[index] = true;
      renderWord();
      removeLetter(letter);

      if (foundLetters.every(Boolean)) {
        score += 1;
        scoreElement.textContent = score;

        setTimeout(() => {
          if (!gameOver) {
            chooseWord();
            renderWord();
            buildLetterField();
          }
        }, 500);
      }
    }
  } else {
    lives -= 1;
    livesElement.textContent = lives;
    removeLetter(letter);

    if (lives <= 0) {
      endGame();
    }
  }
}

function removeLetter(letter) {
  const index = movingLetters.indexOf(letter);
  if (index !== -1) {
    movingLetters.splice(index, 1);
  }

  letter.element.remove();
}

function updateLetters() {
  const width = playArea.clientWidth - 22;
  const height = playArea.clientHeight - 22;

  for (const letter of movingLetters) {
    letter.x += letter.vx;
    letter.y += letter.vy;

    if (letter.x <= 0) {
      letter.x = 0;
      letter.vx *= -1;
    } else if (letter.x >= width) {
      letter.x = width;
      letter.vx *= -1;
    }

    if (letter.y <= 0) {
      letter.y = 0;
      letter.vy *= -1;
    } else if (letter.y >= height) {
      letter.y = height;
      letter.vy *= -1;
    }

    letter.element.style.left = `${letter.x}px`;
    letter.element.style.top = `${letter.y}px`;
  }

  animationId = requestAnimationFrame(updateLetters);
}

function endGame() {
  gameOver = true;
  playArea.classList.add("game-over");
  wordDisplay.textContent = "GAME OVER";
  restartButton.style.display = "block";

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function startGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  score = 0;
  lives = startingLives;
  gameOver = false;

  scoreElement.textContent = score;
  livesElement.textContent = lives;
  restartButton.style.display = "none";
  playArea.classList.remove("game-over");

  chooseWord();
  renderWord();
  buildLetterField();

  animationId = requestAnimationFrame(updateLetters);
}

restartButton.addEventListener("click", startGame);

startGame();
