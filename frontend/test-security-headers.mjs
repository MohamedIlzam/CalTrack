import fs from "node:fs";

const config = fs.readFileSync(
  new URL("./next.config.ts", import.meta.url),
  "utf8",
);

const required = [
  "Content-Security-Policy",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Permissions-Policy",
];

for (const value of required) {
  if (!config.includes(value)) {
    throw new Error(`Missing frontend security policy: ${value}`);
  }
}

console.log(`${required.length} frontend security-header checks passed.`);
