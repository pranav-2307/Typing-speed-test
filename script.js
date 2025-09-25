const paragraphs = [
  "The quick brown fox jumps over the lazy dog.",
  "JavaScript is the language of the web.",
  "Typing speed test helps you improve your skills.",
  "Practice daily to enhance accuracy and speed."
];

const paragraphEl = document.getElementById("paragraph");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const errorsEl = document.getElementById("errors");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");

let time = 60;
let timer = null;
let errors = 0;
let charactersTyped = 0;
let currentParagraph = "";
let bestWPM = localStorage.getItem("bestWPM") || 0;

// Load best score
bestEl.textContent = bestWPM;

function loadParagraph() {
  currentParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  paragraphEl.innerHTML = "";
  currentParagraph.split("").forEach(char => {
    let span = document.createElement("span");
    span.innerText = char;
    paragraphEl.appendChild(span);
  });
}

function startTimer() {
  if (timer) return; // prevent multiple intervals
  timer = setInterval(() => {
    if (time > 0) {
      time--;
      timerEl.innerText = `Time: ${time}s`;
    } else {
      finishTest();
    }
  }, 1000);
}

function checkInput() {
  startTimer();
  const input = inputEl.value.split("");
  const spanArray = paragraphEl.querySelectorAll("span");
  errors = 0;
  
  spanArray.forEach((char, index) => {
    if (!input[index]) {
      char.classList.remove("correct", "incorrect");
    } else if (input[index] === char.innerText) {
      char.classList.add("correct");
      char.classList.remove("incorrect");
    } else {
      char.classList.add("incorrect");
      char.classList.remove("correct");
      errors++;
    }
  });

  charactersTyped++;
  errorsEl.innerText = errors;
}

function finishTest() {
  clearInterval(timer);
  inputEl.disabled = true;

  let wordsTyped = inputEl.value.trim().split(" ").length;
  let wpm = Math.round((wordsTyped / 60) * (60 - time));
  let accuracy = Math.round(((charactersTyped - errors) / charactersTyped) * 100);

  wpmEl.innerText = wpm;
  accuracyEl.innerText = `${accuracy}%`;

  if (wpm > bestWPM) {
    localStorage.setItem("bestWPM", wpm);
    bestEl.textContent = wpm;
  }
}

restartBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  time = 60;
  charactersTyped = 0;
  errors = 0;
  timerEl.innerText = `Time: ${time}s`;
  inputEl.value = "";
  inputEl.disabled = false;
  wpmEl.innerText = 0;
  accuracyEl.innerText = "0%";
  errorsEl.innerText = 0;
  loadParagraph();
});

inputEl.addEventListener("input", checkInput);

// Initial load
loadParagraph();
