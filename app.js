const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializationDBandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializationDBandServer();

const convertIntoResponse = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

//GET ALL PLAYERS 1
app.get("/players/", async (request, response) => {
  const getAllData = `SELECT * FROM cricket_team; `;
  const dbresponse = await db.all(getAllData);
  response.send(
    dbresponse.map((eachPlayer) => convertIntoResponse(eachPlayer))
  );
});

//POST SINGLE PLAYER 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerData = ` INSERT INTO cricket_team (player_name, jersey_number, role) VALUES ('${playerName}', ${jerseyNumber}, '${role}'); `;
  const dbresponse = await db.run(postPlayerData);
  response.send("Player Added to Team");
});

//GET SINGLE PLAYER 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSinglePlayer = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const dbresponse = await db.get(getSinglePlayer);
  response.send(convertIntoResponse(dbresponse));
});

//Put player 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const { playerId } = request.params;

  const updatePlayer = `UPDATE cricket_team SET player_name = '${playerName}', jersey_number = ${jerseyNumber}, role='${role}' WHERE player_id = ${playerId}`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

//Delete Player 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team WHERE player_id = ${playerId}`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

//
module.exports = app;
