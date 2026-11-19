// Leonida Ledger — entrypoint for the make.fun gta6-trophy-guide-01 bounty.
// Copies app/ and screenshots/ from this repository to the output directory
// and writes /output/dossier.json with buildDossier from the kit library.
// Node 22+, standard library only. Deterministic: files are copied in sorted
// order and no timestamps are written anywhere, so two runs are byte-identical.
import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function repoRoot(): string {
  return dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  const env = process.env.MAKEFUN_OUTPUT_DIR;
  if (env && env.trim() !== "") return env;
  return "/output";
}

function copyTreeSorted(source: string, target: string): void {
  mkdirSync(target, { recursive: true });
  const entries = readdirSync(source).sort();
  for (const name of entries) {
    const from = join(source, name);
    const to = join(target, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTreeSorted(from, to);
    } else if (st.isFile()) {
      cpSync(from, to);
    }
  }
}

function main(): void {
  const root = repoRoot();
  const out = outputDir();
  const appSource = join(root, "app");
  const shotsSource = join(root, "screenshots");
  if (!existsSync(appSource)) throw new Error("main.ts: app/ is missing from the repository");
  if (!existsSync(shotsSource)) throw new Error("main.ts: screenshots/ is missing from the repository");
  mkdirSync(out, { recursive: true });
  copyTreeSorted(appSource, join(out, "app"));
  copyTreeSorted(shotsSource, join(out, "screenshots"));
  const dossier = buildDossier(out, CAPS);
  writeFileSync(join(out, "dossier.json"), dossier);
  console.log("Leonida Ledger: wrote " + join(out, "dossier.json") + " (" + dossier.length + " bytes)");
}

main();
