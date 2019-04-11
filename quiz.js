var $$ = document.getElementById.bind(document);
var activeStanza = null;
var activeIndex = null;
var readyToMoveOn = false;
var order = [];
var at = 0;
var missed = [];
var wantMissed = false;

function populateStorage() {
  activeIndex = null;
  order = [];
  at = 0;
  missed = [];
  for (var i=0; i<dictionary.length; i++) {
    order.push(i);
  }
  shuffle(order);
  localStorage.setItem('order', JSON.stringify(order));
  saveToStorage();
  localStorage.setItem('quiz2', 'ready');
}

function loadFromStorage() {
  order = JSON.parse(localStorage.getItem('order'));
  at = JSON.parse(localStorage.getItem('at'));
  missed = JSON.parse(localStorage.getItem('missed'));
}

function saveToStorage() {
  localStorage.setItem('at', JSON.stringify(at));
  localStorage.setItem('missed', JSON.stringify(missed));
}

if(!localStorage.getItem('quiz2')) {
  populateStorage();
} else {
  loadFromStorage();
}

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function playAudio() {
  $$('audio_sample').play();
  $$('guess').focus();
}

function addToMissed() {
  if (activeIndex !== null) {
    if (missed.length === 0 || missed[missed.length - 1] !== activeIndex) {
      missed.push(activeIndex);
      saveToStorage();
    }
  }
  activeIndex = null;
}

function checkGuess() {
  var guess = $$('guess').value;
  console.log("GUESS IS", guess);
  if (!guess) {
    playAudio();
    return;
  }
  console.log(guess, activeStanza);
  if (guess.toLowerCase() === activeStanza.word.toLowerCase()) {
    if (readyToMoveOn) {
      moveOn();
      return;
    }
    console.log("RIGHT!");
    $$('guess').classList.add('correct');
    $$('everything').classList.add('correct');
    $$('answer').innerHTML = "woohoo!";
    $$('diff').innerHTML = "you got it!";
    readyToMoveOn = true;
    activeIndex = null;
  } else {
    console.log("NOPE...");
    $$('answer').innerHTML = activeStanza.word;
    $$('guess').classList.remove('correct');
    $$('everything').classList.remove('correct');
    var dmp = new diff_match_patch();
    var d = dmp.diff_main(guess, activeStanza.word);
    var ds = dmp.diff_prettyHtml(d);
    $$('diff').innerHTML = ds;
    $$('guess').focus();
    addToMissed();
  }
}

function censor(txt, word) {
  var pattern = new RegExp(word, 'ig');  // hopefully word has no funny letters...
  return txt.replace(pattern, '<b>*****</b>');
}

function fillCard(stanza) {
  activeStanza = stanza;
  readyToMoveOn = false;
  $$('guess').value = "";
  $$('guess').classList.remove('correct');
  $$('everything').classList.remove('correct');
  $$('answer').innerHTML = "";
  $$('diff').innerHTML = "";
  $$('desc').innerHTML = censor(stanza.desc, stanza.word);
  $$('pos').innerHTML = stanza.pos;
  $$('audio_src').src = stanza.audio;
  $$('guess').focus();
  $$('audio_sample').load();
  $$('audio_sample').play().catch(function(e) {
    console.log("Play:", e);
  });
  saveToStorage();
}

function start() {
}

function moveOn() {
  addToMissed();
  console.log(order);
  $$('card').style.display = 'block';
  $$('intro').style.display = 'none';
  var idx = null;
  if (wantMissed) {
    if (missed.length === 0) {
      alert("No missed words to do");
      return;
    }
    idx = missed.shift();
  } else {
    at += 1;
    if (at >= order.length) {
      alert("You did all the words!!!");
      return;
    }
    idx = order[at];
  }
  activeIndex = idx;
  fillCard(dictionary[activeIndex]);
}

function doMissed(cb) {
  activeIndex = null;
  wantMissed = cb.checked;
  moveOn();
}

function reshuffle() {
  populateStorage();
  moveOn();
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(start);

