import { readdirSync } from "node:fs";

const root = new URL("./src/", import.meta.url);

function findTests(dir: URL): string[] {
  const paths: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      paths.push(...findTests(new URL(`./${entry.name}/`, dir)));
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      paths.push(new URL(`./${entry.name}`, dir).href);
    }
  }
  return paths;
}

const tests = findTests(root);
if (tests.length === 0) {
  console.log("No tests found.");
  process.exit(0);
}

for (const file of tests) {
  await import(file);
}
