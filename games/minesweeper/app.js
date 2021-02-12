console.log("Welcome to Voltorb Sweeper");
//  -----------------------------------------------------------
//  click handlers

//  master game click handler, starts the game timer if it isn't already running otherwise will simply run the cellIsClicked function
$("#minefield").mouseup(minefieldClick);

function minefieldClick() {
  storeCellInfo();
  if (timeRemaining == 0) {
    gameStart();
  }
  cellIsClicked();
}

//  new game button click handler
$("#new-game-button").click(newGame);

//  disables context menu when right-clicking on the 'minefield'
$("#minefield").on("contextmenu", function (e) {
  return false;
});

//  -----------------------------------------------------------
//  all global variables

//  cell info template
const cellTemplate = {
  isBomb: false,
  isMarked: false,
  isRevealed: false,
  adjacentBombs: 0,
};

//  initialized grid array
let grid = [];

//  array size variable, used to adjust the size of the grid
let arraySize;

//  number of bombs on the grid
let bombValue;

// stores inforomation about clicked cell, used to generate several 'addresses' used throughout the application
let cellInfo = [];

//  adjacentArray, used to track 'safe neighbors' of a clicked cell
let adjacentArray = [];

//  number of marks left
let marksRemaining = bombValue;

//  tracks how many bombs the user has marked
let bombsMarked = 0;

//  tracks how many cells the user has revealed
let revealedCells = 0;

//  tracks how many games the user has won
let gamesWon = 0;

//  tracks how many games the user has lost
let gamesLost = 0;

//  initialized game clock variableƒ
let gameClock;

//  tracks remaining time
let timeRemaining = 0;

//  html address of timer
let timerElement = $("#time-remaining");

//  -----------------------------------------------------------
//  page initialization

updateGameBoard();
// //  creates the grid array
// createGrid();

// //  calls bomb randomizer function
// bombRandomizer();

// //  calls the board creation function on the 'grid' array
// createBoard(grid);

// //  adjusts initial css of page to match the 'default' bomb density and grid size
// cssAdjuster();

//  -----------------------------------------------------------
//  initial array

//  generates a 2D array to help create a grid
function createGrid() {
  grid = new Array(arraySize);
  for (let i = 0; i < arraySize; i++) {
    grid[i] = new Array(arraySize);
    for (let j = 0; j < arraySize; j++) {
      grid[i][j] = { ...cellTemplate };
    }
  }
}

//  -----------------------------------------------------------
//  difficulty modifier functions

//  sets bombValue variable based on the radio menu value for bomb density
function setBombValue() {
  let bombPercent = +$("input[name='bombDensity']:checked").val() / 100;
  let gridSize = arraySize * arraySize;
  bombValue = gridSize * bombPercent;
  bombRandomizer();
  marksRemaining = bombValue;
  $("#marks-remaining").text(`${marksRemaining}`);
}

//  sets the arraySize variable based on the radio menu value for board size
function setBoardSize() {
  // console.log("initial arraySize value");
  // console.log(arraySize);
  arraySize = +$("input[name='boardSize']:checked").val();
  cssAdjuster();
  createGrid();
}

//  adjusts the css of the <div class="plot"> elements based on the size of the grid being generated
function cssAdjuster() {
  if (arraySize == 10) {
    $(".plot").css("height", "80px");
    $(".plot").css("width", "80px");
    $(".plot").css("background-size", "auto 80px");
  } else if (arraySize == 16) {
    $(".plot").css("height", "50px");
    $(".plot").css("width", "50px");
    $(".plot").css("background-size", "auto 50px");
  } else if (arraySize == 20) {
    $(".plot").css("height", "40px");
    $(".plot").css("width", "40px");
    $(".plot").css("background-size", "auto 40px");
  }
}

//  updates the game board based on the user inputs for radio menus
function updateGameBoard() {
  $("#minefield").html("");
  setBoardSize();
  setBombValue();
  createBoard(grid);
  cssAdjuster();
}
//  -----------------------------------------------------------
//  bomb randomizer

//  randomly asign coordinates for bomb placement
function bombRandomizer() {
  let bombsMade = 0;
  for (let i = 0; i < bombValue; i++) {
    let xGrid = Math.floor(Math.random() * (grid.length - 1));
    let yGrid = Math.floor(Math.random() * (grid.length - 1));
    //  IMPORTANT grid syntax is grid[x][y]
    //  y refers to the index WITHIN a column
    //  x refers to the index WITHIN a row
    if (grid[yGrid][xGrid].isBomb != true) {
      // console.log(`Voltorb added at [${xGrid}][${yGrid}]`);
      grid[yGrid][xGrid].isBomb = true;
      getAdjacentBombs(xGrid, yGrid);
      bombsMade = bombsMade + 1;
    } else {
      //  if generated coordinatees are duplicate, reruns the loop once
      i--;
    }
  }
  console.log(`${bombsMade} Voltorbs generated`);
}

