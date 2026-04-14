const { HttpError } = require("./http-error");

const TIPOS_SUBCONTA = ["livre", "restrita", "investimento"];
const TIPOS_CATEGORIA = ["entrada", "saida"];
const GRUPOS_CATEGORIA = ["Essenciais", "Conforto", "Investimentos", "Outros", "Cartao"];
const TIPOS_LANCAMENTO = ["entrada", "saida"];
const STATUS_LANCAMENTO = ["nao_pago", "pago"];
const STATUS_TRANSFERENCIA = ["planejada", "realizada"];
const FREQUENCIAS_TEMPLATE = ["mensal"];
const TIPOS_GERACAO_TEMPLATE = ["fixo", "variavel_com_data", "acumulador", "embutido"];

function requireString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `Field '${fieldName}' must be a non-empty string`);
  }

  return value.trim();
}

function requireBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw new HttpError(400, `Field '${fieldName}' must be a boolean`);
  }

  return value;
}

function requireInteger(value, fieldName) {
  if (!Number.isInteger(value)) {
    throw new HttpError(400, `Field '${fieldName}' must be an integer`);
  }

  return value;
}

function requireIdParam(value, fieldName = "id") {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `Field '${fieldName}' must be a valid positive integer`);
  }

  return parsed;
}

function requireNumber(value, fieldName) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new HttpError(400, `Field '${fieldName}' must be a number`);
  }

  return value;
}

function requireDateString(value, fieldName) {
  const parsed = new Date(value);

  if (typeof value !== "string" || Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, `Field '${fieldName}' must be a valid date string`);
  }

  return parsed;
}

function requireEnum(value, fieldName, allowedValues) {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new HttpError(400, `Field '${fieldName}' must be one of: ${allowedValues.join(", ")}`);
  }

  return value;
}

module.exports = {
  FREQUENCIAS_TEMPLATE,
  GRUPOS_CATEGORIA,
  STATUS_LANCAMENTO,
  STATUS_TRANSFERENCIA,
  TIPOS_CATEGORIA,
  TIPOS_GERACAO_TEMPLATE,
  TIPOS_LANCAMENTO,
  TIPOS_SUBCONTA,
  requireBoolean,
  requireDateString,
  requireEnum,
  requireIdParam,
  requireInteger,
  requireNumber,
  requireString
};
