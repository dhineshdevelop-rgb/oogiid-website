import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

const behavior = readFileSync(new URL('./script.js', import.meta.url), 'utf8').replaceAll('export function ', 'function ');
const pages = ['industrial-home.html', 'industrial-capabilities.html'];
for (const page of [...pages, 'index.html']) {
  const source = readFileSync(new URL(page, import.meta.url), 'utf8');
  test(`${page}: standalone markup, local assets and links are valid without JavaScript`, () => {
    const dom = new JSDOM(source);
    const doc = dom.window.document;
    assert.equal(doc.documentElement.lang, 'en');
    assert.equal(doc.querySelectorAll('h1').length, 1);
    assert.equal(doc.querySelector('script').textContent.trim(), behavior.trim());
    assert.doesNotThrow(() => new Script(doc.querySelector('script').textContent));
    assert.equal(doc.querySelector('script[src], link[rel="stylesheet"], form'), null);
    const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const img of doc.images) {
      assert.ok(existsSync(new URL(img.getAttribute('src'), import.meta.url)));
      assert.ok(img.alt.length > 0);
      assert.ok(Number(img.width) > 0 && Number(img.height) > 0);
      if (!img.closest('header') && !img.classList.contains('hero-photo')) assert.equal(img.getAttribute('loading'), 'lazy');
    }
    assert.equal(doc.querySelector('.hero-photo').getAttribute('fetchpriority'), 'high');
    for (const link of doc.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      assert.notEqual(href, '#');
      if (link.hasAttribute('data-app-path')) {
        assert.equal(href, `https://oogiid-ui.onrender.com${link.dataset.appPath}`);
      } else {
        const [file, fragment] = href.split('#');
        assert.ok(!file || [...pages, 'industrial-home-updated.html', 'industrial-capabilities-updated.html'].includes(file), href);
        const target = file ? new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8')) : dom;
        if (fragment) assert.ok(target.window.document.getElementById(fragment), href);
        if (target !== dom) target.window.close();
      }
    }
    assert.ok(doc.querySelector('noscript').textContent.includes('.site-nav{display:flex'));
    const css = doc.querySelector('style').textContent;
    assert.ok(css.includes('.reveal{opacity:1;transform:none}'));
    assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
    assert.ok(css.includes('@media(max-width:1100px)'));
    assert.ok(css.includes('@media(max-width:650px)'));
    dom.window.close();
  });
  for (const url of [`http://localhost:5173/${page}`, `https://example.test/oogiid-website/${page}`, new URL(page, import.meta.url).href]) {
    test(`${page}: account routing, menu, scroll and observer fallback on ${url}`, () => {
      const dom = new JSDOM(source, { url, runScripts: 'dangerously', beforeParse(window) {
        window.Date = class extends Date { constructor() { super('2031-01-01T00:00:00Z'); } };
      } });
      const doc = dom.window.document;
      const origin = url.startsWith('http://localhost:') ? 'http://localhost:4200' : 'https://oogiid-ui.onrender.com';
      for (const link of doc.querySelectorAll('[data-app-path]')) assert.equal(link.href, `${origin}${link.dataset.appPath}`);
      const button = doc.querySelector('.menu-toggle');
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'true');
      assert.equal(button.getAttribute('aria-label'), 'Close navigation');
      assert.ok(doc.querySelector('.site-nav').classList.contains('open'));
      assert.ok(doc.body.classList.contains('menu-open'));
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      assert.equal(button.getAttribute('aria-label'), 'Open navigation');
      assert.equal(doc.body.classList.contains('menu-open'), false);
      const anchor = doc.querySelector('.site-nav a[href^="#"]');
      if (anchor) {
        button.click(); anchor.dispatchEvent(new dom.window.MouseEvent('click'));
        assert.equal(button.getAttribute('aria-expanded'), 'false');
      }
      Object.defineProperty(dom.window, 'scrollY', { value: 13, writable: true });
      dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.ok(doc.querySelector('.site-header').classList.contains('scrolled'));
      dom.window.scrollY = 12; dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.equal(doc.querySelector('.site-header').classList.contains('scrolled'), false);
      assert.equal(doc.querySelector('#year').textContent, '2031');
      for (const element of doc.querySelectorAll('.reveal')) assert.ok(element.classList.contains('visible'));
      dom.window.close();
    });
  }
}

