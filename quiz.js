
var $$ = document.getElementById.bind(document);
var activeStanza = null;
var readyToMoveOn = false;

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

function checkGuess() {
  var guess = $$('guess').value;
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
}

function start() {
}

function moveOn() {
  $$('card').style.display = 'block';
  $$('intro').style.display = 'none';
  shuffle(dictionary);
  fillCard(dictionary[0]);
}

function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(start);

