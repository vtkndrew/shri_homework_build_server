const path = require("path");
const util = require("util");
const { exec } = require("child_process");
const execPromisified = util.promisify(exec);
const axios = require("axios");
const config = require("./agent-conf.json");

class State {
  constructor() {
    this.buildId = null;
    this.success = null;
    this.buildLog = null;
    this.isRegistered = false;
    this.pathToLocalRepo = path.resolve(__dirname, "localRepo");

    this.addBindings();
  }

  addBindings() {
    this.startBuild = this.startBuild.bind(this);
    this.sendBuildOnServer = this.sendBuildOnServer.bind(this);
  }

  async startBuild(buildId, repoName, commitHash, buildCommand) {
    // 1. создать папку для хранения репозитория, если она ещё не создана
    // 2. очистить папку с репой
    // 3. выкачать репу
    // 4. перейти на нужный коммит
    // 5. начать на сборку
    const pathToRepo = path.resolve(
      __dirname,
      "localRepo",
      `${config.port}`,
      repoName.split("/")[1]
    );

    let allOut = "",
      allErr = "",
      success = true;
    try {
      await execPromisified(
        `mkdir -p localRepo && cd ${this.pathToLocalRepo} && mkdir -p test-folder && rm -r ${this.pathToLocalRepo}/* && mkdir -p ${config.port} && cd ${config.port} && git clone https://github.com/${repoName}.git`
      );
    } catch (error) {
      success = false;
      console.error(error);
    }

    // 4. перейти на нужный коммит
    try {
      await execPromisified(`cd ${pathToRepo} && git checkout ${commitHash}`);
    } catch (error) {
      success = false;
      console.error(error);
    }

    // 5. начать на сборку
    try {
      const { stdout, stderr } = await execPromisified(
        `cd ${pathToRepo} && ${buildCommand}`
      );

      allOut += stdout;
      allErr += stderr;
    } catch (error) {
      success = false;
      allErr += error.message;
      console.error(error);
    }

    const buildLog = `${allOut} ${allErr}`;

    this.buildId = buildId;
    this.success = success;
    this.buildLog = buildLog;

    await this.sendBuildOnServer();
  }

  async sendBuildOnServer() {
    console.log("try to send build data on build server...");

    try {
      await axios.post(
        `http://${config.serverHost}:${config.serverPort}/notify-build-result`,
        {
          buildId: this.buildId,
          success: this.success,
          buildLog: this.buildLog,
        }
      );

      console.log("success send data!");
    } catch (error) {
      console.error(error);
      setTimeout(this.sendBuildOnServer, 10000);
    }
  }
}

global.state = new State();
