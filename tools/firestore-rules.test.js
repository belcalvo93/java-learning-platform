/**
 * JavaMaster — Tests TDD para firestore.rules (C-13 T-13.2)
 *
 * Valida estáticamente las reglas de seguridad de Firestore y
 * simula la lógica del predicado isValidUserPayload para prevenir
 * escalado de privilegios y garantizar el esquema estricto.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('C-13 T-13.2: Estructura de firestore.rules', () => {
  const rulesPath = path.join(__dirname, '..', 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('declara rules_version = "2"', () => {
    assert.match(rulesContent, /rules_version\s*=\s*['"]2['"]/);
  });

  it('aplica denegación por defecto al final', () => {
    assert.match(rulesContent, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
  });

  it('aísla users/{userId} exclusivamente al propietario (isOwner)', () => {
    assert.match(rulesContent, /match\s+\/users\/\{userId\}\s*\{[\s\S]*allow\s+read:\s*if\s+isOwner\(userId\);/);
    assert.match(rulesContent, /allow\s+create,\s*update:\s*if\s+isOwner\(userId\)\s*&&\s*isValidUserPayload\(request\.resource\.data\);/);
    assert.match(rulesContent, /allow\s+delete:\s*if\s+isOwner\(userId\);/);
  });

  it('bloquea toda escritura cliente en admins/{userId}', () => {
    assert.match(rulesContent, /match\s+\/admins\/\{userId\}\s*\{[\s\S]*allow\s+write:\s*if\s+false;/);
  });

  it('protege stats/{docId} permitiendo solo lectura para isAdmin() y write: false', () => {
    assert.match(rulesContent, /match\s+\/stats\/\{docId\}\s*\{[\s\S]*allow\s+read:\s*if\s+isAdmin\(\);[\s\S]*allow\s+write:\s*if\s+false;/);
  });

  it('prohíbe expresamente campos role e isAdmin en isValidUserPayload', () => {
    assert.match(rulesContent, /!\('role'\s+in\s+data\)/);
    assert.match(rulesContent, /!\('isAdmin'\s+in\s+data\)/);
  });

  it('acota tamaños de listas a 52 lecciones y 208 ejercicios', () => {
    assert.match(rulesContent, /data\.completedLessons\.size\(\)\s*<=\s*52/);
    assert.match(rulesContent, /data\.completedExercises\.size\(\)\s*<=\s*208/);
  });
});

describe('C-13 T-13.2: Simulación de contrato isValidUserPayload', () => {
  const ALLOWED_KEYS = new Set([
    'email', 'displayName', 'country', 'completedLessons', 'completedExercises',
    'evaluationResults', 'certificate', 'privacyAcceptedAt',
    'createdAt', 'updatedAt'
  ]);
  const ALLOWED_LEVELS = new Set(['beginner', 'intermediate', 'advanced', 'expert']);

  function simulateIsValidUserPayload(data) {
    if (!data || typeof data !== 'object') return false;
    const keys = Object.keys(data);
    for (const k of keys) {
      if (!ALLOWED_KEYS.has(k)) return false;
    }
    if ('role' in data || 'isAdmin' in data) return false;
    if (!Array.isArray(data.completedLessons) || data.completedLessons.length > 52) return false;
    if (!Array.isArray(data.completedExercises) || data.completedExercises.length > 208) return false;
    if (!data.evaluationResults || typeof data.evaluationResults !== 'object' || Array.isArray(data.evaluationResults)) return false;
    for (const lvl of Object.keys(data.evaluationResults)) {
      if (!ALLOWED_LEVELS.has(lvl)) return false;
    }
    return true;
  }

  it('acepta un payload legítimo completo', () => {
    const valid = {
      email: 'estudiante@test.com',
      displayName: 'Ana',
      country: 'Argentina',
      completedLessons: [1, 2, 3],
      completedExercises: [1, 2, 3, 4],
      evaluationResults: {
        beginner: { score: 90, passed: true }
      },
      privacyAcceptedAt: '2026-10-24T12:00:00.000Z',
      createdAt: '2026-10-24T12:00:00.000Z',
      updatedAt: '2026-10-24T12:00:00.000Z'
    };
    assert.equal(simulateIsValidUserPayload(valid), true);
  });

  it('rechaza inyección de role: "admin"', () => {
    const malicious = {
      email: 'hacker@test.com',
      role: 'admin',
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {}
    };
    assert.equal(simulateIsValidUserPayload(malicious), false);
  });

  it('rechaza inyección de isAdmin: true', () => {
    const malicious = {
      email: 'hacker@test.com',
      isAdmin: true,
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {}
    };
    assert.equal(simulateIsValidUserPayload(malicious), false);
  });

  it('rechaza claves desconocidas o arbitrarias', () => {
    const invalid = {
      email: 'test@test.com',
      codigoFuenteJava: 'public class Malicioso {}',
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {}
    };
    assert.equal(simulateIsValidUserPayload(invalid), false);
  });

  it('rechaza más de 52 lecciones o más de 208 ejercicios', () => {
    const tooManyLessons = {
      email: 'test@test.com',
      completedLessons: Array.from({ length: 53 }, (_, i) => i + 1),
      completedExercises: [],
      evaluationResults: {}
    };
    assert.equal(simulateIsValidUserPayload(tooManyLessons), false);

    const tooManyExercises = {
      email: 'test@test.com',
      completedLessons: [],
      completedExercises: Array.from({ length: 209 }, (_, i) => i + 1),
      evaluationResults: {}
    };
    assert.equal(simulateIsValidUserPayload(tooManyExercises), false);
  });

  it('rechaza niveles de evaluación no autorizados', () => {
    const invalidLevel = {
      email: 'test@test.com',
      completedLessons: [],
      completedExercises: [],
      evaluationResults: {
        super_expert: { score: 100, passed: true }
      }
    };
    assert.equal(simulateIsValidUserPayload(invalidLevel), false);
  });
});
