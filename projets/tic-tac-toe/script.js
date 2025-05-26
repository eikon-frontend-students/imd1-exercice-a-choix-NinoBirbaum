// shiny edges
const grid = document.querySelector(".xo");
document.addEventListener("mousemove", (e) => {
  grid.style.setProperty("--x", e.x + "px");
  grid.style.setProperty("--y", e.y + "px");
});

// tic-tac-toe

class LimitedArray {
  constructor(maxLength) {
    this.maxLength = maxLength;
    this.items = [];
  }

  add(content, row, column) {
    if (this.items.length >= this.maxLength) {
      const removedItem = this.items.shift();
      this.disappear(removedItem.row, removedItem.column);
    }

    // Add item
    this.items.push({ content, row, column });
  }

  getItems() {
    return this.items;
  }
  size() {
    return this.items.length;
  }
  reset() {
    this.items = [];
  }

  disappear(row, column) {
    const el = document.querySelector(
      `table tr:nth-child(${row}) td:nth-child(${column})`
    );
    const content = el.querySelector(":is(b,i)");
    if (!content) return;
    content.classList.add("marked");
    setTimeout(() => {
      content.addEventListener(
        "transitionend",
        () => {
          el.innerHTML = "&nbsp;";
        },
        { once: true }
      );
    }, 0);
  }
}

const moves = new LimitedArray(7);
const table = document.querySelector("table.xo");

function checkWinner() {
  // Simple win check for three in a row for b (X) or i (O)
  const winLines = [
    [
      [1, 1],
      [1, 2],
      [1, 3],
    ],
    [
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [3, 1],
      [3, 2],
      [3, 3],
    ],
    [
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [1, 3],
      [2, 3],
      [3, 3],
    ],
    [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    [
      [1, 3],
      [2, 2],
      [3, 1],
    ],
  ];

  for (const line of winLines) {
    let bCount = 0,
      iCount = 0;
    for (const [r, c] of line) {
      const cell = document.querySelector(
        `table tr:nth-child(${r}) td:nth-child(${c})`
      );
      if (!cell) continue;
      if (cell.querySelector("b")) bCount++;
      if (cell.querySelector("i")) iCount++;
    }
    if (bCount === 3) return "X";
    if (iCount === 3) return "O";
  }
  return null;
}

function isCellEmpty(row, col) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  return cell && !cell.querySelector(":is(b,i)");
}

function aiPlay() {
  // AI plays O (i)
  // Strategy: try to win, block player, else random

  // Find all empty cells
  let emptyCells = [];
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      if (isCellEmpty(r, c)) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return;

  // Try to win
  for (const [r, c] of emptyCells) {
    placeTempMark(r, c, "i");
    if (checkWinner() === "O") {
      removeTempMark(r, c);
      playMove(r, c, "<i>⭘</i>");
      return;
    }
    removeTempMark(r, c);
  }
  // Try to block player
  for (const [r, c] of emptyCells) {
    placeTempMark(r, c, "b");
    if (checkWinner() === "X") {
      removeTempMark(r, c);
      playMove(r, c, "<i>⭘</i>");
      return;
    }
    removeTempMark(r, c);
  }

  // Else pick random empty cell
  const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  playMove(r, c, "<i>⭘</i>");
}

function placeTempMark(row, col, mark) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  cell.dataset.temp = mark;
  if (mark === "b") cell.innerHTML = "<b>⨯</b>";
  else if (mark === "i") cell.innerHTML = "<i>⭘</i>";
}

function removeTempMark(row, col) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  if (cell.dataset.temp) {
    cell.innerHTML = "&nbsp;";
    delete cell.dataset.temp;
  }
}

function playMove(row, col, content) {
  const cell = document.querySelector(
    `table tr:nth-child(${row}) td:nth-child(${col})`
  );
  if (!cell) return;
  if (cell.querySelector(":is(b,i)")) return; // cell occupied

  // Add remaining-life UI
  content += `<div class="remaining-life">
    <div class="circle filled"></div>
    <div class="circle filled"></div>
    <div class="circle filled"></div>
  </div>`;

  cell.innerHTML = content;
  moves.add(content, row, col);

  table.classList.toggle("player-2s-turn");
}

document.querySelectorAll(".xo td").forEach((item, index) => {
  item.addEventListener("click", function (e) {
    const el = e.target.closest("td");
    if (el.querySelector(":is(b,i)")) return;

    // Player's turn (X - b)
    const player2sTurn = table.classList.contains("player-2s-turn");
    if (player2sTurn) return; // Wait for AI

    const row = Math.floor(index / 3) + 1;
    const column = (index % 3) + 1;
    playMove(row, column, "<b>⨯</b>");

    // Check win
    const winner = checkWinner();
    if (winner === "X") {
      document.querySelector(".pyro").classList.add("active"); // Confettis que pour joueur 1
      return;
    }
    if (winner === "O") {
      // Joueur 2 gagne, pas de confettis
      return;
    }

    // AI plays after short delay
    setTimeout(() => {
      aiPlay();

      // Après que l'IA joue, on vérifie si elle gagne (joueur 2 = O)
      const winnerAfterAI = checkWinner();
      if (winnerAfterAI === "O") {
        document.querySelector(".pyro").classList.remove("active"); // Pas de confettis pour joueur 2
      }
    }, 300);
  });
});

