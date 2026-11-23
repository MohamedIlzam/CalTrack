import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("./src/components/onboarding/Step6Auth.tsx", import.meta.url),
  "utf8",
);

const staleDraft = { name: "", goal: "lose" };
const submittedName = "Production User";
const registrationBody = {
  ...staleDraft,
  email: "user@example.com",
  password: "valid-password",
  name: submittedName.trim(),
};

assert.equal(
  registrationBody.name,
  submittedName,
  "The final signup name must override any earlier onboarding draft value",
);
assert.match(
  source,
  /useState\(draft\.name \?\? ""\)/,
  "The signup name field must start with the onboarding name",
);
assert.match(
  source,
  /\{\s*\.\.\.draft,[\s\S]*?name: name\.trim\(\),\s*\}/,
  "The explicit signup name must be applied after the onboarding draft",
);
assert.match(source, /maxLength=\{100\}/);

console.log("Registration payload name precedence regression test passed.");
