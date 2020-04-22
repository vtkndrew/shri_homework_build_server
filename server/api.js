const querystring = require("querystring");
const https = require("https");
const axios = require("axios").default;
const config = require("./server-conf.json");
const state = require("./state");
const { axiosGet, axiosPost } = require("./utils");

const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 5000,
  headers: {
    Authorization: "Bearer " + config.apiToken,
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const getConf = async () => {
  const { full, short } = await axiosGet(api, "/conf");
  console.log("get config: ", short);

  const { data } = short;

  if (data) {
    state.conf = data;
  }
};

const getBuilds = async () => {
  const params = {
    limit: 9999,
  };

  let queryUrl = "/build/list";
  const paramsEncoded = querystring.encode(params);
  if (paramsEncoded !== "") {
    queryUrl += `/?${paramsEncoded}`;
  }

  return await axiosGet(api, queryUrl);
};

const startBuild = async (agent, params) => {
  console.log("start build. url: ", agent.url, "params: ", params);

  console.log("set build status 'In Progress' in db");
  await axiosPost("/build/start", {
    buildId: params.buildId,
    dateTime: agent.start.toISOString(),
  });

  try {
    // TODO: maybe убрать buildId
    const response = await axios.post(`${agent.url}/build`, params);
    console.log("answer from build agent on start build: ", response);
  } catch (error) {
    console.error(error);
  }
};

const finishBuild = async ({ buildId, start, success, buildLog }) => {
  const end = new Date();
  const duration = Math.round((end.getTime() - start.getTime()) / 1000);

  console.log(`set build status: ${status}, for buildId: ${buildId}`);
  await axiosPost("/build/finish", {
    buildId,
    duration,
    success,
    buildLog,
  });
};

module.exports = {
  getConf,
  getBuilds,
  startBuild,
  finishBuild,
};
