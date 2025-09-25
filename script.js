const paragraphEl = document.getElementById('paragraph');
const inputEl = document.getElementById('input');
const timeLeftEl = document.getElementById('time-left');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorsEl = document.getElementById('errors');
const bestEl = document.getElementById('best');
const restartBtn = document.getElementById('restart');
const progressBar = document.getElementById('progress-bar');
const timeSelect = document.getElementById('time-select');
const scoreList = document.getElementById('score-list');
const themeToggle = document.getElementById('theme-toggle');

let TIME = parseInt(timeSelect.value);
let timeLeft = TIME;
let timer = null;
let started = false;
let startTime = null;
let totalTyped = 0;
let correctChars = 0;
let errors = 0;
let currentParagraph = '';
let bestWPM = parseInt(localStorage.getItem('bestWPM') || '0');
bestEl.textContent = bestWPM;

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if(document.body.classList.contains('dark')) themeToggle.textContent = '☀️ Light Mode';
  else themeToggle.textContent = '🌙 Dark Mode';
});

// Pick random paragraph
function pickParagraph(){
  const arr = window.PARAGRAPHS;
  currentParagraph = arr[Math.floor(Math.random() * arr.length)];
  paragraphEl.innerHTML = '';
  currentParagraph.split('').forEach(ch=>{
    const span = document.createElement('span');
    span.innerText = ch;
    paragraphEl.appendChild(span);
  });
}

// Reset test
function resetTest(){
  clearInterval(timer);
  timer=null; started=false;
  startTime=null; totalTyped=0; correctChars=0; errors=0;
  TIME=parseInt(timeSelect.value);
  timeLeft=TIME;
  timeLeftEl.textContent = timeLeft;
  wpmEl.textContent = 0;
  accuracyEl.textContent='0%';
  errorsEl.textContent=0;
  progressBar.style.width='0%';
  inputEl.disabled=false;
  inputEl.value='';
  pickParagraph();
  loadLeaderboard();
  inputEl.focus();
}

// Timer start
function startTimer(){
  if(started) return;
  started=true;
  startTime=Date.now();
  timer = setInterval(()=>{
    timeLeft--;
    timeLeftEl.textContent=timeLeft;
    if(timeLeft<=0) finishTest();
  },1000);
}

// Update stats
function updateStats(){
  const input=inputEl.value;
  totalTyped=input.length;
  const spans=paragraphEl.querySelectorAll('span');
  correctChars=0; errors=0;

  spans.forEach((span,i)=>{
    span.classList.remove('correct','incorrect','active');
    if(!input[i]){}
    else if(input[i]===span.innerText) correctChars++;
    else errors++;
  });

  // active char
  for(let i=0;i<spans.length;i++){
    if(!spans[i].classList.contains('correct') && !spans[i].classList.contains('incorrect')){
      spans[i].classList.add('active');
      break;
    }
  }

  // progress bar
  let progress=Math.min((totalTyped/spans.length)*100,100);
  progressBar.style.width=progress+'%';

  // real-time WPM
  const elapsedSec=Math.max((Date.now()-startTime)/1000,1);
  const elapsedMin=elapsedSec/60;
  const netWords=Math.max((totalTyped-errors)/5,0);
  const netWPM=Math.round(netWords/elapsedMin);
  wpmEl.textContent=isFinite(netWPM)?netWPM:0;
  accuracyEl.textContent=totalTyped?Math.round((correctChars/totalTyped)*100)+'%':'0%';
  errorsEl.textContent=errors;
}

// Finish test
function finishTest(){
  clearInterval(timer);
  inputEl.disabled=true;
  const elapsedSec=(TIME-timeLeft)||1;
  const elapsedMin=elapsedSec/60;
  const netWords=Math.max((totalTyped-errors)/5,0);
  const finalWPM=Math.round(netWords/elapsedMin);
  const finalAccuracy=totalTyped?Math.round((correctChars/totalTyped)*100):0;
  wpmEl.textContent=finalWPM;
  accuracyEl.textContent=finalAccuracy+'%';
  saveScore(finalWPM,finalAccuracy);
  if(finalWPM>bestWPM){bestWPM=finalWPM;localStorage.setItem('bestWPM',bestWPM);bestEl.textContent=bestWPM;}
}

// Save score to leaderboard (localStorage)
function saveScore(wpm,acc){
  let scores=JSON.parse(localStorage.getItem('scores')||'[]');
  scores.unshift({date:new Date().toLocaleString(), wpm, acc});
  if(scores.length>5) scores=scores.slice(0,5);
  localStorage.setItem('scores',JSON.stringify(scores));
  loadLeaderboard();
}

// Load leaderboard
function loadLeaderboard(){
  let scores=JSON.parse(localStorage.getItem('scores')||'[]');
  scoreList.innerHTML='';
  scores.forEach(s=>{
    const li=document.createElement('li');
    li.textContent=`${s.date} - WPM: ${s.wpm}, Accuracy: ${s.acc}%`;
    scoreList.appendChild(li);
  });
}

// Events
inputEl.addEventListener('input', ()=>{
  startTimer();
  updateStats();
});
restartBtn.addEventListener('click', resetTest);
timeSelect.addEventListener('change', resetTest);

// Init
resetTest();
