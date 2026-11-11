import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const behavior = readFileSync(new URL('./script.js', import.meta.url), 'utf8').replaceAll('export function ', 'function ');
for (const [original, redesigned] of [['index-images.html', 'modern.html'], ['capabilities.html', 'modern-capabilities.html']]) {
  const source = readFileSync(new URL(redesigned, import.meta.url), 'utf8');
  test(`${redesigned} preserves content, logo, links and the tested application behavior`, () => {
    const before = new JSDOM(readFileSync(new URL(original, import.meta.url), 'utf8'));
    before.window.document.querySelector('#industrial-image-styles')?.remove();
    for (const image of before.window.document.querySelectorAll('.industrial-photo')) image.remove();
    for (const link of before.window.document.querySelectorAll('a[href]')) {
      link.setAttribute('href', link.getAttribute('href').replaceAll('capabilities-images.html', 'capabilities.html').replaceAll('index-images.html', 'index.html'));
    }
    const after = new JSDOM(source);
    const doc = after.window.document;
    assert.equal(doc.querySelector('script').textContent.trim(), behavior.trim());
    assert.equal(doc.querySelector('script[src], link[rel="stylesheet"]'), null);
    assert.ok(doc.querySelector('style').textContent.includes('@media(max-width:760px)'));
    assert.equal(doc.querySelector('main').textContent, before.window.document.querySelector('main').textContent);
    assert.deepEqual([...doc.querySelectorAll('[id]')].map(element => element.id), [...before.window.document.querySelectorAll('[id]')].map(element => element.id));
    const oldLinks = [...before.window.document.querySelectorAll('a')];
    const links = [...doc.querySelectorAll('a')];
    assert.equal(links.length, oldLinks.length);
    for (const [index, link] of links.entries()) {
      assert.equal(link.getAttribute('href'), oldLinks[index].getAttribute('href').replace('index.html', 'modern.html').replace('capabilities.html', 'modern-capabilities.html'));
      const href = link.getAttribute('href');
      if (href.startsWith('#')) assert.ok(doc.getElementById(href.slice(1)));
      if (href.startsWith('modern')) {
        const [file, id] = href.split('#');
        const target = new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8'));
        if (id) assert.ok(target.window.document.getElementById(id));
        target.window.close();
      }
    }
    for (const img of doc.images) {
      assert.equal(img.getAttribute('src'), img.closest('header') ? 'app_logo-black-text.png' : 'app_logo-white-text.png');
      assert.equal(img.alt, 'OOGIID');
      assert.ok(existsSync(new URL(img.getAttribute('src'), import.meta.url)));
    }
    before.window.close(); after.window.close();
  });
  for (const host of ['localhost', '127.0.0.1', '[::1]', 'website.example.test', 'localhost.example.test']) {
    test(`${redesigned} runs standalone and preserves navigation on ${host}`, () => {
      const dom = new JSDOM(source, { url: `http://${host}:5173/${redesigned}`, runScripts: 'dangerously' });
      const doc = dom.window.document;
      const origin = ['localhost', '127.0.0.1', '[::1]'].includes(host) ? 'http://localhost:4200' : 'https://oogiid-ui.onrender.com';
      for (const link of doc.querySelectorAll('[data-app-path]')) assert.equal(link.href, `${origin}${link.dataset.appPath}`);
      const button = doc.querySelector('.menu-toggle');
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'true');
      assert.equal(button.getAttribute('aria-label'), 'Close navigation');
      assert.ok(doc.querySelector('.site-nav').classList.contains('open'));
      assert.ok(doc.body.classList.contains('menu-open'));
      button.click();
      assert.equal(button.getAttribute('aria-expanded'), 'false');
      assert.equal(doc.body.classList.contains('menu-open'), false);
      const anchor = doc.querySelector('.site-nav a[href^="#"]');
      if (anchor) {
        button.click(); anchor.click();
        assert.equal(button.getAttribute('aria-expanded'), 'false');
      }
      Object.defineProperty(dom.window, 'scrollY', { value: 13, writable: true });
      dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.ok(doc.querySelector('.site-header').classList.contains('scrolled'));
      dom.window.scrollY = 12;
      dom.window.dispatchEvent(new dom.window.Event('scroll'));
      assert.equal(doc.querySelector('.site-header').classList.contains('scrolled'), false);
      assert.match(doc.querySelector('#year').textContent, /^\d{4}$/);
      assert.ok([...doc.querySelectorAll('.reveal')].every(element => element.classList.contains('visible')));
      dom.window.close();
    });
  }
  test(`${redesigned} opens directly from disk with working menu and production account links`, () => {
    const dom = new JSDOM(source, { url: new URL(redesigned, import.meta.url).href, runScripts: 'dangerously' });
    dom.window.document.querySelector('.menu-toggle').click();
    assert.equal(dom.window.document.querySelector('.menu-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(dom.window.document.querySelector('[data-app-path="/signup"]').href, 'https://oogiid-ui.onrender.com/signup');
    dom.window.close();
  });
}


for (const [primary, reference] of [['capabilities.html', 'modern-capabilities.html']]) {
  test(`${primary} retains the legacy capabilities design and working account navigation`, () => {
    const source = readFileSync(new URL(primary, import.meta.url), 'utf8');
    const expected = readFileSync(new URL(reference, import.meta.url), 'utf8')
      .replaceAll('modern-capabilities.html', 'capabilities.html').replaceAll('modern.html', 'index.html').replaceAll('index-images.html', 'index.html');
    assert.equal(source, expected);
    const dom = new JSDOM(source, { url: `https://dhineshdevelop-rgb.github.io/oogiid-website/${primary}`, runScripts: 'dangerously' });
    const doc = dom.window.document;
    assert.equal(doc.querySelector('script').textContent.trim(), behavior.trim());
    assert.ok(doc.querySelector('style').textContent.includes('@media(max-width:760px)'));
    for (const link of doc.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      assert.ok(!href.includes('modern.html') && !href.includes('modern-capabilities.html'));
      // The legacy design's section links are verified on modern.html above.
      // Current primary-homepage destinations are verified in industrial.test.js.
      if (href.startsWith('#')) assert.ok(doc.getElementById(href.slice(1)));
    }
    assert.equal(doc.querySelector('[data-app-path="/signup"]').href, 'https://oogiid-ui.onrender.com/signup');
    assert.equal(doc.querySelector('[data-app-path="/login"]').href, 'https://oogiid-ui.onrender.com/login');
    const menu = doc.querySelector('.menu-toggle');
    menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
    menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'false');
    dom.window.close();
  });
}
