const COL_RANGES = [
  [1, 9],
  [10, 19],
  [20, 29],
  [30, 39],
  [40, 49],
  [50, 59],
  [60, 69],
  [70, 79],
  [80, 90],
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomNumbers(min, max, count) {
  const pool = [];
  for (let n = min; n <= max; n += 1) {
    pool.push(n);
  }
  return shuffle(pool).slice(0, count).sort((a, b) => a - b);
}

export function generateTambolaTicket() {
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const grid = Array.from({ length: 3 }, () => Array(9).fill(null));
    const colCounts = Array(9).fill(0);
    let valid = true;

    for (let row = 0; row < 3; row += 1) {
      const cols = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 5);

      for (const col of cols) {
        colCounts[col] += 1;
        if (colCounts[col] > 3) {
          valid = false;
          break;
        }
        grid[row][col] = 0;
      }

      if (!valid) break;
    }

    if (!valid || colCounts.some((count) => count === 0)) {
      continue;
    }

    for (let col = 0; col < 9; col += 1) {
      const [min, max] = COL_RANGES[col];
      const numbers = pickRandomNumbers(min, max, colCounts[col]);
      let index = 0;

      for (let row = 0; row < 3; row += 1) {
        if (grid[row][col] === 0) {
          grid[row][col] = numbers[index];
          index += 1;
        }
      }
    }

    return grid;
  }

  throw new Error("Failed to generate tambola ticket");
}

export function getTicketNumbers(grid) {
  return grid.flat().filter((cell) => cell !== null);
}

export function validateClaim(grid, calledNumbers, claimType) {
  const called = new Set(calledNumbers);
  const isMarked = (num) => called.has(num);

  const rowComplete = (rowIndex) => {
    const rowNumbers = grid[rowIndex].filter((cell) => cell !== null);
    return rowNumbers.length === 5 && rowNumbers.every(isMarked);
  };

  const markedCount = getTicketNumbers(grid).filter(isMarked).length;

  switch (claimType) {
    case "earlyFive":
      return markedCount >= 5;
    case "topLine":
      return rowComplete(0);
    case "middleLine":
      return rowComplete(1);
    case "bottomLine":
      return rowComplete(2);
    case "fullHouse":
      return markedCount === 15;
    default:
      return false;
  }
}
