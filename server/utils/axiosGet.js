const requestDecorator = require("./requestDecorator");

module.exports = async function axiosGet(instance, url, data) {
  let isFetching = true;

  let response;
  while (isFetching) {
    response = await requestDecorator(instance.get, url, data);
    console.log("---\nGET ", url, "\n", response.short, "\n---");

    if (response.full.status !== 500) {
      isFetching = false;
    }
  }
  return response;
};
