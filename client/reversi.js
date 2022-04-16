let pucks = [];
let selectedColor;
let session;
let socket;

const COLORS = {
  BOARD: {
    LIGHT: "#45c472",
    DARK: "#339154",
  },
  PLAYERS: {
    BLACK: "black",
    WHITE: "white",
  },
};

const { WHITE, BLACK } = COLORS.PLAYERS;

class Puck {
  x;
  y;
  color;

  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
  }
}

const canvas = document.getElementById("myCanvas");
const currentPlayer = document.getElementById("text-current-player");
const blackPoints = document.getElementById("text-black-score");
const whitePoints = document.getElementById("text-white-score");

const ctx = canvas.getContext("2d");

let currentTurn = 0;
const turns = [];

const drawBoard = () => {
  for (let i = 0; i < 600; i += 75) {
    for (let j = 0; j < 600; j += 75) {
      ctx.fillStyle =
        (i + j) % 2 === 0 ? COLORS.BOARD.DARK : COLORS.BOARD.LIGHT;
      ctx.fillRect(i, j, 75, 75);
    }
  }
};

const pushTurn = () => {
  const newPucks = [
    ...pucks.map((puck) => {
      return new Puck(puck.x, puck.y, puck.color);
    }),
  ];
  turns.push(newPucks);
};

// const setInitialPucks = () => {
//   pucks.push(new Puck(3, 3, BLACK));
//   pucks.push(new Puck(4, 3, WHITE));
//   pucks.push(new Puck(3, 4, WHITE));
//   pucks.push(new Puck(4, 4, BLACK));

//   // pucks.push(new Puck(3, 2, WHITE));
//   // pucks.push(new Puck(2, 1, WHITE));
//   // pucks.push(new Puck(5, 4, BLACK));

//   // pucks.push(new Puck(4, 2, BLACK));
//   // pucks.push(new Puck(2, 2, WHITE));
//   // pucks.push(new Puck(2, 3, WHITE));

//   // pucks.push(new Puck(5, 2, WHITE));
//   // pucks.push(new Puck(5, 3, WHITE));

//   pushTurn();
// };

const posToPixel = (pos) => {
  // 0 => 37.5
  // 1 => 75 + 37.5
  return 37.5 + 75 * pos;
};

const pixelToPosition = (pixel) => {
  return Math.floor(pixel / 75);
};

