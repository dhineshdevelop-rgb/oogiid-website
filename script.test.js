import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';


const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const capabilities = readFileSync(new URL('./capabilities.html', import.meta.url), 'utf8');
const startup = new JSDOM(html, { url: 'https://website.example.test' });
globalThis.document = startup.window.document; globalThis.window = startup.window;
const { initNavigation, initObservers, initializeWebsite } = await import('./script.js');
delete globalThis.document; delete globalThis.window;
test('all website HTML pages link every account action to Render before JavaScript runs', () => {
  for (const file of readdirSync(new URL('.', import.meta.url)).filter(file => file.endsWith('.html'))) {
    const dom = new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8'));
    const links = [...dom.window.document.querySelectorAll('[data-app-path]')];
    assert.ok(links.length >= 5, file);
    for (const link of links) {
      assert.ok(['/login', '/signup'].includes(link.dataset.appPath), file);
      assert.equal(link.getAttribute('href'), `https://oogiid-ui.onrender.com${link.dataset.appPath}`, file);
    }
    dom.window.close();
  }
});
function fixture(source = html) { return new JSDOM(source, { url: 'https://website.example.test' }); }
test('navigation handles menu open, close and in-page links; scroll threshold and year', () => {
  const dom = fixture(); const { document: doc } = dom.window;
  dom.window.Date = class extends Date { constructor() { super('2030-01-01T00:00:00Z'); } };
  const links = initNavigation(doc, dom.window);
  const button = doc.querySelector('.menu-toggle'); const nav = doc.querySelector('.site-nav');
  assert.ok(links.length > 0);
  button.click(); assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(button.getAttribute('aria-label'), 'Close navigation'); assert.ok(nav.classList.contains('open'));
  assert.ok(doc.body.classList.contains('menu-open'));
  button.click(); assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click(); links[0].click(); assert.equal(button.getAttribute('aria-label'), 'Open navigation');
  assert.equal(doc.body.classList.contains('menu-open'), false);
  Object.defineProperty(dom.window, 'scrollY', { value: 13, writable: true });
  dom.window.dispatchEvent(new dom.window.Event('scroll')); assert.ok(doc.querySelector('.site-header').classList.contains('scrolled'));
  dom.window.scrollY = 12; dom.window.dispatchEvent(new dom.window.Event('scroll'));
  assert.equal(doc.querySelector('.site-header').classList.contains('scrolled'), false);
  assert.equal(doc.querySelector('#year').textContent, '2030'); dom.window.close();
});

test('navigation and initialization tolerate pages without optional elements', () => {
  const dom = fixture('<main><div class="reveal"></div></main>');
  assert.deepEqual(initNavigation(dom.window.document, dom.window), []);
  initializeWebsite(dom.window.document, dom.window);
  assert.ok(dom.window.document.querySelector('.reveal').classList.contains('visible'));
  dom.window.close();
});

test('observers reveal only intersecting targets and update matching navigation sections', () => {
  const dom = fixture(); const doc = dom.window.document; const instances = [];
  dom.window.IntersectionObserver = class {
    constructor(callback, options) { this.callback = callback; this.options = options; this.observed = []; this.unobserved = []; instances.push(this); }
    observe(element) { this.observed.push(element); }
    unobserve(element) { this.unobserved.push(element); }
  };
  const links = initNavigation(doc, dom.window); initObservers(doc, dom.window, links);
  const [reveal, sections] = instances;
  assert.equal(reveal.options.threshold, .12); assert.ok(reveal.observed.length > 4);
  assert.equal(reveal.observed[3].style.transitionDelay, '180ms');
  reveal.callback([{ target: reveal.observed[0], isIntersecting: false }]); assert.equal(reveal.unobserved.length, 0);
  reveal.callback([{ target: reveal.observed[0], isIntersecting: true }]);
  assert.ok(reveal.observed[0].classList.contains('visible')); assert.equal(reveal.unobserved[0], reveal.observed[0]);
  sections.callback([{ target: doc.querySelector('#partners'), isIntersecting: false }]);
  assert.equal(links.some(link => link.classList.contains('active')), false);
  sections.callback([{ target: doc.querySelector('#partners'), isIntersecting: true }]);
  assert.equal(links.find(link => link.classList.contains('active')).getAttribute('href'), '#partners');
  assert.ok(sections.observed.length > 0); dom.window.close();
});