//  get neighbors function, used to generate an array of 8 coordinates surrounding the coordinates used as an input
function getNeighbors(x, y) {
  //  array of relative coordinates that references the 8 cells surrounding a given cell
  let neighborCoordinatesTemplate = [
    [x - 1, y - 1],
    [x - 1, y],
    [x - 1, y + 1],
    [x, y - 1],
    [x, y + 1],
    [x + 1, y - 1],
    [x + 1, y],
    [x + 1, y + 1],
  ];
  let neighborCoordinates = [];
  neighborCoordinatesTemplate.forEach(function (cordPair) {
    //  these conditions will filter out any coordinates that dont exist based on the indices of the two arrays that make up the grid
    if (
      cordPair[0] >= 0 &&
      cordPair[0] < grid.length &&
      cordPair[1] >= 0 &&
      cordPair[1] < grid.length
    ) {
      neighborCoordinates.push(cordPair);
    }
  });
  return neighborCoordinates;
}

//  get adjacent bombs function, counts the number of bombs touching a given cell and populates the .bombsAjacent key in a given object
function getAdjacentBombs(x, y) {
  getNeighbors(x, y).forEach(function (cell) {
    let y = cell[0];
    let x = cell[1];
    if (x >= 0 && x < grid.length && y >= 0 && y < grid.length) {
      let currentCell = grid[x][y];
      currentCell.adjacentBombs++;
    }
  });
}

//  -----------------------------------------------------------
//  initial board creation

//  board creation function, creates the game board after the grid has been generated and bombs have been placed
function createBoard(array) {
  array.forEach(function (column, rowIndex) {
    column.forEach(function (row, colIndex) {
      let newCell = $(
        `<div id='x${rowIndex}-y${colIndex}' class="plot notRevealed"></div>`
      );
      if (row.isBomb === true) {
        newCell.addClass("bomb");
      }
      if (row.adjacentBombs > 0 && row.isBomb != true) {
        newCell.addClass(`number${row.adjacentBombs}`);
      }
      newCell.data({ row: rowIndex, col: colIndex });
      $("#minefield").append(newCell);
    });
  });
}

//  -----------------------------------------------------------
//  master game click function

//  tests and reveals given cells accordingly
function cellIsClicked() {
  clearAdjacentArray();
  if (clickTest() == 1) {
    if (arrayAddress.isMarked == false && arrayAddress.isRevealed == false) {
      if (bombTest(arrayAddress) == true) {
        // clicked cell was a bomb, reveal all bombs, gameOver
        revealAllBombs();
        gameOver();
      }
      if (bombTest(arrayAddress) == false) {
        // clicked cell was NOT a bomb, reveal the cell, test neighbors
        revealCell(elementAddress, arrayAddress);
        if (adjacentBombsTest(arrayAddress) == 0) {
          revealNeighbors(cellInfo);
          revealConsecutiveNeighbors(adjacentArray);
        }
      }
    }
  }
  if (clickTest() == 3) {
    // console.log("right click");
    markCell(elementAddress, arrayAddress);
  }
  isGameWon();
  // console.log(revealedCells);
  // console.log(bombsMarked);
}

//  -----------------------------------------------------------

//  reads and stores information on clicked cell
function storeCellInfo() {
  let x = $(event.target).data("row");
  let y = $(event.target).data("col");
  cellInfo = [x, y];
  // console.log(cellInfo)
  // use cellInfo[0] to refer to x coordinate
  // use cellInfo[1] to refer to y coordinate
  elementAddress = $(`#x${x}-y${y}`);
  // console.log(elementAddress)
  //  use elementAddress to refer to the given div element in HTML
  arrayAddress = grid[x][y];
  // console.log(arrayAddress)
  //  use ArrayAddress to refer to the given object in the grid array
}

//  -----------------------------------------------------------
//  cell testings functions

//  tests for left/right click and returns a value 1 or 3 accordingly
function clickTest() {
  let clickType = event.which;
  if (clickType == 1) {
    // this is a left click
    return 1;
  } else if (clickType == 3) {
    // this is a right click
    return 3;
  }
}

//  tests if current cell is a bomb
function bombTest(cell) {
  if (cell.isBomb == true) {
    // returns true if the cell is a bomb
    return true;
  }
  if (cell.isBomb == false) {
    // returns false if the cell is NOT a bomb
    return false;
  }
}

//  returns the value of adjacentBombs
function adjacentBombsTest(cell) {
  return cell.adjacentBombs;
}

//  -----------------------------------------------------------
//  functions for revealing/marking cells

//  reveal cells function
function revealCell(targetedCell, targetedObject) {
  //  stops user from revealing a 'flagged' cell
  if ($(targetedCell).hasClass("marked") != true) {
    // adds class to adjust style with pre-determined CSS
    $(targetedCell).removeClass("notRevealed");
    // updates object.key value in grid array
    targetedObject.isRevealed = true;
  }
}

//  'flags' a given cell
function markCell(element, cell) {
  // stops user from 'flagging' an already revealed cell
  if (element.hasClass("notRevealed")) {
    // adds class to adjust tyle with pre-determined CSS
    $(element).toggleClass("marked");
    // updates object.key value in grid array
    if (cell.isMarked == true) {
      cell.isMarked = false;
      marksRemaining++;
    } else {
      cell.isMarked = true;
      --marksRemaining;
    }
  }
  $("#marks-remaining").text(`${marksRemaining}`);
}

