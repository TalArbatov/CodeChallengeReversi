const express = require("express");
const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use("/play", express.static(path.join(__dirname, "..", "client")));
// app.get("/", function (req, res) {
//   res.sendfile(path.join("../client/index.html"));

// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessions = [];

// sessionId, socketId

const onlySession = {
  pucks: [
    { x: 3, y: 3, color: "black" },
    { x: 4, y: 3, color: "white" },
    { x: 3, y: 4, color: "white" },
    { x: 4, y: 4, color: "black" },
  ],
  turn: "",
};

sessions.push({
  id: "1111",
  pucks: [
    { x: 3, y: 3, color: "black" },
    { x: 4, y: 3, color: "white" },
    { x: 3, y: 4, color: "white" },
    { x: 4, y: 4, color: "black" },
  ],
  turn: "black",
  sockets: [],
});

app.post("/sessions", (req, res) => {
  //   pucks.push(new Puck(3, 3, BLACK));
  //   pucks.push(new Puck(4, 3, WHITE));
  //   pucks.push(new Puck(3, 4, WHITE));
  //   pucks.push(new Puck(4, 4, BLACK));
  const session = {
    id: nanoid(4),
    pucks: [
      { x: 3, y: 3, color: "black" },
      { x: 4, y: 3, color: "white" },
      { x: 3, y: 4, color: "white" },
      { x: 4, y: 4, color: "black" },
    ],
    turn: "black",
  };

  sessions.push(session);

  res.send(session);
});

app.put("/sessions/:id", (req, res) => {
  const id = req.params.id;
  const { pucks, turn } = req.body;

  const session = sessions.find((session) => session.id === id);

  session.pucks = pucks;
  session.turn = turn;

  res.send(session);
});

// for debugging
app.get("/sessions", (req, res) => {
  res.status(200).send(sessions);
});

// client connects => send serverUpdate

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("connectionEstablish", ({ sessionId }) => {
    const session = sessions.find((sesh) => sesh.id === sessionId);

    if (session) {
      session.sockets.push(socket.id);

      io.to(socket.id).emit("connectionReceived", session);
    }
  });

  socket.on("onPlay", ({ sessionId, pucks, turn }) => {
    const session = sessions.find((sesh) => sesh.id === sessionId);
    console.log("[socket] onPlay, selectedColor", turn);
    if (session) {
      // update server-side pucks

      session.pucks = pucks;
      session.turn = turn;

      // send socket to clients on same session
      for (sockId of session.sockets) {
        io.to(sockId).emit("onPlay", session);
      }
    }
  });

  // io.sockets.emit("serverUpdate", onlySession);

  // socket.on("clientUpdate", (args) => {
  //   console.log("on update", args);

  //   onlySession.pucks = args.pucks;
  //   onlySession.turn = args.selectedColor;

  //   io.sockets.emit("serverUpdate", onlySession);
  // });
});

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
