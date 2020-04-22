const cors = require("cors");
const express = require("express");
const config = require("./server-conf.json");
require("./state");
const { getConf, getBuilds } = require("./api");

getConf().then(async () => {
  const update = async () => {
    console.log("try update builds, state: ", state);

    if (state.conf.repoName === null) return;

    const { full, short } = await getBuilds();

    console.log("update builds: ", short.data);

    await state.updateBuilds(short.data);

    setTimeout(update, 30000);
  };

  await update();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post("/notify-agent", async (req, res) => {
    const { host, port } = req.body;

    state.registerAgent({ host, port });

    res.end("");
  });

  app.post("/notify-build-result", async (req, res) => {
    // TODO:
    // remove buildId from request body from agent
    const { buildId, success, buildLog } = req.body;

    await state.finishBuildOnAgent(buildId, success, buildLog);

    res.end("");
  });

  app.listen(config.port, () => {
    console.log(`build server is listening at http://localhost:${config.port}`);
  });
});