test('industrial previews expose six matching capabilities, six journey steps, and preserve existing technical offerings', () => {
  const home = new JSDOM(readFileSync(new URL(pages[0], import.meta.url), 'utf8'));
  const detail = new JSDOM(readFileSync(new URL(pages[1], import.meta.url), 'utf8'));
  const original = new JSDOM(readFileSync(new URL('capabilities.html', import.meta.url), 'utf8'));
  const cards = [...home.window.document.querySelectorAll('.cap-card')];
  assert.equal(cards.length, 6);
  assert.equal(home.window.document.querySelectorAll('.workflow-grid > li').length, 6);
  assert.equal(home.window.document.querySelectorAll('.benefits h3').length, 5);
  assert.ok(home.window.document.getElementById('customers'));
  assert.ok(home.window.document.getElementById('partners'));
  for (const [index, card] of cards.entries()) {
    const section = detail.window.document.getElementById(`capability-${index + 1}`);
    assert.equal(card.getAttribute('href'), `${pages[1]}#${section.id}`);
    assert.equal(card.querySelector('h3').textContent, section.querySelector('h2').textContent);
  }
  const offerings = [...detail.window.document.querySelectorAll('.offering-list li')].map(element => element.textContent);
  for (const item of original.window.document.querySelectorAll('.capability-detail li')) assert.ok(offerings.includes(item.textContent), item.textContent);
  for (const dom of [home, detail, original]) dom.window.close();
});

test('primary homepage is synchronized with the updated industrial preview', () => {
  assert.equal(readFileSync(new URL('index.html', import.meta.url), 'utf8'), readFileSync(new URL('industrial-home-updated.html', import.meta.url), 'utf8'));
});

test('22 photo placements have distinct source originals, verified assets and accurate metadata', () => {
  const manifest = JSON.parse(readFileSync(new URL('assets/industrial/photo-manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.length, 22);
  for (const key of ['sourceId', 'file', 'placement', 'sha256']) assert.equal(new Set(manifest.map(photo => photo[key])).size, 22, `${key} must be unique`);
  for (const [page, group, count] of [['industrial-home.html', 'home', 15], ['industrial-capabilities.html', 'capabilities', 7]]) {
    const dom = new JSDOM(readFileSync(new URL(page, import.meta.url), 'utf8'));
    const doc = dom.window.document;
    const photos = [...doc.querySelectorAll('main img')];
    assert.equal(photos.length, count);
    const entries = manifest.filter(photo => photo.placement.startsWith(`${group}.`));
    assert.equal(entries.length, count);
    assert.equal(new Set(photos.map(photo => photo.getAttribute('src'))).size, count);
    for (const entry of entries) {
      let selector = '.hero-photo';
      const placement = entry.placement.split('.')[1];
      if (placement.startsWith('capability-')) {
        const number = Number(placement.split('-')[1]);
        selector = group === 'home' ? `.cap-card:nth-child(${number}) img` : `#capability-${number} img`;
      } else if (placement.startsWith('step-')) {
        selector = `.step:nth-child(${Number(placement.split('-')[1])}) img`;
      } else if (placement === 'customers' || placement === 'partners') {
        selector = `#${placement} > img`;
      }
      const img = doc.querySelector(selector);
      assert.ok(img, entry.placement);
      assert.equal(img.getAttribute('src'), entry.file, entry.placement);
      assert.equal(img.alt, entry.alt);
      assert.equal(img.width, entry.width);
      assert.equal(img.height, entry.height);
      assert.equal(img.style.objectPosition, entry.objectPosition);
      assert.equal(entry.license, 'Pexels License');
      assert.equal(entry.licenseUrl, 'https://www.pexels.com/license/');
      assert.ok(entry.sourceUrl.endsWith(`-${entry.sourceId}/`));
      assert.ok(entry.photographer.length > 0);
      if (placement === 'hero') {
        assert.notEqual(img.getAttribute('loading'), 'lazy');
        assert.equal(img.getAttribute('fetchpriority'), 'high');
      } else {
        assert.equal(img.getAttribute('loading'), 'lazy');
        assert.equal(img.getAttribute('decoding'), 'async');
      }
      const bytes = readFileSync(new URL(entry.file, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
      assert.equal(bytes.readUInt16BE(0), 0xffd8);
      assert.ok(bytes.length > 10000 && bytes.length < 650000, entry.file);
      // Read the JPEG frame header to verify intrinsic dimensions without a decoder or network.
      let offset = 2;
      let dimensions;
      while (offset < bytes.length) {
        assert.equal(bytes[offset], 0xff);
        const marker = bytes[offset + 1];
        const length = bytes.readUInt16BE(offset + 2);
        if ([0xc0, 0xc1, 0xc2].includes(marker)) {
          dimensions = [bytes.readUInt16BE(offset + 7), bytes.readUInt16BE(offset + 5)];
          break;
        }
        offset += length + 2;
      }
      assert.deepEqual(dimensions, [entry.width, entry.height], entry.file);
    }
    dom.window.close();
  }
});
