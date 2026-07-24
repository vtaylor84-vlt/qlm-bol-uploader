import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const shellNav = readFileSync(
  join(__dirname, '..', 'components', 'mission-control', 'shellNav.tsx'),
  'utf8'
);

describe('locked navigation IA', () => {
  it('keeps Submit label with /capture path and five primary ids', () => {
    assert.match(shellNav, /id:\s*'home'/);
    assert.match(shellNav, /id:\s*'trips'/);
    assert.match(shellNav, /id:\s*'capture'/);
    assert.match(shellNav, /id:\s*'pay'/);
    assert.match(shellNav, /id:\s*'more'/);
    assert.match(shellNav, /label:\s*'Submit'/);
    assert.match(shellNav, /path:\s*'\/capture'/);
    assert.doesNotMatch(shellNav, /path:\s*'\/submit'/);
  });
});
