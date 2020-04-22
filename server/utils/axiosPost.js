const requestDecorator = require("./requestDecorator");

module.exports = async function axiosPost(instance, url, data) {
  let isFetching = true;

  let response;
  while (isFetching) {
    response = await requestDecorator(instance.post, url, data);
    console.log("---\nPOST ", url, "\n", response.short, "\n---");

    if (response.full.status !== 500) {
      isFetching = false;
    }
  }
  return response;
};
