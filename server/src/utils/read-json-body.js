const { HttpError } = require("./http-error");

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();

  if (!rawBody) {
    throw new HttpError(400, "Request body is required");
  }

  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    throw new HttpError(400, "Invalid JSON body");
  }
}

module.exports = { readJsonBody };