const drawPucks = () => {
  console.log("drawing pucks", pucks);
  for (puck of pucks) {
    const { x, y, color } = puck;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(posToPixel(x), posToPixel(y), 30, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }
};

// pucks.push(myPuck);
// pucks.push(new Puck(1, 1, "white"));
// drawBoard();
// setInitialPucks();
// drawPucks();

const isSquareTaken = (x, y) => {
  return !!pucks.find((puck) => puck.x === x && puck.y === y);
};

const placePuck = (x, y) => {
  const myPuck = new Puck(x, y, selectedColor);
  pucks.push(myPuck);
};

const turnPucks = (pucksToTurn) => {
  // console.log("turning pucks");
  // console.log(pucksToTurn);

  for (puckToTurn of pucksToTurn) {
    const pickedPuckIndex = pucks.findIndex(
      (puck) => puck.x === puckToTurn.x && puck.y === puckToTurn.y
    );
    const pickedPuck = pucks[pickedPuckIndex];
    // console.log("pickedPuckIndex", pickedPuckIndex);
    // console.log("pickedPuck", pickedPuck);

    pickedPuck.color = selectedColor;
    // console.log("pickedPuck", pickedPuck);

    pucks.splice(pickedPuckIndex, 1);
    pucks.push(pickedPuck);

    // console.log(pucks);
    // drawPucks();
  }
};

const isClosablePuck = (placedPuck, selectedPuck) => {
  // get vector/direction to check for closing
  const xOffset = selectedPuck.x - placedPuck.x; // 1
  const yOffset = selectedPuck.y - placedPuck.y; // 0

  // console.log("placedPuck", placedPuck);
  // console.log("selectedPuck", selectedPuck);
  // console.log("xoffset", "yoffset");
  // console.log(xOffset, yOffset);

  const possiblePositions = [];

  if (yOffset === 0) {
    // if vector horizonal
    if (xOffset === 1) {
      // =>
      for (let i = selectedPuck.x; i < 8; i += xOffset) {
        possiblePositions.push({ x: i, y: selectedPuck.y });
      }
    } else if (xOffset === -1) {
      // <=
      for (let i = selectedPuck.x; i > -1; i += xOffset) {
        possiblePositions.push({ x: i, y: selectedPuck.y });
      }
    }
  } else if (xOffset === 0) {
    // if vector vertical
    if (yOffset === 1) {
      // down
      for (let i = selectedPuck.y; i < 8; i += yOffset) {
        possiblePositions.push({ x: selectedPuck.x, y: i });
      }
    } else if (yOffset === -1) {
      // up
      for (let i = selectedPuck.y; i > -1; i += yOffset) {
        possiblePositions.push({ x: selectedPuck.x, y: i });
      }
    }
  } else if (yOffset === 1 && xOffset === 1) {
    let i = selectedPuck.x,
      j = selectedPuck.y;
    while (i < 8 && j < 8) {
      possiblePositions.push({ x: i, y: j });
      i++;
      j++;
    }
  } else if (yOffset === -1 && xOffset === -1) {
    let i = selectedPuck.x,
      j = selectedPuck.y;
    while (i > -1 && j > -1) {
      possiblePositions.push({ x: i, y: j });
      i--;
      j--;
    }
  } else if (yOffset === -1 && xOffset === 1) {
    let i = selectedPuck.x,
      j = selectedPuck.y;
    while (i < 8 && j > -1) {
      possiblePositions.push({ x: i, y: j });
      i++;
      j--;
    }
  } else if (yOffset === 1 && xOffset === -1) {
    let i = selectedPuck.x,
      j = selectedPuck.y;
    while (i > -1 && j < 8) {
      possiblePositions.push({ x: i, y: j });
      i--;
      j++;
    }
  }

  // console.log("possiblePositions");
  // console.log(possiblePositions);

  const possiblyTurnedOverPucks = [];
  const oppositeColor = selectedColor === WHITE ? BLACK : WHITE;

  let foundCurrentColorPuck;

  for (possiblePosition of possiblePositions) {
    const oppositeColorPuck = pucks.find(
      (puck) =>
        puck.x === possiblePosition.x &&
        puck.y === possiblePosition.y &&
        puck.color === oppositeColor
    );

    const currentColorPuck = pucks.find(
      (puck) =>
        puck.x === possiblePosition.x &&
        puck.y === possiblePosition.y &&
        puck.color === selectedColor
    );
    if (oppositeColorPuck) possiblyTurnedOverPucks.push(oppositeColorPuck);

    // space between
    if (!currentColorPuck && !oppositeColorPuck) {
      break;
    }

    if (currentColorPuck) {
      foundCurrentColorPuck = currentColorPuck;
      break;
    }
  }

  if (foundCurrentColorPuck && possiblyTurnedOverPucks.length > 0) {
    return { isClosablePuck: true, possiblyTurnedOverPucks };
  } else {
    return { isClosablePuck: false, possiblyTurnedOverPucks: [] };
  }
};

const getNearPositions = (x, y) => {
  return [
    { x: x - 1, y: y - 1 },
    { x: x - 1, y },
    { x: x - 1, y: y + 1 },
    { x, y: y + 1 },
    { x: x + 1, y: y + 1 },
    { x: x + 1, y },
    { x: x + 1, y: y - 1 },
    { x, y: y - 1 },
  ];
};

const getNearOppositePuck = (x, y, validPositions) => {
  const placedPuck = { x, y };
  const oppositeColor = selectedColor === WHITE ? BLACK : WHITE;

  const foundPucks = [];

  for (position of validPositions) {
    const foundPuck = pucks.find(
      (puck) =>
        puck.x == position.x &&
        puck.y === position.y &&
        puck.color === oppositeColor
    );
    if (foundPuck) {
      foundPucks.push(foundPuck);
    }
  }

  const selectedPucks = [];

  for (const foundPuck of foundPucks) {
    const selectedPuck = { x: foundPuck.x, y: foundPuck.y };
    // console.log("selectedPuck");
    // console.log(selectedPuck);

    if (isClosablePuck(placedPuck, selectedPuck).isClosablePuck)
      selectedPucks.push(selectedPuck);
    else {
      const newValidPositions = [...validPositions];

      // while (newValidPositions.length > 0) {
      const index = newValidPositions.findIndex(
        (validPosition) =>
          validPosition.x === position.x && validPosition.y === position.y
      );
      // console.log("index", index);
      newValidPositions.splice(index, 1);
      // console.log("newValidPositions");
      // console.log(newValidPositions);
      getNearOppositePuck(x, y, newValidPositions);
      // }
    }
  }

  // console.log("selectedPucks");
  // console.log(selectedPucks);

  return selectedPucks;
};

const setTurn = (num) => {
  pucks = [...turns[num]];
};

const undo = () => {
  currentTurn--;
  setTurn(currentTurn);

  selectedColor = selectedColor === WHITE ? BLACK : WHITE;
};

const updateScore = () => {
  const blackPointsNum = pucks.filter((puck) => puck.color === BLACK).length;
  const whitePointsNum = pucks.filter((puck) => puck.color === WHITE).length;
  currentPlayer.innerText = `Current player: ${selectedColor}`;
  blackPoints.innerText = `Black score: ${blackPointsNum}`;
  whitePoints.innerText = `White points: ${whitePointsNum}`;
};

const play = (x, y) => {
  socket.emit("clientUpdate", {
    pucks,
    selectedColor,
  });

  let userPlayed = false;

  if (!isSquareTaken(x, y)) {
    const placedPuck = { x, y };
    const selectedPucks = getNearOppositePuck(x, y, getNearPositions(x, y));
    if (selectedPucks.length > 0) {
      for (const selectedPuck of selectedPucks) {
        const data = isClosablePuck(placedPuck, selectedPuck);
        if (data.isClosablePuck) {
          turnPucks(data.possiblyTurnedOverPucks);
        }
      }
      placePuck(x, y);
      selectedColor = selectedColor === WHITE ? BLACK : WHITE;
      pushTurn();
      currentTurn++;
      userPlayed = true;
    } else {
      console.log("is not near valid opposite puck");
    }
  } else {
    console.log("square taken");
  }

  return userPlayed;
};

const getSessionId = () => {
  const url = new URL(window.location.toString());

  return url.searchParams.get("session");
};

const main = async () => {
  // const response = await fetch("/sessions", {
  //   method: "POST",
  // });

  socket = io();

  // socket.on("serverUpdate", (args) => {
  //   console.log("on server update", args);
  // });

  socket.on("onPlay", ({ pucks: serverPucks, turn }) => {
    console.log("onPlay received", pucks, turn);
    pucks = serverPucks;
    selectedColor = turn;
    drawPucks();
    updateScore();
  });

  socket.emit("connectionEstablish", {
    sessionId: getSessionId(),
  });

  socket.on("connectionReceived", ({ pucks: serverPucks, turn }) => {
    console.log("connetionReceived", pucks, turn);
    pucks = serverPucks;
    selectedColor = turn;

    drawBoard();
    drawPucks();
  });

  console.log(socket);

  // const responseJson = await response.json();

  // session = responseJson.id;
  // pucks = responseJson.pucks;
  // selectedColor = responseJson.turn;

  // console.log(responseJson);

  // drawBoard();
  // drawPucks();
};

main();

canvas.addEventListener("click", (e) => {
  const { offsetX, offsetY } = e;

  const x = pixelToPosition(offsetX);
  const y = pixelToPosition(offsetY);

  const userPlayed = play(x, y);
  // if (userPlayed) getBestScore();
  if (userPlayed) {
    console.log("emitting onPlay");
    socket.emit("onPlay", {
      sessionId: getSessionId(),
      pucks,
      turn: selectedColor,
    });
  }
});

// bot
const getBestScore = () => {
  const scores = [];
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (!isSquareTaken(x, y)) {
        placedPuck = { x, y };
        const selectedPucks = getNearOppositePuck(x, y, getNearPositions(x, y));
        if (selectedPucks.length > 0) {
          for (const selectedPuck of selectedPucks) {
            const data = isClosablePuck(placedPuck, selectedPuck);
            if (
              data.isClosablePuck &&
              data.possiblyTurnedOverPucks.length > 0
            ) {
              let bonus = x === 0 || y === 0 || x === 7 || y === 7 ? 2 : 0;
              if (
                (x === 0 && y === 0) ||
                (x === 7 && y === 0) ||
                (x === 0 && y === 7) ||
                (x === 7 && y === 7)
              )
                bonus += 2;
              scores.push({
                score: data.possiblyTurnedOverPucks.length + bonus,
                puck: { x, y },
              });
              console.log("[bot]", data.possiblyTurnedOverPucks);
            }
          }
        }
      }
    }
  }

  console.log("[bot] scores", scores);

  scores.sort((score1, score2) => {
    if (score1.score > score2.score) return -1;
    if (score2.score > score1.score) return 1;
    return 0;
  });

  const highestScore = scores[0];

  console.log("[bot] highest score", highestScore);

  setTimeout(() => {
    play(highestScore.puck.x, highestScore.puck.y);
  }, 1500);
};
