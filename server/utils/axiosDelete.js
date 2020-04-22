const requestDecorator = require("./requestDecorator");

module.exports = async function axiosDelete(instance, url, data) {
  let isFetching = true;

  let response;
  while (isFetching) {
    response = await requestDecorator(instance.delete, url, data);
    console.log("---\nDELETE ", url, "\n", response.short, "\n---");

    if (response.full.status !== 500) {
      isFetching = false;
    }
  }
  return response;
};