// Reset button
document.querySelector(".reset-btn").addEventListener("click", (e) => {
  document.querySelectorAll(".xo td").forEach((item) => {
    item.innerHTML = "&nbsp;";
  });
  table.classList.remove("player-2s-turn");
  moves.reset();
  document.querySelector(".pyro").classList.remove("active");
});

/*          *     .        *  .    *    *   . 
 .  *  move your mouse to over the stars   .
 *  .  .   change these values:   .  *
   .      * .        .          * .       */
const STAR_COLOR = "#fff";
const STAR_SIZE = 3;
const STAR_MIN_SCALE = 0.2;
const OVERFLOW_THRESHOLD = 50;
const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8;

const canvas = document.querySelector("canvas"),
  context = canvas.getContext("2d");

let scale = 1, // device pixel ratio
  width,
  height;

let stars = [];

let pointerX, pointerY;

let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };

let touchInput = false;

generate();
resize();
step();

window.onresize = resize;
canvas.onmousemove = onMouseMove;
canvas.ontouchmove = onTouchMove;
canvas.ontouchend = onMouseLeave;
document.onmouseleave = onMouseLeave;

function generate() {
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: 0,
      y: 0,
      z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
    });
  }
}

function placeStar(star) {
  star.x = Math.random() * width;
  star.y = Math.random() * height;
}

function recycleStar(star) {
  let direction = "z";

  let vx = Math.abs(velocity.x),
    vy = Math.abs(velocity.y);

  if (vx > 1 || vy > 1) {
    let axis;

    if (vx > vy) {
      axis = Math.random() < vx / (vx + vy) ? "h" : "v";
    } else {
      axis = Math.random() < vy / (vx + vy) ? "v" : "h";
    }

    if (axis === "h") {
      direction = velocity.x > 0 ? "l" : "r";
    } else {
      direction = velocity.y > 0 ? "t" : "b";
    }
  }

  star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

  if (direction === "z") {
    star.z = 0.1;
    star.x = Math.random() * width;
    star.y = Math.random() * height;
  } else if (direction === "l") {
    star.x = -OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === "r") {
    star.x = width + OVERFLOW_THRESHOLD;
    star.y = height * Math.random();
  } else if (direction === "t") {
    star.x = width * Math.random();
    star.y = -OVERFLOW_THRESHOLD;
  } else if (direction === "b") {
    star.x = width * Math.random();
    star.y = height + OVERFLOW_THRESHOLD;
  }
}

function resize() {
  scale = window.devicePixelRatio || 1;

  width = window.innerWidth * scale;
  height = window.innerHeight * scale;

  canvas.width = width;
  canvas.height = height;

  stars.forEach(placeStar);
}

function step() {
  context.clearRect(0, 0, width, height);

  update();
  render();

  requestAnimationFrame(step);
}

function update() {
  velocity.tx *= 0.96;
  velocity.ty *= 0.96;

  velocity.x += (velocity.tx - velocity.x) * 0.8;
  velocity.y += (velocity.ty - velocity.y) * 0.8;

  stars.forEach((star) => {
    star.x += velocity.x * star.z;
    star.y += velocity.y * star.z;

    star.x += (star.x - width / 2) * velocity.z * star.z;
    star.y += (star.y - height / 2) * velocity.z * star.z;
    star.z += velocity.z;

    // recycle when out of bounds
    if (
      star.x < -OVERFLOW_THRESHOLD ||
      star.x > width + OVERFLOW_THRESHOLD ||
      star.y < -OVERFLOW_THRESHOLD ||
      star.y > height + OVERFLOW_THRESHOLD
    ) {
      recycleStar(star);
    }
  });
}

function render() {
  stars.forEach((star) => {
    context.beginPath();
    context.lineCap = "round";
    context.lineWidth = STAR_SIZE * star.z * scale;
    context.globalAlpha = 0.5 + 0.5 * Math.random();
    context.strokeStyle = STAR_COLOR;

    context.beginPath();
    context.moveTo(star.x, star.y);

    var tailX = velocity.x * 2,
      tailY = velocity.y * 2;

    // stroke() wont work on an invisible line
    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    context.lineTo(star.x + tailX, star.y + tailY);

    context.stroke();
  });
}

function movePointer(x, y) {
  if (typeof pointerX === "number" && typeof pointerY === "number") {
    let ox = x - pointerX,
      oy = y - pointerY;

    velocity.tx = velocity.tx + (ox / 8) * scale * (touchInput ? 1 : -1);
    velocity.ty = velocity.ty + (oy / 8) * scale * (touchInput ? 1 : -1);
  }

  pointerX = x;
  pointerY = y;
}

function onMouseMove(event) {
  touchInput = false;
  movePointer(event.clientX, event.clientY);
}

function onTouchMove(event) {
  touchInput = true;
  movePointer(event.touches[0].clientX, event.touches[0].clientY, true);
  event.preventDefault();
}

function onMouseLeave(event) {
  pointerX = null;
  pointerY = null;
}
