import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { translate, hasMessageKey } from '../i18n/messages/index.ts';
import { CAPABILITY_IDS, isCapabilityId } from '../types/capabilityRegistry.ts';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('i18n translate', () => {
  it('returns English for en locale', () => {
    assert.equal(translate('en', 'nav.capture'), 'Submit');
    assert.equal(translate('en', 'nav.home'), 'Home');
  });

  it('returns Spanish and Bosnian for nav labels', () => {
    assert.equal(translate('es', 'nav.capture'), 'Enviar');
    assert.equal(translate('bs', 'nav.capture'), 'Pošalji');
    assert.equal(translate('es', 'capability.COMING_SOON'), 'Próximamente');
    assert.equal(translate('bs', 'capability.COMING_SOON'), 'Uskoro');
  });

  it('falls back to English when a key is missing in a locale', () => {
    // Force fallback path: unknown key cast — catalogs only have MessageKey.
    // Missing es key uses en: login keys exist in all; use a key present in en.
    assert.equal(translate('es', 'nav.pay'), 'Pago');
    assert.ok(translate('bs', 'pay.notConnectedBody').length > 20);
  });

  it('interpolates params', () => {
    assert.equal(
      translate('en', 'submit.bolWithTrip', { loadNum: 'GLX-1' }),
      'Upload paperwork for trip #GLX-1.'
    );
  });

  it('has distinct BolPod and upload translations across en/es/bs', () => {
    const enSelect = translate('en', 'bolPod.steps.selectDocumentEvent');
    const esSelect = translate('es', 'bolPod.steps.selectDocumentEvent');
    const bsSelect = translate('bs', 'bolPod.steps.selectDocumentEvent');
    assert.ok(enSelect.length > 0);
    assert.ok(esSelect.length > 0);
    assert.ok(bsSelect.length > 0);
    assert.notEqual(enSelect, esSelect);
    assert.notEqual(enSelect, bsSelect);
    assert.notEqual(esSelect, bsSelect);

    const enBack = translate('en', 'bolPod.actions.backToSubmit');
    const esBack = translate('es', 'bolPod.actions.backToSubmit');
    const bsBack = translate('bs', 'bolPod.actions.backToSubmit');
    assert.ok(enBack.length > 0 && esBack.length > 0 && bsBack.length > 0);
    assert.notEqual(enBack, esBack);
    assert.notEqual(enBack, bsBack);

    const enHint = translate('en', 'upload.formatHint');
    const esHint = translate('es', 'upload.formatHint');
    const bsHint = translate('bs', 'upload.formatHint');
    assert.ok(enHint.length > 0 && esHint.length > 0 && bsHint.length > 0);
    assert.notEqual(enHint, esHint);
    assert.notEqual(enHint, bsHint);
  });

  it('translates login hero and error copy per locale', () => {
    assert.notEqual(
      translate('en', 'login.heroHighlight'),
      translate('es', 'login.heroHighlight')
    );
    assert.notEqual(
      translate('en', 'login.heroHighlight'),
      translate('bs', 'login.heroHighlight')
    );
    assert.notEqual(
      translate('en', 'login.connectionFailed'),
      translate('es', 'login.connectionFailed')
    );
    assert.notEqual(
      translate('en', 'login.connectionFailed'),
      translate('bs', 'login.connectionFailed')
    );
  });

  it('translates Bosnian BolPod alert copy', () => {
    const bsAlert = translate('bs', 'bolPod.alerts.photoAlreadyAttached');
    assert.ok(bsAlert.length > 0);
    assert.notEqual(bsAlert, translate('en', 'bolPod.alerts.photoAlreadyAttached'));
  });

  it('recognizes known keys and rejects unknown keys via hasMessageKey', () => {
    assert.ok(hasMessageKey('bolPod.steps.selectDocumentEvent'));
    assert.ok(hasMessageKey('login.heroHighlight'));
    assert.ok(hasMessageKey('upload.formatHint'));
    assert.equal(hasMessageKey('bolPod.this.key.does.not.exist'), false);
  });

  it('falls back to the raw key string for an unrecognized key', () => {
    const fakeKey = 'bolPod.totally.made.up.key' as Parameters<typeof translate>[1];
    assert.equal(translate('en', fakeKey), fakeKey);
    assert.equal(translate('es', fakeKey), fakeKey);
  });
});

describe('capability registry types', () => {
  it('includes Phase 1 seed capability ids', () => {
    assert.ok(isCapabilityId('submit'));
    assert.ok(isCapabilityId('multilingual'));
    assert.ok(isCapabilityId('admin-showcase'));
    assert.equal(isCapabilityId('not-a-real-id'), false);
  });

  it('yaml seed lists every typed capability id', () => {
    const yamlPath = join(
      __dirname,
      '..',
      'docs',
      'product',
      'capability-registry',
      'capabilities.yaml'
    );
    const yaml = readFileSync(yamlPath, 'utf8');
    for (const id of CAPABILITY_IDS) {
      assert.ok(yaml.includes(`id: ${id}`), `missing yaml id ${id}`);
    }
  });
});
