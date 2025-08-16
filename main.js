const icons = {
  flag: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.75 1C6.16421 1 6.5 1.33579 6.5 1.75V3.6L8.22067 3.25587C9.8712 2.92576 11.5821 3.08284 13.1449 3.70797L13.5582 3.87329C14.9831 4.44323 16.5513 4.54967 18.0401 4.17746C18.6711 4.01972 19.1778 4.7036 18.8432 5.26132L17.5647 7.39221C17.2232 7.96137 17.0524 8.24595 17.0119 8.55549C16.9951 8.68461 16.9951 8.81539 17.0119 8.94451C17.0524 9.25405 17.2232 9.53863 17.5647 10.1078L19.1253 12.7089C19.4361 13.2269 19.1582 13.898 18.5721 14.0445L18.472 14.0695C16.7024 14.5119 14.8385 14.3854 13.1449 13.708C11.5821 13.0828 9.8712 12.9258 8.22067 13.2559L6.5 13.6V21.75C6.5 22.1642 6.16421 22.5 5.75 22.5C5.33579 22.5 5 22.1642 5 21.75V1.75C5 1.33579 5.33579 1 5.75 1Z" fill="currentColor"/>
</svg>`,
  bomb: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17 14.5C17 18.6421 13.6421 22 9.5 22C5.35786 22 2 18.6421 2 14.5C2 10.3579 5.35786 7 9.5 7C13.6421 7 17 10.3579 17 14.5Z" fill="currentColor"/>
<path d="M17.9811 2.35316C18.1668 1.88228 18.8332 1.88228 19.0189 2.35316L19.6733 4.01242C19.73 4.15618 19.8438 4.26998 19.9876 4.32668L21.6468 4.98108C22.1177 5.16679 22.1177 5.83321 21.6468 6.01892L19.9876 6.67332C19.8438 6.73002 19.73 6.84382 19.6733 6.98758L19.0189 8.64684C18.8332 9.11772 18.1668 9.11772 17.9811 8.64684L17.3267 6.98758C17.27 6.84382 17.1562 6.73002 17.0124 6.67332L15.3532 6.01892C14.8823 5.83321 14.8823 5.16679 15.3532 4.98108L17.0124 4.32668C17.1562 4.26998 17.27 4.15618 17.3267 4.01242L17.9811 2.35316Z" fill="currentColor"/>
<path d="M16.0175 9.04328L16.7669 8.29386L16.4669 7.53312L15.7063 7.23315L14.9568 7.98261C15.3407 8.30436 15.6957 8.6594 16.0175 9.04328Z" fill="currentColor"/>
</svg>`,
};

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
      placeBomb(i);
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
      let hasOpened = false;
      for (let i = 0; i < board.board.length; i++) {
        if (board.board[i].isOpened) {
          hasOpened = true;
          break;
        }
      }

      if (hasOpened) {
        const element = document.getElementById(index);
        element.classList.add("boom");
        gameOver();
      } else {
        let notAbomb = 0;
        for (let i = 0; i < board.board.length; i++) {
          if (!board.board[i].isBomb) {
            notAbomb++;
          }
        }
        let placeAbomb = Math.floor(Math.random() * notAbomb);
        for (let i = 0; i < board.board.length; i++) {
          if (board.board[i].isBomb) continue;
          if (placeAbomb === 0) board.board[i].isBomb = true;
          placeAbomb--;
        }
        board.board[index].isBomb = false;
        userAction(index, e);
      }
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
        if (amounts.bombs <= amounts.flags) {
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
      } else openSquare(index);
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
  const element = document.getElementById(index);
  if (board.board[index].isFlagged) {
    element.classList.add("flag");
    element.innerHTML = icons.flag;
    board.amountOfFlags++;
  } else {
    element.classList.remove("flag");
    element.innerHTML = "";
    board.amountOfFlags--;
  }
  renderHeader();
}

function placeBomb(index) {
  const element = document.getElementById(index);
  element.classList.add("bomb");
  element.classList.add("opened");
  element.classList.remove("flag");
  element.innerHTML = icons.bomb;
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

  if (board.board[index].isBomb) {
    element.classList.add("red-color");
    gameOver();
    return;
  }

  board.board[index].isOpened = true;
  if (board.board[index].isFlagged) {
    placeFlag(index);
  }

  let neighbourIndexes = getNeighbouringCellsIndexes(index);

  let amountOfBombs = neighbourIndexes.reduce((a, c) => {
    if (board.board[c].isBomb) a = a + 1;
    return a;
  }, 0);

  element.innerHTML = amountOfBombs ? amountOfBombs : "";
  element.classList.add(`number-${amountOfBombs}`);
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
  boardElement.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${width}, 1fr)`;
  boardElement.style.fontSize = `${200 / width}px`;
  // boardElement.innerHTML = html;
  return state;
}
start();
console.log(board);
