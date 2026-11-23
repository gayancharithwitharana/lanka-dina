import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseDataFile, parseManifest } from '@/data/data-file-schema';
import { bundledDataFiles } from '@/data/data-files';

const root = path.join(__dirname, '..');
const dataDirectory = path.join(root, 'data');
const fileNames = fs.readdirSync(dataDirectory).filter((name) => name.endsWith('.json'));
const readDataFile = (name: string): unknown =>
  JSON.parse(fs.readFileSync(path.join(dataDirectory, name), 'utf8'));

describe('data folder', () => {
  it.each(fileNames)('%s is a valid data file named after its dataset and year', (name) => {
    const file = parseDataFile(readDataFile(name));
    const year = file.dataset === 'traditional' ? '' : `-${file.year}`;
    expect(name).toMatch(new RegExp(`^(sample-)?${file.dataset}${year}\\.json$`));
  });

  it('bundles every published file with the app', () => {
    expect(fileNames.map(readDataFile)).toEqual(expect.arrayContaining(bundledDataFiles));
    expect(bundledDataFiles).toHaveLength(fileNames.length);
  });

  it('publishes a manifest with each file and its version', () => {
    const siteDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'lankadina-site-'));
    execFileSync('node', [path.join(root, 'scripts/build-data-site.mjs'), siteDirectory], {
      cwd: root,
    });

    const manifest = parseManifest(
      JSON.parse(fs.readFileSync(path.join(siteDirectory, 'manifest.json'), 'utf8')),
    );
    expect(manifest.files.map((entry) => entry.path)).toEqual([...fileNames].sort());
    for (const entry of manifest.files) {
      const published = parseDataFile(
        JSON.parse(fs.readFileSync(path.join(siteDirectory, entry.path), 'utf8')),
      );
      expect(entry.version).toBe(published.version);
    }
    fs.rmSync(siteDirectory, { recursive: true });
  });
});
