const status = require("./status");
const { startBuild, finishBuild } = require("./api");

class State {
  constructor() {
    this.conf = {
      repoName: null,
      buildCommand: null,
      mainBranch: null,
      period: null,
    };
    this.builds = [];
    this.agents = [];

    this.addBindings();
  }

  addBindings() {
    this.setConf = this.setConf.bind(this);
    this.registerAgent = this.registerAgent.bind(this);
    this.getFreeAgents = this.getFreeAgents.bind(this);
    this.getBusyAgents = this.getBusyAgents.bind(this);
    this.getAgentByBuildId = this.getAgentByBuildId.bind(this);
    this.setAgentFree = this.setAgentFree.bind(this);
    this.setAgentBusy = this.setAgentBusy.bind(this);
    this.updateBuilds = this.updateBuilds.bind(this);
    this.searchAgent = this.searchAgent.bind(this);
    this.assignBuildToAgent = this.assignBuildToAgent.bind(this);
    this.finishBuildOnAgent = this.finishBuildOnAgent.bind(this);
  }

  setConf({ repoName, buildCommand, mainBranch, period }) {
    this.conf.repoName = repoName;
    this.conf.buildCommand = buildCommand;
    this.conf.mainBranch = mainBranch;
    this.conf.period = period;
  }

  registerAgent({ host, port }) {
    const url = `${host}:${port}`;

    if (this.agents.some((agent) => agent.url === url)) return;

    console.log(`new build agent registered (${url})`);
    this.agents.push({
      url,
      status: status.FREE,
      buildId: null,
      start: null,
    });
  }

  getFreeAgents(agents = this.agents) {
    return agents.filter((agentObj) => agentObj.status === status.FREE);
  }
  getBusyAgents(agents = this.agents) {
    return agents.filter((agentObj) => agentObj.status === status.BUSY);
  }
  getAgentByBuildId(buildId, agents = this.agents) {
    return agents.find((agentObj) => agentObj.buildId === buildId);
  }
  // TODO:
  // getAgentByUrl MAYBE

  setAgentFree(agent) {
    agent.status = status.FREE;
    agent.buildId = null;
    agent.start = null;
  }
  setAgentBusy(agent, buildId) {
    agent.status = status.BUSY;
    agent.buildId = buildId;
    agent.start = new Date();
  }

  async updateBuilds(builds) {
    this.builds = builds.filter((build) => build.status === "Waiting");

    if (this.builds.length) {
      await this.searchAgent();
    }
  }

  async searchAgent() {
    const freeAgents = this.getFreeAgents();
    if (freeAgents.length) {
      console.log("found free agent");
      await this.assignBuildToAgent(freeAgents[0]);
    } else {
      console.log("not found free agent");
      setTimeout(this.searchAgent, 10000);
    }
  }

  async assignBuildToAgent(agent) {
    const builds = this.builds.filter((build) => build.status === "Waiting");
    const build = builds[builds.length - 1];
    const params = {
      buildId: build.id,
      repoName: this.conf.repoName,
      commitHash: build.commitHash,
      buildCommand: this.conf.buildCommand,
    };

    this.setAgentBusy(agent, build.id);

    await startBuild(agent, params);
  }

  async finishBuildOnAgent(buildId, success, buildLog) {
    const agent = this.getAgentByBuildId(buildId);
    console.log("finish build. url: ", agent.url, "success: ", success);

    await finishBuild({
      buildId,
      start: agent.start,
      success,
      buildLog,
    });

    this.setAgentFree(agent);
  }
}

// module.exports = new State();

global.state = new State();
