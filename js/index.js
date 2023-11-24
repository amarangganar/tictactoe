const boardEl = document.getElementById("board");
const boardSizeInputEl = document.getElementById("board-size");
const boardSizeText = document.getElementById("board-size-text");
const restartEl = document.getElementById("restart");

let boardSize = +boardSizeInputEl.value; // set default board size
let board = [];
let lastMove = ""; // keep track on players last move

const PLAYER_LOOKUP = {
  X: "Player 1",
  O: "Player 2",
};

function toggleActivePlayer(move, isWinner = false) {
  const playerOne = document.getElementById("player-one");
  const playerTwo = document.getElementById("player-two");

  // remove all active classes
  playerOne.classList.remove(...["active", "winner"]);
  playerTwo.classList.remove(...["active", "winner"]);

  if (isWinner) {
    playerOne.classList.toggle("winner", move === "X");
    playerTwo.classList.toggle("winner", move === "O");
  } else {
    document
      .getElementById("player-one")
      .classList.toggle("active", move === "O" || move === "");
    document
      .getElementById("player-two")
      .classList.toggle("active", move === "X");
  }
}

function checkHorizontal(move) {
  const winningRowIdx = board.findIndex((row) =>
    row.every((content) => content.textContent === move)
  );

  if (winningRowIdx !== -1) {
    board[winningRowIdx].forEach((col) => {
      col.style.color = "hsl(177 70% 41% / 1)";
    });

    return true;
  }

  return false;
}

function checkVertical(move) {
  // flip the 'cols' to 'rows' first
  const flipBoard = board.map((_row, rowIdx) =>
    board.map((newRow) => newRow[rowIdx])
  );

  const winningColIdx = flipBoard.findIndex((row) =>
    row.every((content) => content.textContent === move)
  );

  if (winningColIdx !== -1) {
    for (let i = 0; i < board.length; i++) {
      board[i][winningColIdx].style.color = "hsl(177 70% 41% / 1)";
    }

    return true;
  }

  return false;
}

function checkDiagonal(move) {
  const leftDiagonal = {};
  const rightDiagonal = {};

  // get left diagonal cells
  // cells where row === col
  // e.g. (0,0) (1,1) (2,2) for 3x3 board
  for (let i = 0; i < board.length; i++) {
    leftDiagonal[[i, i]] = board[i][i].textContent;
  }

  // get right diagonal cells
  // cells where row + col === boardSize - 1
  // e.g (0, 2) (1, 1) (2, 0) for 3 x 3 board
  for (let i = 0; i < board.length; i++) {
    let j = board.length - (i + 1);
    rightDiagonal[[i, j]] = board[i][j].textContent;
  }

  const isLeftDiagonalWinning = Object.values(leftDiagonal).every(
    (cell) => cell === move
  );
  const isRightDiagonalWinning = Object.values(rightDiagonal).every(
    (cell) => cell === move
  );

  // check if left diagonal win
  if (isLeftDiagonalWinning) {
    Object.keys(leftDiagonal).forEach((coor) => {
      const [row, col] = coor.split(",");
      board[row][col].style.color = "hsl(177 70% 41% / 1)";
    });

    return true;
  }

  // check if right diagonal win
  if (isRightDiagonalWinning) {
    Object.keys(rightDiagonal).forEach((coor) => {
      const [row, col] = coor.split(",");
      board[row][col].style.color = "hsl(177 70% 41% / 1)";
    });

    return true;
  }

  return false;
}

function checkDraw() {
  return board.flat().every((cell) => cell.textContent !== "");
}

function checkWinner(move) {
  const hasWon =
    checkHorizontal(move) || checkVertical(move) || checkDiagonal(move);

  if (hasWon) {
    // disabled remaining cell;
    boardEl.childNodes.forEach((child) => {
      if (child.textContent === "") {
        child.disabled = true;
        child.style.cursor = "default";
      }
    });
  }

  return hasWon;
}

function handleCellClick(event) {
  const move = lastMove === "X" ? "O" : "X";

  // save move to board array
  const row = +event.target.dataset.row;
  const col = +event.target.dataset.col;

  board[row][col].textContent = move;
  lastMove = move;

  // disabled button
  event.target.disabled = true;
  event.target.style.cursor = "default";

  toggleActivePlayer(move);

  if (checkWinner(move)) {
    toggleActivePlayer(move, checkWinner(move));

    setTimeout(() => {
      window.alert(`${PLAYER_LOOKUP[move]} won!`);
    }, 100);
  } else if (checkDraw()) {
    setTimeout(() => {
      window.alert("The game ends with a draw!");
    }, 100);
  }
}

function generateCell(row, col) {
  const button = document.createElement("button");
  button.dataset.row = row;
  button.dataset.col = col;

  button.addEventListener("click", handleCellClick);

  return button;
}

function generateBoard(size) {
  // reset board element
  boardEl.replaceChildren();

  // set board
  board = [...Array(size)].map((_, rowIdx) =>
    [...Array(size)].map((_, colIdx) => generateCell(rowIdx, colIdx))
  );

  // display board size
  boardSizeText.textContent = boardSize;

  // set font to small on larger board
  if(boardSize > 15) {
    boardEl.style.fontSize = 'small'
  }

  // set first player indicator active
  lastMove = "";
  toggleActivePlayer("", false);

  // render board
  const children = board.flat();
  boardEl.style.gridTemplateColumns = `repeat(${size}, minMax(0, 1fr))`;
  boardEl.append(...children);
}

// add event listener onchange on board size select element
boardSizeInputEl.addEventListener("change", (event) => {
  size = +event.target.value;
  if(Number.isNaN(size) || size < 1) {
    window.alert('Board size should be greater than 0 and a number.');
    return;
  }

  boardSize = size;
  generateBoard(size);
});

// add event listener onclick on restart button
restartEl.addEventListener("click", () => {
  generateBoard(boardSize);
});

generateBoard(boardSize);
