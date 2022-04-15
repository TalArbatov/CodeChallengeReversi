const express = require("express");
const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessions = [];

sessions.push({
  id: "1111",
  pucks: [],
  turn: "black",
});

app.use(express.static("client"));

app.post("/sessions", (req, res) => {
  const session = {
    id: nanoid(4),
    pucks: [],
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

app.listen(3000, () => {
  console.log("listening on port 3000");
});
