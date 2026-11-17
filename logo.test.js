import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';

const styles = readFileSync(new URL('styles.css', import.meta.url), 'utf8');
const logoStyles = styles.slice(styles.indexOf('/* Split logo artwork:'));

test('all pages display separate symbol and wordmark assets with accessible links and normal outside alignment', () => {
  for (const page of readdirSync(new URL('.', import.meta.url)).filter(file => file.endsWith('.html'))) {
    const dom = new JSDOM(readFileSync(new URL(page, import.meta.url), 'utf8'));
    const doc = dom.window.document;
    assert.ok(doc.querySelector('style').textContent.trim().endsWith(logoStyles.trim()), page);
    for (const logo of doc.querySelectorAll('header .brand, footer .brand')) {
      assert.ok(logo.getAttribute('href').includes('home') || /^(index|modern)/.test(logo.getAttribute('href')));
      assert.equal(logo.getAttribute('aria-label'), 'OOGIID home');
      const variant = logo.dataset.logoVariant;
      assert.ok(['black', 'white'].includes(variant));
      assert.equal(logo.querySelectorAll('img').length, 2);
      const symbol = logo.querySelector('.brand-symbol');
      const wordmark = logo.querySelector('.brand-wordmark');
      assert.equal(symbol.getAttribute('src'), `app_logo-${variant}-symbol.png`);
      assert.equal(wordmark.getAttribute('src'), `app_logo-${variant}-wordmark.png`);
      assert.equal(symbol.alt, '');
      assert.equal(symbol.getAttribute('aria-hidden'), 'true');
      assert.equal(wordmark.alt, 'OOGIID');
      assert.deepEqual([symbol.width, symbol.height], variant === 'white' ? [336, 333] : [420, 415]);
      assert.deepEqual([wordmark.width, wordmark.height], [642, 222]);
    }
    const rules = [...doc.querySelector('style').sheet.cssRules];
    const frame = rules.findLast(rule => rule.selectorText === '.site-header .brand, footer .brand, .footer-top .brand').style;
    assert.equal(frame.height, 'auto');
    assert.equal(frame.width, 'auto');
    assert.equal(frame.overflow, 'visible');
    assert.equal(frame.display, 'flex');
    assert.equal(frame.getPropertyValue('align-items'), 'center');
    assert.equal(frame.getPropertyValue('gap'), 'var(--logo-gap)');
    const image = rules.findLast(rule => rule.selectorText === '.site-header .brand img, footer .brand img').style;
    assert.equal(image.position, 'static');
    assert.equal(image.height, 'auto');
    assert.equal(image.transform, 'none');
    assert.equal(image.left, 'auto');
    assert.equal(image.top, 'auto');
    assert.equal(rules.findLast(rule => rule.selectorText === '.site-header .brand').style.getPropertyValue('align-self'), 'center');
    assert.ok(!logoStyles.includes('%'));
    dom.window.close();
  }
});

