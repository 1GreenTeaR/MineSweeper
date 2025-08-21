const icons = {
  flag: `<svg fill="none" version="1.1" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
 <path d="m2.0295 1.6031v12.794h1.7058v-5.1175h3.4117l1.7058 1.7058h5.1175v-7.6763h-5.1175l-1.7058-1.7058z" fill="currentColor" stroke-width=".85292"/>
</svg>`,
  bomb: `<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.293 4.293-1.086 1.086-1.086-1.086a.999.999 0 0 0-1.414 0l-1.249 1.249A8.427 8.427 0 0 0 10.499 5C5.813 5 2 8.813 2 13.5S5.813 22 10.499 22s8.5-3.813 8.5-8.5a8.42 8.42 0 0 0-.431-2.654L19.914 9.5a.999.999 0 0 0 0-1.414l-1.293-1.293 1.09-1.09C19.94 5.474 20.556 5 21 5h1V3h-1c-1.4 0-2.584 1.167-2.707 1.293zM10.499 10c-.935 0-1.813.364-2.475 1.025A3.48 3.48 0 0 0 7 13.5H5c0-1.468.571-2.849 1.609-3.888A5.464 5.464 0 0 1 10.499 8v2z"/></svg>`,
};

const difficulties = {
  EASY: {
    width: 7,
    height: 7,
    bombPercentage: 0.01,
  },
  NORMAL: {
    width: 10,
    height: 10,
    bombPercentage: 0.16,
  },
  HARD: {
    width: 14,
    height: 14,
    bombPercentage: 0.17,
  },
};
const sizes = ["EASY", "NORMAL", "HARD"];
const settings = { selectedSize: 1 };
let currentDifficulty = sizes[settings.selectedSize];

let board;
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
  document.getElementById("header-container").classList.add("game-over");
  let boardElement = document.getElementById("board");

  let overlayElement = document.createElement("div");
  overlayElement.classList.add("overlay");
  boardElement.append(overlayElement);

  let gameOverText = document.createElement("div");
  gameOverText.innerHTML = "GAME OVER";
  gameOverText.classList.add("game-over-text");
  overlayElement.append(gameOverText);

  let resetButton = document.createElement("button");
  resetButton.classList.add("button", "primary");
  resetButton.onclick = start;
  resetButton.innerHTML = "RESET";
  overlayElement.append(resetButton);
}

function victoryScreen() {
  clearInterval(intervalId);
  let modal = document.createElement("div");
  modal.classList.add("modal");
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

  let scoresDiv = document.createElement("div");
  scoresDiv.classList.add("scores-container");

  let victoryHeader = document.createElement("div");
  victoryHeader.classList.add("victory-header");
  victoryHeader.innerHTML = "LEADER BOARD";

  let leaderBoard = document.createElement("div");
  leaderBoard.classList.add("leader-board");

  let scores = JSON.parse(localStorage.getItem("minesweeperScores") || "[]");

  scores.push({
    time: board.timer,
    difficulty: currentDifficulty,
    date: new Date().toISOString(),
  });

  scores.sort((a, b) => a.time - b.time);

  scores = scores.slice(0, 10);

  localStorage.setItem("minesweeperScores", JSON.stringify(scores));

  function formatTime(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}HOUR ${m}MIN ${s}SEC`;
    } else {
      return `${m}MIN ${s}SEC`;
    }
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear() % 100;
    return `${d}.${m}.${y}`;
  }

  scores.forEach((score, ind) => {
    let stat = document.createElement("div");
    stat.classList.add("leader-board-stat");

    let posDiv = document.createElement("div");
    posDiv.style.flex = "0 0 auto";
    posDiv.style.marginRight = "10px";
    posDiv.innerHTML = `${ind + 1}.`;

    let infoDiv = document.createElement("div");
    infoDiv.innerHTML = `${formatTime(score.time)} ${score.difficulty}`;

    let dateDiv = document.createElement("div");
    dateDiv.innerHTML = formatDate(score.date);

    stat.appendChild(posDiv);
    stat.appendChild(infoDiv);
    stat.appendChild(dateDiv);

    leaderBoard.appendChild(stat);
  });

  scoresDiv.appendChild(victoryHeader);
  scoresDiv.appendChild(leaderBoard);

  modal.append(scoresDiv);

  let victoryButton = document.createElement("button");
  victoryButton.classList.add("button", "primary");
  victoryButton.onclick = () => {
    start();
    modal.remove();
  };
  victoryButton.innerHTML = "NEW GAME";
  modal.append(victoryButton);
}

function start() {
  if (intervalId >= 0) {
    clearInterval(intervalId);
  }
  const props = difficulties[sizes[settings.selectedSize]];
  board = createBoard(props.width, props.height, props.bombPercentage);
  document.getElementById("header-container").classList.remove("game-over");
  renderHeader();
  intervalId = setInterval(() => {
    board.timer++;
    renderHeader();
  }, 1000);
}

function changeDifficulty() {
  settings.selectedSize = (settings.selectedSize + 1) % sizes.length;
  start();
  currentDifficulty = sizes[settings.selectedSize];
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
  boardElement.style.fontSize = `${300 / width}px`;
  // boardElement.innerHTML = html;
  return state;
}
start();
console.log(board);
