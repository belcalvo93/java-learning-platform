'use strict';

/**
 * C-12b UI Polish — Tests de integridad de codificación UTF-8, identidad visual,
 * selector de modo día/noche y guías de indentación dinámicas.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const FRONTEND_FILES = [
  'index.html',
  'script.js',
  'script-enhanced.js',
  'lesson-nav.js',
  'data.js',
  'validator.js',
  'styles.css',
  'colors-feminine.css',
  'modules-view.css'
];

const UI_FILES = [
  'index.html',
  'script.js',
  'script-enhanced.js',
  'lesson-nav.js',
  'styles.css',
  'colors-feminine.css',
  'modules-view.css'
];

const MOJIBAKE_PATTERNS = [
  /Ã³/,
  /Ã±/,
  /Ã¡/,
  /Ã©/,
  /Ã­/,
  /Ãº/,
  /Ã‰/,
  /Ã“/,
  /Ã‘/,
  /ðŸ/,
  /â€œ/,
  /â€\x9d/,
  /â€”/,
  /â€“/,
  /Â¿/,
  /Â¡/
];

describe('C-12b — 1. Integridad UTF-8 sin BOM, U+FFFD, mojibake ni "??" en textos visibles', () => {
  for (const rel of FRONTEND_FILES) {
    it(`${rel} está en UTF-8 sin BOM, sin U+FFFD y sin secuencias de mojibake`, () => {
      const fullPath = path.join(ROOT, rel);
      const buf = fs.readFileSync(fullPath);
      const hasBom = buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
      assert.equal(hasBom, false, `${rel} no debe tener UTF-8 BOM`);

      const text = buf.toString('utf8');
      assert.equal(text.includes('\uFFFD'), false, `${rel} no debe contener U+FFFD`);

      for (const rx of MOJIBAKE_PATTERNS) {
        assert.equal(rx.test(text), false, `${rel} no debe contener mojibake (${rx})`);
      }
    });
  }

  for (const rel of UI_FILES) {
    it(`${rel} no contiene "??" en textos visibles ni "?" reemplazando tildes/ñ`, () => {
      const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      // En JS/HTML/CSS no debe haber '?? ' ni '"??' (emoji roto) ni palabras con '?' en medio de letras
      assert.equal(
        /['"`]\s*\?\?/.test(text),
        false,
        `${rel} contiene "??" al inicio de un literal de texto`
      );
      assert.equal(
        />\s*\?\?/.test(text),
        false,
        `${rel} contiene "??" dentro de un nodo HTML`
      );
      const withoutQueryStrings = text.replace(/\.(?:js|css|html|png|svg|woff2?)\?v=[0-9.]+/gi, '');
      const brokenWordMatch = withoutQueryStrings.match(/(?<![.\w])[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}\?[a-záéíóúüñ]+/);
      assert.equal(
        brokenWordMatch,
        null,
        `${rel} contiene palabra rota con "?": ${brokenWordMatch ? brokenWordMatch[0] : ''}`
      );
    });
  }

  it('index.html declara <meta charset="utf-8">', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.match(html, /<meta\s+charset=["']utf-8["']\s*\/?>/i);
  });

  it('script-enhanced.js muestra "Descargar Material de Estudio" y "Tomar Evaluación" íntegros', () => {
    const src = fs.readFileSync(path.join(ROOT, 'script-enhanced.js'), 'utf8');
    assert.ok(src.includes('Descargar Material de Estudio'), 'Falta Descargar Material de Estudio');
    assert.ok(src.includes('Tomar Evaluación'), 'Falta Tomar Evaluación con tilde');
    assert.equal(src.includes('Tomar Evaluaci?n'), false, 'No debe contener Tomar Evaluaci?n');
  });

  it('script.js capitaliza "Tu progreso se guarda solo en este navegador"', () => {
    const src = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(
      src.includes("LOCAL_ONLY_NOTICE = 'Tu progreso se guarda solo en este navegador'"),
      'LOCAL_ONLY_NOTICE debe comenzar con mayúscula'
    );
  });
});

describe('C-12b — 2. Identidad visual, logo SVG propio, selector día/noche y acento sólido', () => {
  it('index.html enlaza Plus Jakarta Sans, Inter y Fira Code y no usa ☕ en el logo', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.match(html, /Plus\+Jakarta\+Sans/);
    assert.match(html, /Inter/);
    assert.match(html, /Fira\+Code/);
    assert.equal(html.includes('☕'), false, 'El logo no debe usar el emoji ☕');
    assert.match(html, /class="logo"[\s\S]*?<svg[\s\S]*?JavaMaster/);
  });

  it('index.html incluye #theme-toggle accesible y script inicial anti-flash con try/catch', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.match(html, /id="theme-toggle"/);
    assert.match(html, /aria-label="[^"]+"/);
    assert.match(html, /aria-pressed="(true|false)"/);
    assert.match(html, /javamaster_theme/);
    assert.match(html, /dataset\.theme/);
  });

  it('styles.css define temas dark y light por data-theme, acento primario sólido y colores de nivel desaturados', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.match(css, /html\[data-theme="dark"\]/);
    assert.match(css, /html\[data-theme="light"\]/);
    assert.match(css, /--bg-primary:\s*#021F1D/i);
    assert.match(css, /--level-intermediate:\s*#6c96b3/i);
  });
});
