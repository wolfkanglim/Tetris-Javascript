const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("score");
const btn = document.getElementById("btn");

const row = 20
const col = (column = 12);
const sq = (squareSize = 24);
const vacant = "white";
let score = 0;

//draw board
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * sq, y * sq, sq, sq);

  ctx.strokeStyle = "#aaa";
  ctx.strokeRect(x * sq, y * sq, sq, sq);
}

let board = [];
for (r = 0; r < row; r++) {
  board[r] = [];
  for (c = 0; c < col; c++) {
    board[r][c] = vacant;
  }
}

const bgm = document.getElementById('bgm');
bgm.volume = 0.1;

const collapseSound = document.getElementById('collapse');
 
  const turnSound = document.getElementById('turn');
  const lockSound = document.getElementById("lock");
  const gameoverSound = document.getElementById('gameEnd');
  
function drawBoard() {
  for (r = 0; r < row; r++) {
    for (c = 0; c < col; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}
drawBoard();

//draw tetrimino
const pieces = [
  [Z, "purple"],
  [S, "maroon"],
  [I, "green"],
  [J, "blue"],
  [L, "red"],
  [O, "orange"],
  [T, "violet"],
];

class Piece {
  constructor(tetrimino, color) {
    this.tetrimino = tetrimino;
    this.color = color;

    this.tetriminoN = 0;
    this.activeTetrimino = this.tetrimino[this.tetriminoN];

    this.x = 3;
    this.y = -3;
  }

  draw() {
    for (r = 0; r < this.activeTetrimino.length; r++) {
      for (c = 0; c < this.activeTetrimino.length; c++) {
        if (this.activeTetrimino[r][c]) {
          drawSquare(this.x + c, this.y + r, this.color);
        }
      }
    }
  }

  unDraw() {
    for (r = 0; r < this.activeTetrimino.length; r++) {
      for (c = 0; c < this.activeTetrimino.length; c++) {
        if (this.activeTetrimino[r][c]) {
          drawSquare(this.x + c, this.y + r, vacant);
        }
      }
    }
  }

  moveDown() {
    if (!this.collision(0, 1, this.activeTetrimino)) {
      this.unDraw();
      this.y++;
      this.draw();
    } else {
      this.lock();
      p = randomPiece();
      lockSound.play();
      lockSound.volume = 0.5;
      //generate random piece and lock pieces
    }
  }

  moveRight() {
    if (!this.collision(1, 0, this.activeTetrimino)) {
      this.unDraw();
      this.x++;
      this.draw();
    }
  }
  moveLeft() {
    if (!this.collision(-1, 0, this.activeTetrimino)) {
      this.unDraw();
      this.x--;
      this.draw();
    }
  }
  rotate() {   
    let nextPattern = this.tetrimino[
      (this.tetriminoN + 1) % this.tetrimino.length
    ];
    if (!this.collision(0, 0, nextPattern)) {
      this.unDraw();
      this.tetriminoN = (this.tetriminoN + 1) % this.tetrimino.length;
      this.activeTetrimino = this.tetrimino[this.tetriminoN];
      this.draw();
    }
  }

  lock() {
    for (r = 0; r < this.activeTetrimino.length; r++) {
      for (c = 0; c < this.activeTetrimino.length; c++) {
        if (!this.activeTetrimino[r][c]) {
          continue;
        }
        if (this.y + r < 0) {
          gameoverSound.play();
          gameoverSound.volume = 0.1;
          gameOver = true;
          bgm.pause();
          break;
        }
        board[this.y + r][this.x + c] = this.color;
        lockSound.play();
      lockSound.volume = 1;
      }
    }

    //remove full row and score
    for (r = 0; r < row; r++) {
      let isRowFull = true;
      for (c = 0; c < col; c++) {
        isRowFull = isRowFull && board[r][c] != vacant;
      }
      if (isRowFull) {
        for (let y = r; y > 1; y--) {
          for (c = 0; c < col; c++) {
            board[y][c] = board[y - 1][c];
          }
        }
        for (c = 0; c < col; c++) {
          board[0][c] = vacant;
        }
        score += 10;
        collapseSound.play();
        collapse.volume = 0.1;
        collapse.currentTime = 0;
      }
    }
    drawBoard();
    scoreBoard.innerHTML = score;
  }

  collision(x, y, piece) {
    for (r = 0; r < piece.length; r++) {
      for (c = 0; c < piece.length; c++) {
        if (!piece[r][c]) {
          continue;
        }
        let nextX = this.x + c + x;
        let nextY = this.y + r + y;
        if (nextX < 0 || nextX >= col || nextY >= row) {
          return true;
        }
        if (nextY < 0) {
          continue;
        }
        if (board[nextY][nextX] != vacant) {
          return true;
        }
      }
    }
    return false;
  }
}

function randomPiece() {
  let r = (randomNumber = Math.floor(Math.random() * pieces.length));
  let s = (randomNumber = Math.floor(Math.random() * pieces.length));
  return new Piece(pieces[r][0], pieces[s][1]);
}
let p = randomPiece();

//control pieces
document.addEventListener("keydown", control);
function control(event) {
 
  if (event.keyCode == 37) {
   
    p.moveLeft();
  } else if (event.keyCode == 39) {
    p.moveRight();
    
  } else if (event.keyCode == 40) {
    p.moveDown();
    
  } else if (event.keyCode == 38) {
    p.rotate();
    turnSound.play();
    turnSound.volume = 0.05;
    turnSound.currentTime = 0;
  }
}

let gameOver = false;
let timeStart = Date.now();

function drop() {
  bgm.play();
  bgm.volume = 0.02;
  let timeNow = Date.now();
  let delta = timeNow - timeStart;
  if (delta > 1000) {
    p.moveDown();
    timeStart = Date.now();
  }
  if (!gameOver) {
    requestAnimationFrame(drop);
  }
}

drop();