test('every responsive size reduces symbol width and height by ten percent while preserving text size and gap', () => {
  const dom = new JSDOM(`<style>${logoStyles}</style>`);
  const rules = [...dom.window.document.querySelector('style').sheet.cssRules];
  const declarations = rules.flatMap(rule => rule.cssRules ? [...rule.cssRules] : [rule]);
  const sizes = declarations.filter(rule => rule.style?.getPropertyValue('--logo-symbol-width'));
  assert.equal(sizes.length, 6);
  for (const [index, previousWidth] of [215, 232, 260, 180, 185, 175].entries()) {
    const style = sizes[index].style;
    const white = previousWidth === 260;
    const sourceWidth = white ? 1006 : 1090;
    const symbolWidth = white ? 336 : 420;
    const symbolHeight = white ? 333 : 415;
    for (const key of ['--logo-symbol-width', '--logo-wordmark-width', '--logo-gap']) assert.match(style.getPropertyValue(key), /^\d+\.\d+px$/);
    const newWidth = parseFloat(style.getPropertyValue('--logo-symbol-width'));
    const textWidth = parseFloat(style.getPropertyValue('--logo-wordmark-width'));
    const gap = parseFloat(style.getPropertyValue('--logo-gap'));
    const oldSymbolWidth = previousWidth / sourceWidth * symbolWidth;
    const oldSymbolHeight = previousWidth / sourceWidth * symbolHeight;
    assert.ok(Math.abs(newWidth / oldSymbolWidth - 0.9) < 0.000001);
    assert.ok(Math.abs((newWidth / symbolWidth * symbolHeight) / oldSymbolHeight - 0.9) < 0.000001);
    assert.ok(Math.abs(textWidth - previousWidth / sourceWidth * 642) < 0.000001);
    assert.ok(Math.abs(textWidth / 642 * 222 - previousWidth / sourceWidth * 222) < 0.000001);
    assert.ok(Math.abs(gap - previousWidth / sourceWidth * 28) < 0.000001);
  }
  assert.equal(rules.find(rule => rule.selectorText === '.site-header .brand .brand-symbol, footer .brand .brand-symbol').style.width, 'var(--logo-symbol-width)');
  assert.equal(rules.find(rule => rule.selectorText === '.site-header .brand .brand-wordmark, footer .brand .brand-wordmark').style.width, 'var(--logo-wordmark-width)');
  dom.window.close();
});

for (const [variant, width, height, pixelHash] of [
  ['black', 1090, 415, 'acdf1fdf22429014e6011016584753c73bd9cd2da3e159584fb80ab6e218e079'],
  ['white', 1006, 333, 'c47c1bb7d28660e7ae1833e0fbe44f7229e149f80d07cffa2fbe89f003b20ebf'],
  ['black-symbol', 420, 415, '049aece2ae60c9b545f0756734102e4a13a2e3c39cb8bbc538bc742e1238e5e2'],
  ['black-wordmark', 642, 222, 'c5c0c46b563137d13037236253b8f8ec2af73691cc2217faf6ae0d6ae9f3c9d7'],
  ['white-symbol', 336, 333, '1d3e9dc7724afc1897126046665a6cf58fe251ad8cb8f431687298eea4d39b3f'],
  ['white-wordmark', 642, 222, '5a94d55d115df9709c720b6def76366ec48a6ce375aca576cf8a9a2bef531cc9'],
]) {
  test(`${variant} PNG has no transparent border and exactly preserves the original artwork pixels`, () => {
    const bytes = readFileSync(new URL(`app_logo-${variant}${variant.includes('-') ? '' : '-text'}.png`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
    assert.deepEqual([...bytes.subarray(24, 29)], [8, 6, 0, 0, 0]);
    const chunks = [];
    for (let offset = 8; offset < bytes.length;) {
      const length = bytes.readUInt32BE(offset);
      if (bytes.subarray(offset + 4, offset + 8).toString() === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const raw = inflateSync(Buffer.concat(chunks));
    const stride = width * 4;
    assert.equal(raw.length, (stride + 1) * height);
    const rows = [];
    for (let y = 0; y < height; y++) {
      assert.equal(raw[y * (stride + 1)], 0, 'lossless trim stores unfiltered RGBA scanlines');
      rows.push(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    }
    const pixels = Buffer.concat(rows);
    // Hash was calculated from the decoded pre-trim source rectangle, before writing either PNG.
    assert.equal(createHash('sha256').update(pixels).digest('hex'), pixelHash);
    const edges = [[], [], [], []];
    for (let x = 0; x < width; x++) {
      edges[0].push(pixels[x * 4 + 3]);
      edges[1].push(pixels[((height - 1) * width + x) * 4 + 3]);
    }
    for (let y = 0; y < height; y++) {
      edges[2].push(pixels[(y * width) * 4 + 3]);
      edges[3].push(pixels[(y * width + width - 1) * 4 + 3]);
    }
    for (const edge of edges) assert.ok(edge.some(alpha => alpha > 0), 'no entire edge may be transparent');
    assert.ok(pixels.some((value, index) => index % 4 === 3 && value === 0), 'transparent background is preserved');
  });
}