test('entry point bootstraps automatically in the browser', () => {
  startup.window.document.querySelector('.menu-toggle').click();
  assert.equal(startup.window.document.querySelector('.menu-toggle').getAttribute('aria-expanded'), 'true');
  startup.window.close();
});

test('both website headers expose application signup and login links in the shared mobile navigation', () => {
  for (const file of ['index.html', 'capabilities.html']) {
    const dom = new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8'));
    const nav = dom.window.document.querySelector('#site-nav');
    assert.equal(nav.querySelector('a[href="https://oogiid-ui.onrender.com/signup"]').textContent.trim(), file === 'index.html' ? 'Share Requirement →' : 'Sign up');
    assert.equal(nav.querySelector('a[href="https://oogiid-ui.onrender.com/login"]').textContent, file === 'index.html' ? 'Login' : 'Log in');
    dom.window.close();
  }
});

for (const host of ['localhost', '127.0.0.1', '[::1]', 'website.example.test', 'localhost.example.test']) {
  test(`application links use the correct origin on ${host} for both pages`, () => {
    const origin = ['localhost', '127.0.0.1', '[::1]'].includes(host)
      ? 'http://localhost:4200' : 'https://oogiid-ui.onrender.com';
    for (const [source, loginLabel, signupLabel] of [[html, 'Login', 'Share Requirement →'], [capabilities, 'Log in', 'Sign up']]) {
      const dom = new JSDOM(source, { url: `http://${host}:5173` });
      initializeWebsite(dom.window.document, dom.window);
      const links = [...dom.window.document.querySelectorAll('[data-app-path]')];
      assert.ok(links.length >= 5);
      for (const link of links) assert.equal(link.href, `${origin}${link.dataset.appPath}`);
      assert.equal(dom.window.document.querySelector('.site-nav [data-app-path="/login"]').textContent, loginLabel);
      assert.equal(dom.window.document.querySelector('.site-nav [data-app-path="/signup"]').textContent.trim(), signupLabel);
      dom.window.close();
    }
  });
}

for (const [name, source] of [['homepage', html], ['capabilities', capabilities]]) {
  test(`${name} offers account actions without a project or enquiry form`, () => {
    const dom = fixture(source); const doc = dom.window.document;
    initializeWebsite(doc, dom.window);
    assert.equal(doc.querySelector('form, input, textarea, select, [data-inquiry], [data-inquiry-choice], #contact'), null);
    assert.doesNotMatch(doc.body.textContent, /start a project|upload a drawing|submit enquiry|login details will be emailed/i);
    assert.ok(doc.querySelector('main [data-app-path="/signup"]'));
    assert.ok(doc.querySelector('footer [data-app-path="/login"]'));
    assert.ok(doc.querySelector('footer [data-app-path="/signup"]'));
    for (const link of doc.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), 'https://website.example.test/');
      assert.notEqual(url.hash, '#contact');
      if (link.getAttribute('href').startsWith('#')) assert.ok(doc.querySelector(url.hash));
    }
    dom.window.close();
  });
}

test('website pages use the appropriate logo for their light or dark footer', () => {
  for (const file of ['index.html', 'capabilities.html', 'modern.html', 'modern-capabilities.html']) {
    const dom = new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8'));
    const doc = dom.window.document;
    assert.equal(doc.querySelector('header .brand img').getAttribute('src'), 'app_logo-black-text.png');
    assert.equal(doc.querySelector('footer .brand img').getAttribute('src'), file === 'index.html' ? 'app_logo-black-text.png' : 'app_logo-white-text.png');
    for (const img of doc.querySelectorAll('.brand img')) {
      assert.equal(img.width, 2000);
      assert.equal(img.height, 650);
      assert.equal(img.alt, 'OOGIID');
      assert.ok(readFileSync(new URL(img.getAttribute('src'), import.meta.url)).length > 0);
    }
    dom.window.close();
  }
});
