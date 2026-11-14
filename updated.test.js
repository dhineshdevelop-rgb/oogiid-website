import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const pages = ['industrial-home-updated.html', 'industrial-capabilities-updated.html'];
const behavior = readFileSync(new URL('./script.js', import.meta.url), 'utf8').replaceAll('export function ', 'function ');
const roles = [
  ['OOGIID’s engineering capability', 'Technical review, design support, costing and project coordination.'],
  ['OOGIID’s manufacturing network', 'Validated partner capabilities available for specific requirements.'],
  ['OOGIID’s execution role', 'Connecting and coordinating the work through completion.'],
];

for (const page of pages) {
  const source = readFileSync(new URL(page, import.meta.url), 'utf8');
  test(`${page}: standalone content, early role positioning, assets and preview navigation`, () => {
    const dom = new JSDOM(source);
    const doc = dom.window.document;
    const original = new JSDOM(readFileSync(new URL(page.replace('-updated', ''), import.meta.url), 'utf8'));
    assert.equal(doc.querySelector('script').textContent.trim(), behavior.trim());
    assert.equal(doc.querySelector('script[src], link[rel="stylesheet"]'), null);
    assert.equal(doc.querySelectorAll('h1').length, 1);
    const ids = [...doc.querySelectorAll('[id]')].map(element => element.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(doc.querySelector('.hero + .positioning'));
    const articles = [...doc.querySelectorAll('.role-grid article')];
    assert.equal(articles.length, roles.length);
    for (const [index, [heading, copy]] of roles.entries()) {
      assert.equal(articles[index].querySelector('h3').textContent, heading);
      assert.equal(articles[index].querySelector('p').textContent, copy);
    }
    assert.deepEqual([...doc.images].map(img => img.outerHTML), [...original.window.document.images].map(img => img.outerHTML));
    for (const img of doc.images) assert.ok(existsSync(new URL(img.getAttribute('src'), import.meta.url)));
    for (const link of doc.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (/^(mailto:|tel:|https:\/\/wa\.me\/)/.test(href)) continue;
      if (link.hasAttribute('data-app-path')) {
        assert.equal(href, `https://oogiid-ui.onrender.com${link.dataset.appPath}`);
        continue;
      }
      const [file, fragment] = href.split('#');
      assert.ok(!file || pages.includes(file), href);
      assert.notEqual(href, '#');
      const target = file ? new JSDOM(readFileSync(new URL(file, import.meta.url), 'utf8')) : dom;
      if (fragment) assert.ok(target.window.document.getElementById(fragment), href);
      if (target !== dom) target.window.close();
    }
    assert.ok(doc.querySelector('noscript').textContent.includes('.site-nav{display:flex'));
    original.window.close();
    dom.window.close();
  });
  for (const url of [`http://localhost:5173/${page}`, `https://example.test/oogiid-website/${page}`, new URL(page, import.meta.url).href]) {
    test(`${page}: account routing and mobile menu behavior on ${url}`, () => {
      const dom = new JSDOM(source, { url, runScripts: 'dangerously' });
      const doc = dom.window.document;
      const origin = url.startsWith('http://localhost:') ? 'http://localhost:4200' : 'https://oogiid-ui.onrender.com';
      for (const link of doc.querySelectorAll('[data-app-path]')) assert.equal(link.href, `${origin}${link.dataset.appPath}`);
      const toggle = doc.querySelector('.menu-toggle');
      toggle.click();
      assert.equal(toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(toggle.getAttribute('aria-label'), 'Close navigation');
      assert.ok(doc.querySelector('.site-nav').classList.contains('open'));
      toggle.click();
      assert.equal(toggle.getAttribute('aria-expanded'), 'false');
      toggle.click();
      const anchor = doc.querySelector('.site-nav a[href^="#"]');
      if (anchor) anchor.click();
      else toggle.click();
      assert.equal(toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(doc.body.classList.contains('menu-open'), false);
      assert.equal(doc.querySelectorAll('.reveal:not(.visible)').length, 0);
      dom.window.close();
    });
  }
}

test('homepage preserves the complete supplied company story verbatim', () => {
  const dom = new JSDOM(readFileSync(new URL(pages[0], import.meta.url), 'utf8'));
  const about = dom.window.document.getElementById('about');
  assert.equal(about.querySelector('h2').textContent, 'Connecting Engineering Expertise with Manufacturing Possibilities.');
  assert.deepEqual([...about.querySelectorAll('.about-copy p')].map(p => p.textContent), [
    'OOGIID is an engineering-led manufacturing ecosystem built to connect industrial requirements with the right engineering expertise, manufacturing capabilities and supply-chain partnerships.',
    "Rooted in India's engineering and manufacturing strengths, we bring together businesses, engineering professionals, machine builders and manufacturing partners to create meaningful industrial connections and practical manufacturing solutions.",
    'By combining engineering knowledge, collaborative partnerships and coordinated execution, OOGIID aims to simplify manufacturing, unlock new opportunities and create value across the industrial ecosystem.',
    "Our ambition is to strengthen India's manufacturing potential and connect its capabilities with opportunities across global markets.",
  ]);
  assert.deepEqual([...about.querySelectorAll('.story-grid h3')].map(h => h.textContent), ['Our Vision', 'Our Mission', 'Our Philosophy']);
  assert.deepEqual([...about.querySelectorAll('.story-grid p')].map(p => p.textContent), [
    "To shape the future of global manufacturing by transforming India's engineering and manufacturing strengths into world-class capabilities, connecting industries, innovation and opportunities across borders.",
    "To strengthen India's manufacturing ecosystem by connecting industrial requirements with engineering expertise, capable manufacturing partners and collaborative supply-chain solutions — creating opportunities to serve industries in India and across the world.",
    'We believe manufacturing progress happens when the right people, engineering knowledge and capabilities come together.',
    'Through collaboration, innovation and a commitment to practical execution, we strive to make industrial opportunities more accessible and turn possibilities into reality.',
  ]);
  assert.deepEqual([...about.querySelectorAll('.story-signoff p')].map(p => p.textContent), ['OOGIID — Made in India. Connected to the World.', 'Make More Possible. With Us.']);
  assert.ok(!about.textContent.includes('an engineering and manufacturing company'));
  const steps = [...dom.window.document.querySelectorAll('.step p')];
  assert.equal(steps.length, 6);
  assert.equal(steps[4].textContent, 'Manufacturing partners build; OOGIID coordinates execution against your requirement.');
  assert.equal(steps[5].textContent, 'OOGIID coordinates quality requirements and delivery with manufacturing partners.');
  dom.window.close();
});

test('capability categories, offerings and destinations are retained with explicit partner delivery', () => {
  const home = new JSDOM(readFileSync(new URL(pages[0], import.meta.url), 'utf8'));
  const detail = new JSDOM(readFileSync(new URL(pages[1], import.meta.url), 'utf8'));
  const original = new JSDOM(readFileSync(new URL('industrial-capabilities.html', import.meta.url), 'utf8'));
  const sections = [...detail.window.document.querySelectorAll('.detail')];
  assert.equal(sections.length, 6);
  assert.deepEqual([...detail.window.document.querySelectorAll('.offering-list li')].map(li => li.textContent), [...original.window.document.querySelectorAll('.offering-list li')].map(li => li.textContent));
  const cards = [...home.window.document.querySelectorAll('.cap-card')];
  assert.equal(cards.length, 6);
  for (const [index, section] of sections.entries()) {
    assert.equal(cards[index].getAttribute('href'), `${pages[1]}#${section.id}`);
    assert.equal(cards[index].querySelector('h3').textContent, section.querySelector('h2').textContent);
    assert.match(section.querySelector('.detail-copy > p:not(.eyebrow)').textContent, /OOGIID/);
  }
  assert.equal(detail.window.document.querySelector('.scope-note').textContent, 'Manufacturing capabilities are available through validated partners for specific requirements. Project scope, process availability, tolerances and capacity are confirmed during review.');
  for (const dom of [home, detail, original]) dom.window.close();
});
