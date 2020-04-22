module.exports = async (method, url, data) => {
  let response, full, short;

  try {
    full = await method(url, data);
    short = full.data;
  } catch (error) {
    full = error;
    short = {
      error: error.message,
    };
  }

  response = {
    full,
    short,
  };
  return response;
};
