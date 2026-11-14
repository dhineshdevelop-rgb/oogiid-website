import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const pages = ['index.html', 'industrial-home-updated.html', 'industrial-capabilities-updated.html'];
for (const page of pages) {
  const source = readFileSync(new URL(page, import.meta.url), 'utf8');
  test(`${page}: accessible WhatsApp shortcut works without JavaScript`, () => {
    const dom = new JSDOM(source);
    const doc = dom.window.document;
    const button = doc.querySelector('.whatsapp-float');
    assert.equal(doc.querySelectorAll('.whatsapp-float').length, 1);
    assert.equal(button.parentElement, doc.body);
    assert.equal(button.getAttribute('href'), 'https://wa.me/919600112025');
    assert.equal(button.getAttribute('aria-label'), 'Chat with OOGIID on WhatsApp');
    assert.equal(button.querySelector('svg').getAttribute('aria-hidden'), 'true');
    assert.ok(button.querySelector('svg path').getAttribute('d').length > 0);
    for (const link of doc.querySelectorAll('a[href^="https://wa.me/"]')) {
      assert.equal(link.target, '_blank');
      assert.ok(link.relList.contains('noopener'));
      assert.ok(link.relList.contains('noreferrer'));
    }
    const css = [...doc.styleSheets[0].cssRules];
    const shortcut = css.find(rule => rule.selectorText === '.whatsapp-float').style;
    assert.equal(shortcut.position, 'fixed');
    assert.equal(shortcut.width, '56px');
    assert.equal(shortcut.height, '56px');
    assert.match(shortcut.right, /safe-area-inset-right/);
    assert.match(shortcut.bottom, /safe-area-inset-bottom/);
    const header = css.find(rule => rule.selectorText === '.site-header').style;
    assert.ok(Number(shortcut.getPropertyValue('z-index')) > Number(header.getPropertyValue('z-index')));
    assert.ok(css.some(rule => rule.selectorText === '.whatsapp-float:focus-visible'));
    assert.match(source, /footer\{padding-bottom:calc\(96px \+ env\(safe-area-inset-bottom/);
    assert.match(source, /@media\(max-width:650px\)\{\.contact-grid\{grid-template-columns:1fr/);
    dom.window.close();
  });
  test(`${page}: header and footer contact links reach the homepage section`, () => {
    const dom = new JSDOM(source, { url: `https://example.test/oogiid-website/${page}`, runScripts: 'dangerously' });
    const doc = dom.window.document;
    const href = page.includes('capabilities') ? 'industrial-home-updated.html#contact' : '#contact';
    for (const selector of ['.site-nav', '.footer-links']) {
      assert.equal(doc.querySelector(`${selector} a[href="${href}"]`).textContent, 'Contact Us');
    }
    const toggle = doc.querySelector('.menu-toggle');
    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.ok(doc.querySelector('.whatsapp-float'));
    if (!page.includes('capabilities')) {
      doc.querySelector('.site-nav a[href="#contact"]').click();
      assert.equal(toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(doc.body.classList.contains('menu-open'), false);
    }
    dom.window.close();
  });
  if (page.includes('capabilities')) continue;
  test(`${page}: contact section contains the PDF email, phones and both offices`, () => {
    const dom = new JSDOM(source);
    const doc = dom.window.document;
    const section = doc.querySelector('main #contact');
    assert.equal(doc.getElementById(section.getAttribute('aria-labelledby')).textContent, 'Contact Us');
    assert.equal(section.querySelector('a[href^="mailto:"]').getAttribute('href'), 'mailto:oogiid.ex@gmail.com');
    assert.deepEqual([...section.querySelectorAll('a[href^="tel:"]')].map(link => [link.getAttribute('href'), link.textContent]), [
      ['tel:+919600112025', '+91 9600112025'], ['tel:+919282209694', '+91 9282209694'],
    ]);
    assert.deepEqual([...section.querySelectorAll('address')].map(address => address.textContent), [
      'No.2/380, Vignesh Nagar,Ashok Leyland 2nd plant Opp,Thorapalli Agraharam,Hosur–635109.',
      'No.3, Sakthi Nagar,Keelkattalai,Chennai–600117.',
    ]);
    assert.equal(section.querySelector('form'), null);
    dom.window.close();
  });
}
