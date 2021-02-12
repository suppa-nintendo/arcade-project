let gameState = {
  grid: [
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
    {
      isUp: false,
      isBonus: false,
      isCivilian: false,
    },
  ],
  points: 0,
  highScore: 0,
  averageScore: 0,
  accuracy: 0,
  difficulty: "Easy",
};
//  -----------------------------------------------------------
//  game board

//  alows functions to read the grid from gamestate
let grid = gameState.grid;

//  stores the user's most recent click, used in scoring functions
let clicked;

//  game-board click handler
$("#game-board").click(function () {
  let hill = grid[$(event.target).attr("id")];
  if (hill.isUp == true) {
    hill.isUp = false;
    clicked = "mole";
  } else if (hill.isBonus == true) {
    hill.isBonus = false;
    clicked = "bonus";
  } else if (hill.isCivilian == true) {
    hill.isCivilian = false;
    clicked = "civilian";
  } else {
    clicked = "empty";
  }
  populateMoles();
  scoreTally(clicked);
});

//  puts moles on the board
function populateMoles() {
  grid.forEach(function (mole, index) {
    $(`div #${index}`).removeClass("bonus civilian mole empty");
    if (mole.isUp == true) {
      $(`div #${index}`).addClass("mole");
    } else if (mole.isBonus == true) {
      $(`div #${index}`).addClass("bonus");
    } else if (mole.isCivilian == true) {
      $(`div #${index}`).addClass("civilian");
    } else {
      $(`div #${index}`).addClass("empty");
    }
  });
}

populateMoles();

//  easy mode mole randomizer
function easyModeMoles() {
  clearMoles();
  let randomIndex = Math.floor(Math.random() * grid.length);
  grid[randomIndex].isUp = true;
  populateMoles();
}

//  hard mode mole randomizer
function hardModeMoles() {
  clearMoles();
  let randomIndex = Math.floor(Math.random() * grid.length);

  let chance = Math.random();
  if (chance < 0.5) {
    grid[randomIndex].isMole = true;
  } else if (chance >= 0.5 && chance < 0.75) {
    grid[randomIndex].isBonus = true;
  } else if (chance >= 0.75) {
    grid[randomIndex].isCivilian = true;
  }

  let randomIndexTwo = Math.floor(Math.random() * grid.length);

  let chanceTwo = Math.random();
  if (chanceTwo < 0.5) {
    grid[randomIndexTwo].isUp = true;
  } else if (chanceTwo >= 0.5 && chance < 0.75) {
    grid[randomIndexTwo].isBonus = true;
  } else if (chanceTwo >= 0.75) {
    grid[randomIndexTwo].isCivilian = true;
  }

  populateMoles();
}

//  clears moles from the board
function clearMoles() {
  grid.forEach(function (mole) {
    mole.isUp === true ? (mole.isUp = false) : null;
    mole.isBonus === true ? (mole.isBonus = false) : null;
    mole.isCivilian === true ? (mole.isCivilian = false) : null;
  });
  populateMoles();
}

//  -----------------------------------------------------------
//  all scoring functions

// accuracy function and variables
let goodClicks = 0;
let totalClicks = 0;
function accuracyCalc() {
  if (timeRemaining > 0) {
    if (Math.round((goodClicks / totalClicks) * 100) == false) {
      gameState.accuracy = 0;
    } else {
      gameState.accuracy = Math.round((goodClicks / totalClicks) * 100);
      console.log(gameState.accuracy);
    }
  }
}

//  scoring function
function scoreTally() {
  if (clicked == "mole") {
    console.log("mole hit +1");
    gameState.points = gameState.points + 1;
    goodClicks = goodClicks + 1;
  } else if (clicked == "bonus") {
    console.log("bonus hit +3");
    gameState.points = gameState.points + 3;
    goodClicks = goodClicks + 1;
  } else if (clicked == "civilian") {
    console.log("civilian hit -3");
    gameState.points = gameState.points - 3;
  }
  totalClicks = totalClicks + 1;
  accuracyCalc();
  populateScores();
}

// average score function and variables
let scoreArray = [];
function averageScore() {
  scoreArray.push(gameState.points);
  let totalScore = scoreArray.reduce(function (total, num) {
    return total + num;
  });
  gameState.averageScore = Math.round(totalScore / scoreArray.length);
  console.log(gameState.averageScore);
}

//  high score function
function hiScore() {
  gameState.highScore < gameState.points
    ? (gameState.highScore = gameState.points)
    : null;
}

function populateScores() {
  $("#average-score").text(`Avg-Score: ${gameState.averageScore}`);
  $("#high-score").text(`Hi-Score: ${gameState.highScore}`);
  $("#current-score").text(`Score: ${gameState.points}`);
  $("#accuracy").text(`Accuracy: ${gameState.accuracy}%`);
}

//  -----------------------------------------------------------
//  game timer functions

//  game timer variables
let timeRemaining;
let timerElement = document.getElementById("timer");

// interval variables
let gameClock;
let moleTick;

//  countdown function
function countdown() {
  if (timeRemaining === 0) {
    timerElement.innerText = "0";
    gameOver();
  } else {
    timeRemaining = timeRemaining - 1;
    timerElement.innerText = timeRemaining;
  }
  console.log(timeRemaining);
}

//  game timer function
function gameTimer() {
  timeRemaining = 30;
  timerElement.innerText = timeRemaining;
  gameClock = setInterval(countdown, 1000);
}

//  -----------------------------------------------------------
//  game control functions

//  variable used to assign difficulty mode of
let gameMode;

//  game start
function gameStart() {
  console.log("game start");
  setGameMode();
  newGame();
  gameTimer();
  if (gameMode === "easy") {
    console.log("easy mode");
    moleTick = setInterval(easyModeMoles, 1200);
  } else if (gameMode === "hard") {
    console.log("hard mode");
    moleTick = setInterval(hardModeMoles, 1000);
  }
}

//  clears points and accuracy functions for a new game
function newGame() {
  gameState.points = 0;
  populateScores();
  $("#game-over").css("display", "none");
}

//  game over
function gameOver() {
  console.log("game over");
  clearMoles();
  averageScore();
  hiScore();
  populateScores();
  gameClock = clearInterval(gameClock);
  moleTick = clearInterval(moleTick);
  stats();
}

//  game over stats
function stats() {
  $("#end-score").text(`Score: ${gameState.points}`);
  $("#end-high-score").text(`Hi-Score: ${gameState.highScore}`);
  $("#end-average-score").text(`Avg-Score: ${gameState.averageScore}`);
  $("#end-accuracy").text(`Accuracy: ${gameState.accuracy}%`);
  $("#game-over").css("display", "block");
}

//  reset
function resetScores() {
  console.log("scores reset");
  goodClicks = 0;
  totalClicks = 0;
  gameState.points = 0;
  gameState.hiScore = 0;
  gameState.averageScore = 0;
  gameState.accuracy = 0;
  totalScore = [];
  populateScores();
  gameOver();
  newGame();
}

//  control button click handlers
$("#start-button").click(gameStart);
$("#reset-button").click(resetScores);

//  -----------------------------------------------------------
//  easy/hard mode control handlers and functions

function setGameMode() {
  gameMode = $("input[name='gameMode']:checked").val();
  console.log(gameMode);
}
