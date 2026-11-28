import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DATA_DIRECTORY = 'data';
const PAGES_DIRECTORY = 'site';
const TIMELESS_YEAR = 0;
const siteDirectory = process.argv[2] ?? '_site';

rmSync(siteDirectory, { recursive: true, force: true });
mkdirSync(siteDirectory, { recursive: true });

const files = readdirSync(DATA_DIRECTORY)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => {
    const source = path.join(DATA_DIRECTORY, name);
    const { dataset, year = TIMELESS_YEAR, version } = JSON.parse(readFileSync(source, 'utf8'));
    copyFileSync(source, path.join(siteDirectory, name));
    return { path: name, dataset, year, version };
  });

for (const name of readdirSync(PAGES_DIRECTORY)) {
  copyFileSync(path.join(PAGES_DIRECTORY, name), path.join(siteDirectory, name));
}

writeFileSync(path.join(siteDirectory, 'manifest.json'), `${JSON.stringify({ files }, null, 2)}\n`);
console.log(`Published ${files.length} data files to ${siteDirectory}`);
