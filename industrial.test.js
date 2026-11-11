import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Script } from 'node:vm';
import { JSDOM } from 'jsdom';

const behavior = readFileSync(new URL('./script.js', import.meta.url), 'utf8').replaceAll('export function ', 'function ');
const pages = ['industrial-home.html', 'industrial-capabilities.html'];
for (const page of pages) {
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
        assert.ok(!file || pages.includes(file), href);
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
