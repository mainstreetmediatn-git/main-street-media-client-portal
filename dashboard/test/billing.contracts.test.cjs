const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const filename = path.join(__dirname, "..", "lib", "billing", "outcomes.ts");
const source = fs.readFileSync(filename, "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = new Module(filename);
loaded._compile(compiled, filename);
const { normalizePaymentOutcome } = loaded.exports;

test("billing outcome normalizer classifies only safe internal outcomes", () => {
  assert.equal(normalizePaymentOutcome({ status: "succeeded" }).outcome, "AUTHORIZED");
  assert.equal(normalizePaymentOutcome({ status: "requires_action" }).outcome, "REQUIRES_AUTHENTICATION");
  assert.equal(normalizePaymentOutcome({ status: "failed", code: "insufficient_funds" }).outcome, "INSUFFICIENT_FUNDS");
  assert.equal(normalizePaymentOutcome({ status: "failed", code: "incorrect_cvc" }).outcome, "INCORRECT_CVC");
  assert.equal(normalizePaymentOutcome({ status: "failed", code: "expired_card" }).outcome, "EXPIRED_CARD");
  assert.equal(normalizePaymentOutcome({ status: "unknown" }).outcome, "PROCESSING_ERROR");
});

test("billing outcome normalizer never returns raw processor information to customers", () => {
  const result = normalizePaymentOutcome({ status: "failed", code: "do_not_honor" });
  assert.equal(result.outcome, "DECLINED");
  assert.doesNotMatch(result.publicMessage, /do_not_honor|fraud|risk/i);
});