//  used to test and reveal the neighbors of a given cells when appropriate
function revealNeighbors(coordinateArray) {
  // reads the input to get coordinates
  let xCord = coordinateArray[0];
  let yCord = coordinateArray[1];
  // read the neighbors of the clicked cell
  getNeighbors(xCord, yCord).forEach(function (neighbor) {
    let neighborX = neighbor[0];
    let neighborY = neighbor[1];
    neighborObject = grid[neighborX][neighborY];
    neighborElement = $(`#x${neighborX}-y${neighborY}`);
    if (bombTest(neighborObject) != true) {
      revealCell(neighborElement, neighborObject);
      if (
        neighborObject.adjacentBombs == 0 &&
        isDuplicate(adjacentArray, neighbor) == false
      ) {
        // if (noDuplicates(adjacentArray, neighbor) === false) {
        //   console.log("this is a tag");
        // }
        adjacentArray.push([neighborX, neighborY]);
      }
    }
  });
}

// tests for duplicates in an array, returns true / false
function isDuplicate(array, value) {
  let valueX = value[0];
  let valueY = value[1];
  // console.log("Input X & Y");
  // console.log(valueX, valueY);
  let duplicates = 0;
  array.forEach(function (cordPair) {
    // console.log("Coordinate Pair X & Y");
    let pairX = cordPair[0];
    let pairY = cordPair[1];
    // console.log(pairX, pairY);
    if (valueX === pairX && valueY === pairY) {
      // console.log("it failed");
      duplicates++;
    } else {
      // console.log("it passed!");
    }
  });
  if (duplicates > 0) {
    // if there are duplicates in the array, function returns false
    return true;
  } else {
    // if there are no duplicates in the array, function returns true
    return false;
  }
}

//  runs the revealNeighbors function on all the cells added to the adjacent array
function revealConsecutiveNeighbors(array) {
  indexToCheck = 0;
  indexToStop = array.length;
  while (indexToCheck < indexToStop) {
    // console.log("index to check");
    // console.log(array[indexToCheck]);
    revealNeighbors(array[indexToCheck]);
    indexToStop = array.length;
    indexToCheck++;
  }
}

//  clears adjacent array for next click
function clearAdjacentArray() {
  adjacentArray = [];
}

//  reveals all bombs on the board
function revealAllBombs() {
  $(".bomb").removeClass("marked notRevealed");
}

//  -----------------------------------------------------------
//  game win/loss functions

//  tests if the game has been won based on how many cells are revealed and how many bombs are marked
function isGameWon() {
  revealedCells = 0;
  bombsMarked = 0;
  grid.forEach(function (column, colIndex) {
    column.forEach(function (row, rowIndex) {
      if (grid[rowIndex][colIndex].isRevealed) {
        revealedCells++;
      }
      if (grid[rowIndex][colIndex].isMarked) {
        bombsMarked++;
      }
    });
  });
  if (
    revealedCells === arraySize * arraySize - bombValue &&
    bombsMarked == bombValue
  ) {
    gameWon();
  }
}

// ends the game
function gameOver() {
  console.log("Game Over!");
  if (timeRemaining > 0) {
    timeRemaining = 0;
  }
  gameClock = clearInterval(gameClock);
  gamesLost++;
  $("#win-lose").text("You Lost!");
  $("#final-score").text("");
  updateStats();
  $("#game-over").css("display", "block");
  $("#minefield").off("mouseup");
}

//  wins the game
function gameWon() {
  console.log("Game Won!");
  gameClock = clearInterval(gameClock);
  gamesWon++;
  $("#win-lose").text("You Won!");
  $("#final-score").text(`Score: ${timeRemaining}`);
  updateStats();
  $("#game-over").css("display", "block");
}

//  updates user stats
function updateStats() {
  $("#wins").text(gamesWon);
  $("#losses").text(gamesLost);
}
//  -----------------------------------------------------------
//  game timer functions

//  gsets the game timer and sets the interval at which it will tick
function gameTimer() {
  timeRemaining = 999;
  timerElement.innerText = timeRemaining;
  gameClock = setInterval(countdown, 1000);
}

//  allows the game clock to 'count down' from a given value
function countdown() {
  if (timeRemaining === 0) {
    timerElement.text(0);
    gameOver();
  } else {
    timeRemaining = timeRemaining - 1;
    timerElement.text(timeRemaining);
  }
}

//  -----------------------------------------------------------
//  game start functions

//  starts the game
function gameStart() {
  console.log("Game Start!");
  gameTimer();
}

//  creates a new game
function newGame() {
  if (timeRemaining > 0) {
    gameOver();
  }
  timerElement.text(999);
  updateStats();
  updateGameBoard();
  $("#game-over").css("display", "none");
  $("#minefield").on("mouseup", minefieldClick);
}

//  -----------------------------------------------------------
