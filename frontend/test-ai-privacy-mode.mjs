import fs from "node:fs";

const page = fs.readFileSync(
  new URL("./src/app/ai/page.tsx", import.meta.url),
  "utf8",
);
const api = fs.readFileSync(
  new URL("./src/lib/api.ts", import.meta.url),
  "utf8",
);
const store = fs.readFileSync(
  new URL("./src/store/useAppStore.ts", import.meta.url),
  "utf8",
);

const checks = [
  [
    "informed personalized opt-in is visible",
    page.includes("Personalized Gemini opt-in") &&
      page.includes("minimum relevant nutrition totals"),
  ],
  [
    "consent is sent with an explicit version",
    /PERSONALIZED_GEMINI_CONSENT_VERSION\s*=\s*["']2026-11-22["']/.test(api) &&
      api.includes("consentVersion"),
  ],
  [
    "expected service failures render outside the conversation",
    page.includes("setServiceError") &&
      !page.includes("setStoreMessages((prev) => [...prev, errorMsg])"),
  ],
  [
    "server conversation reset is called",
    page.includes("await resetCoachChat()") && api.includes("/ai/chat/reset"),
  ],
  [
    "consent is account-isolated and cleared on logout",
    /personalizedAiConsent:\s*isDifferentUser\s*\?\s*false/.test(store) &&
      store.includes("personalizedAiConsent: false"),
  ],
  [
    "personal-data provenance is visible",
    page.includes("Consented personal context"),
  ],
];

let failed = 0;
for (const [name, passed] of checks) {
  if (passed) console.log(`✓ ${name}`);
  else {
    failed += 1;
    console.error(`✗ ${name}`);
  }
}
if (failed) process.exit(1);
console.log(`${checks.length} AI privacy-mode frontend checks passed.`);
