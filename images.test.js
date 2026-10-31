import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const subjects = ['engineering-design', 'precision-machining', 'fabrication', 'assembly', 'quality-inspection', 'supply-chain'];
const script = readFileSync(new URL('./script.js', import.meta.url), 'utf8').replaceAll('export function ', 'function ').trim();

for (const [original, copy, cards] of [
  ['index.html', 'index-images.html', '.cap-card'],
  ['capabilities.html', 'capabilities-images.html', '.capability-detail'],
]) {
  const source = readFileSync(new URL(copy, import.meta.url), 'utf8');

  test(`${copy} differs only by photographs, additive image styles, and preview links`, () => {
    const before = new JSDOM(readFileSync(new URL(original, import.meta.url), 'utf8'));
    const after = new JSDOM(source);
    const doc = after.window.document;
    assert.equal(doc.querySelector('script').textContent.trim(), script);
    for (const image of doc.querySelectorAll('.industrial-photo')) image.remove();
    doc.querySelector('#industrial-image-styles').remove();
    for (const link of doc.querySelectorAll('a[href]')) {
      link.setAttribute('href', link.getAttribute('href').replace('capabilities-images.html', 'capabilities.html').replace('index-images.html', 'index.html'));
    }
    assert.equal(after.serialize(), before.serialize());
    before.window.close(); after.window.close();
  });

  test(`${copy} has six local, accessible photographs in the matching capability cards`, () => {
    const dom = new JSDOM(source);
    const doc = dom.window.document;
    assert.equal(doc.querySelectorAll('.industrial-photo').length, 6);
    assert.equal(doc.querySelectorAll(cards).length, 6);
    for (const [index, card] of [...doc.querySelectorAll(cards)].entries()) {
      const image = card.querySelector('.industrial-photo');
      assert.ok(image);
      assert.equal(image.getAttribute('src'), `assets/industrial/${subjects[index]}.jpg`);
      assert.ok(image.alt.length > 20);
      assert.equal(image.getAttribute('width'), '1200');
      assert.equal(image.getAttribute('height'), '750');
      assert.equal(image.getAttribute('loading'), 'lazy');
      assert.equal(image.getAttribute('decoding'), 'async');
      const bytes = readFileSync(new URL(image.getAttribute('src'), import.meta.url));
      assert.equal(bytes.subarray(0, 2).toString('hex'), 'ffd8');
      assert.ok(bytes.length > 10000);
    }
    const styles = doc.querySelector('#industrial-image-styles').textContent;
    assert.match(styles, /width: 100%/);
    assert.match(styles, /height: auto/);
    assert.match(styles, /aspect-ratio: 8 \/ 5/);
    assert.match(styles, /object-fit: cover/);
    dom.window.close();
  });

  test(`${copy} keeps preview navigation and all section targets valid`, () => {
    const dom = new JSDOM(source);
    for (const link of dom.window.document.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (href.startsWith('https://')) continue;
      const [file, fragment] = href.split('#');
      assert.ok(!file || ['index-images.html', 'capabilities-images.html'].includes(file));
      const target = file ? new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8')) : dom;
      if (fragment) assert.ok(target.window.document.getElementById(fragment), href);
      if (target !== dom) target.window.close();
    }
    dom.window.close();
  });

  for (const url of [`http://localhost:5173/${copy}`, `https://website.example.test/${copy}`, new URL(copy, import.meta.url).href]) {
    test(`${copy} retains standalone menu, reveal, scroll, and account behavior at ${url}`, () => {
      const dom = new JSDOM(source, { url, runScripts: 'dangerously' });
      const doc = dom.window.document;
      const origin = url.startsWith('http://localhost:') ? 'http://localhost:4200' : 'https://oogiid-ui.onrender.com';
      for (const link of doc.querySelectorAll('[data-app-path]')) assert.equal(link.href, `${origin}${link.dataset.appPath}`);
      const button = doc.querySelector('.menu-toggle');
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'true');
      assert.ok(doc.querySelector('.site-nav').classList.contains('open'));
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      const anchor = doc.querySelector('.site-nav a[href^="#"]');
      if (anchor) {
        button.click(); anchor.click();
        assert.equal(button.getAttribute('aria-expanded'), 'false');
      }
      assert.ok([...doc.querySelectorAll('.reveal')].every(element => element.classList.contains('visible')));
      Object.defineProperty(dom.window, 'scrollY', { value: 13, writable: true });
      dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.ok(doc.querySelector('.site-header').classList.contains('scrolled'));
      dom.window.scrollY = 12;
      dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.equal(doc.querySelector('.site-header').classList.contains('scrolled'), false);
      assert.match(doc.querySelector('#year').textContent, /^\d{4}$/);
      dom.window.close();
    });
  }
}
