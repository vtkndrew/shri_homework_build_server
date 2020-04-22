const cors = require("cors");
const express = require("express");
const axios = require("axios").default;
const state = require("./state");
const config = require("./agent-conf.json");

const registerOnServer = async () => {
  console.log("try to register on build server...");

  const { full, short } = await axios.post(
    `http://${config.serverHost}:${config.serverPort}/notify-agent`,
    {
      host: "http://localhost",
      port: config.port,
    }
  );

  if (full.status !== 200) {
    setTimeout(registerOnServer, 10000);
    return;
  }

  console.log("register on build server");
  state.isRegistered = true;
};

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/build", async (req, res) => {
  if (!state.isRegistered) {
    res.status(500).end();
    return;
  }

  // TODO: maybe убрать buildId
  const { buildId, repoName, commitHash, buildCommand } = req.body;

  // TODO: maybe убрать buildId
  await state.startBuild(buildId, repoName, commitHash, buildCommand);

  res.end("");
});

app.listen(config.port, () => {
  console.log(`build agent is listening at http://localhost:${config.port}`);
  registerOnServer();
});
