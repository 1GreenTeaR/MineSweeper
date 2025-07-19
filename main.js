let board;
// const difficulties = { EASY: { size: { width: 7, height: 7 }, bombPercentage: 0.1 }, }
// let settings = { size: { width: 15, height: 15 }, difficulty: }
let intervalId;
document
  .getElementById("board")
  .addEventListener(`contextmenu`, (e) => e.preventDefault());
function gameOver() {
  clearInterval(intervalId);
  board.isGameOver = true;
  for (let i = 0; i < board.board.length; i++) {
    if (board.board[i].isBomb) {
      let element = document.getElementById(i);
      element.classList.add("opened");
      element.classList.add("bomb");
      element.classList.remove("flag");
    }
  }
  document.getElementById("header").classList.add("game-over");
  let boardElement = document.getElementById("board");

  let overlayElement = document.createElement("div");
  overlayElement.classList.add("overlay");
  boardElement.append(overlayElement);

  let gameOverText = document.createElement("div");
  gameOverText.innerHTML = "Game Over";
  gameOverText.classList.add("game-over-text");
  overlayElement.append(gameOverText);

  let resetButton = document.createElement("button");
  resetButton.classList.add("button", "primary");
  resetButton.onclick = start;
  resetButton.innerHTML = "Reset";
  overlayElement.append(resetButton);
}
function start() {
  if (intervalId >= 0) {
    clearInterval(intervalId);
  }
  board = createBoard(7, 7, 0.1);
  document.getElementById("header").classList.remove("game-over");
  renderHeader();
  intervalId = setInterval(() => {
    board.timer++;
    renderHeader();
  }, 1000);
}

function userAction(index, e) {
  // console.log(e)
  if (board.isGameOver) {
    return;
  }
  if (e.which === 1) {
    if (board.board[index].isFlagged) {
      return;
    }
    if (board.board[index].isBomb) {
      const element = document.getElementById(index);
      element.classList.add("boom");
      gameOver();
    } else {
      if (board.board[index].isOpened === true) {
        let neighbouringCells = getNeighbouringCellsIndexes(index);

        let amounts = neighbouringCells.reduce(
          (a, c) => {
            if (board.board[c].isFlagged) a.flags = a.flags + 1;
            if (board.board[c].isBomb) a.bombs = a.bombs + 1;
            return a;
          },
          { bombs: 0, flags: 0 }
        );
        if (amounts.bombs == amounts.flags) {
          neighbouringCells.forEach((index) => {
            if (!board.board[index].isFlagged) {
              openSquare(index);
            }
          });
        } else {
          neighbouringCells.forEach((index) => {
            if (!board.board[index].isOpened) {
              const element = document.getElementById(index);
              element.classList.add("highlight");
              setTimeout(() => {
                element.classList.remove("highlight");
              }, 1000);
            }
          });
        }
        console.log(neighbouringCells, amounts);
        return;
      }
      openSquare(index);
    }
  } else if (e.which === 3 && !board.board[index].isOpened) {
    placeFlag(index);
  }
}
function victoryScreen() {
  let modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.right = 0;
  modal.style.bottom = 0;
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  document.body.appendChild(modal);
}
function placeFlag(index) {
  board.board[index].isFlagged = !board.board[index].isFlagged;
  if (board.board[index].isFlagged) {
    document.getElementById(index).classList.add("flag");
    board.amountOfFlags++;
  } else {
    document.getElementById(index).classList.remove("flag");
    board.amountOfFlags--;
  }
  renderHeader();
}

function getNeighbouringCellsIndexes(index) {
  let indexesArr = [];

  let y = Math.floor(index / board.width);
  let x = index % board.width;

  for (let iy = y - 1; iy <= y + 1; iy++) {
    if (iy < 0 || iy >= board.width) {
      continue;
    }
    for (let ix = x - 1; ix <= x + 1; ix++) {
      if (ix < 0 || ix >= board.height) {
        continue;
      }
      let currentIndex = ix + iy * board.width;
      indexesArr.push(currentIndex);
    }
  }

  return indexesArr;
}

function openSquare(index) {
  if (board.board[index].isOpened === true) {
    return;
  }

  let element = document.getElementById(index);
  element.classList.add("opened");

  // if (board.board[index].isBomb) {
  //   element.classList.add("red-color");
  // }

  // if (board.board[index].isBomb) {
  //   gameOver();
  // }

  board.board[index].isOpened = true;
  if (board.board[index].isFlagged) {
    placeFlag(index);
  }

  let neighbourIndexes = getNeighbouringCellsIndexes(index);

  let amountOfBombs = neighbourIndexes.reduce((a, c) => {
    if (board.board[c].isBomb) a = a + 1;
    return a;
  }, 0);

  element.innerHTML = amountOfBombs;
  let amountOfOpened = 0;
  for (let i = 0; i < board.board.length; i++) {
    if (board.board[i].isOpened || board.board[i].isBomb) {
      amountOfOpened = amountOfOpened + 1;
    }
  }
  if (amountOfOpened >= board.board.length) {
    setTimeout(() => {
      victoryScreen();
    }, 300);
  }
  console.log(amountOfOpened);
  if (amountOfBombs === 0) {
    neighbourIndexes.forEach((index) => {
      openSquare(index);
    });
  }
}
function renderHeader() {
  document.getElementById("amount-of-bombs").innerHTML =
    board.amountOfBombs - board.amountOfFlags;
  let minutes = Math.floor(board.timer / 60);
  let seconds = String(board.timer % 60);
  if (seconds.length < 2) {
    seconds = "0" + seconds;
  }
  document.getElementById("timer").innerHTML = `${minutes}:${seconds}`;
}

function createBoard(width, height, bombPercentage) {
  let state = { width: width, height: height, amountOfFlags: 0, timer: 0 };
  let boardGridArr = new Array(width * height)
    .fill()
    .map(() => ({ isOpened: false, isBomb: false, isFlagged: false }));
  let bombsToAdd = Math.round(width * height * Math.min(bombPercentage, 1));
  state.amountOfBombs = bombsToAdd;
  state.board = boardGridArr;
  while (bombsToAdd > 0) {
    let randomIndex = Math.floor(Math.random() * boardGridArr.length);
    if (boardGridArr[randomIndex].isBomb === false) {
      boardGridArr[randomIndex].isBomb = true;
      bombsToAdd--;
    }
  }
  let elements = [];
  let boardElement = document.getElementById("board");
  for (let i = 0; i < width * height; i++) {
    let classes = ["box"];
    // if (boardGridArr[i].isBomb) {
    //   classes.push("red-color");
    // }
    // html = html + `<div class="${classes}" onclick="userAction(${i})" id="${i}"></div>`;
    let newElement = document.createElement("div");
    newElement.classList.add(...classes);
    newElement.id = i;
    newElement.addEventListener("mousedown", (e) => {
      userAction(i, e);
    });
    elements.push(newElement);
  }
  boardElement.innerHTML = "";
  boardElement.append(...elements);
  boardElement.style.gridTemplateColumns = `repeat(${width}, 40px)`;
  // boardElement.innerHTML = html;
  return state;
}
start();
console.log(board);
