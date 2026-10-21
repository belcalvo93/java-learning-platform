// Append to existing script.js - New Features

// ============================================
// EJERCICIOS INTERACTIVOS
// ============================================

function openExercise(exerciseId) {
  const exercise = exercisesData.find(e => e.id === exerciseId);
  if (!exercise) return;

  const viewer = document.getElementById('exercise-viewer');
  const content = document.getElementById('exercise-content');
  content.dataset.exerciseId = String(exercise.id);

  // C-11b: navegación dentro de la lección actual + función única de disponibilidad
  const nav = (typeof LessonNav !== 'undefined' && LessonNav.getLessonNav)
    ? LessonNav.getLessonNav(exercisesData, lessonsData, exercise.id)
    : null;
  const prevExercise = nav ? nav.prev : null;
  const prevAvailable = prevExercise
    ? ((typeof LessonNav !== 'undefined' && LessonNav.isAvailable) ? LessonNav.isAvailable('exercise', prevExercise.id) : true)
    : false;
  let nextLabel = 'Siguiente Ejercicio →';
  let nextOnClick = '';
  let nextDisabled = true;
  if (nav && nav.advance) {
    if (nav.advance.type === 'exercise' && nav.advance.target) {
      nextLabel = 'Siguiente Ejercicio →';
      nextOnClick = `openExercise(${nav.advance.target.id})`;
      nextDisabled = !nav.advance.available;
    } else if (nav.advance.type === 'lesson' && nav.advance.target) {
      nextLabel = 'Siguiente Lección →';
      nextOnClick = `closeExercise(); openLesson(${nav.advance.target.id})`;
      nextDisabled = !nav.advance.available;
    } else {
      nextLabel = 'Siguiente Lección →';
      nextDisabled = true;
    }
  }

  content.innerHTML = `
    <button class="lesson-close" onclick="closeExercise()">×</button>
    <h2>${exercise.title}</h2>
    <p>${exercise.description}</p>
    
    <div class="exercise-editor">
      <div class="editor-with-gutter">
        <div class="line-numbers" id="line-numbers" aria-hidden="true">1</div>
        <div class="editor-area">
          <div class="indent-guides" aria-hidden="true"><div id="indent-guides"></div></div>
          <textarea class="exercise-textarea" id="exercise-code" spellcheck="false">${exercise.starterCode}</textarea>
        </div>
      </div>
      <div class="exercise-actions">
        <button class="btn-primary" onclick="checkExercise(${exercise.id})">✓ Verificar Solución</button>
        <button class="btn-secondary" onclick="showHint(${exercise.id})">💡 Ver Pista</button>
        <button class="btn-secondary" onclick="resetExercise(${exercise.id})">↻ Reiniciar</button>
      </div>
      <div id="exercise-result"></div>
      <div id="exercise-hint" style="display: none;" class="exercise-hint"></div>
    </div>
    
    <div class="lesson-navigation" style="margin-top: 2rem;">
      <button class="nav-btn" data-nav="prev" onclick="${prevExercise ? `openExercise(${prevExercise.id})` : ''}" ${!prevExercise || !prevAvailable ? 'disabled' : ''}>
        ← Ejercicio Anterior
      </button>
      <button class="nav-btn" data-nav="all" onclick="showExercisesMenu()">
        📋 Ver Todos los Ejercicios
      </button>
      <button class="nav-btn" data-nav="back" onclick="closeExercise()">
        Volver a Lecciones
      </button>
      <button class="nav-btn" data-nav="next" onclick="${nextOnClick}" ${nextDisabled ? 'disabled' : ''}>
        ${nextLabel}
      </button>
    </div>
  `;

  viewer.classList.add('active');
  viewer.scrollTop = 0;
  document.body.style.overflow = 'hidden';

  // Enable tab key in textarea + gutter de números sincronizado (c-11)
  // + guías de indentación estilo VS Code (c-11 6.1, sin librerías)
  setTimeout(() => {
    const textarea = document.getElementById('exercise-code');
    const gutter = document.getElementById('line-numbers');
    const guides = document.getElementById('indent-guides');
    if (textarea && gutter) {
      const syncGutter = () => {
        const count = textarea.value.split('\n').length;
        let numbers = '';
        for (let i = 1; i <= count; i++) numbers += i + '\n';
        gutter.textContent = numbers;
        gutter.scrollTop = textarea.scrollTop;
      };
      // Dibuja una guía por cada nivel de 4 espacios de cada línea, solo
      // hasta su propio nivel. Las líneas en blanco continúan la guía del
      // bloque (toman el nivel del siguiente bloque, o del anterior si no
      // hay siguiente). Nada a la derecha del texto ni bajo la última línea.
      const renderGuides = () => {
        if (!guides) return;
        const lines = textarea.value.split('\n');
        if (lines.length > 500) { guides.innerHTML = ''; return; }
        const raw = lines.map((line) => {
          if (!line.trim()) return -1;
          const spaces = (line.replace(/\t/g, '    ').match(/^ */) || [''])[0].length;
          return Math.floor(spaces / 4);
        });
        const nextLevel = new Array(lines.length).fill(0);
        const hasNext = new Array(lines.length).fill(false);
        let seen = false;
        let nxt = 0;
        for (let i = lines.length - 1; i >= 0; i--) {
          hasNext[i] = seen;
          if (raw[i] >= 0) { seen = true; nxt = raw[i]; }
          nextLevel[i] = nxt;
        }
        let prev = 0;
        let html = '';
        for (let i = 0; i < lines.length; i++) {
          const level = raw[i] >= 0 ? raw[i] : (hasNext[i] ? nextLevel[i] : prev);
          if (raw[i] >= 0) prev = raw[i];
          for (let k = 0; k < level; k++) {
            html += '<div class="indent-guide" style="left:calc(var(--spacing-md) + '
              + (k * 4) + 'ch);top:calc(var(--spacing-md) + '
              + Number((i * 1.6).toFixed(3)) + 'em)"></div>';
          }
        }
        guides.innerHTML = html;
        positionGuides();
      };
      const positionGuides = () => {
        if (!guides) return;
        guides.style.transform = 'translate(' + (-textarea.scrollLeft) + 'px,' + (-textarea.scrollTop) + 'px)';
      };
      const syncAll = () => { syncGutter(); renderGuides(); };
      textarea.addEventListener('input', syncAll);
      textarea.addEventListener('scroll', () => { gutter.scrollTop = textarea.scrollTop; positionGuides(); });
      textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;

          // Insert tab character
          this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);

          // Move cursor
          this.selectionStart = this.selectionEnd = start + 4;
          syncAll();
        }
      });
      syncAll();
    } else if (textarea) {
      textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.selectionStart;
          const end = this.selectionEnd;

          // Insert tab character
          this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);

          // Move cursor
          this.selectionStart = this.selectionEnd = start + 4;
        }
      });
    }
  }, 100);
}

function closeExercise() {
  document.getElementById('exercise-viewer').classList.remove('active');
  document.body.style.overflow = 'auto';
}

async function checkExercise(exerciseId) {
  const userCode = document.getElementById('exercise-code').value;
  const resultDiv = document.getElementById('exercise-result');
  const exercise = exercisesData.find(e => e.id === exerciseId);

  if (!exercise) {
    resultDiv.innerHTML = '<div class="error">Ejercicio no encontrado</div>';
    return;
  }

  // Mostrar loading
  resultDiv.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
      <div style="color: var(--text-secondary);">Validando por reglas…</div>
    </div>
  `;

  try {
    // Sin backend en v1.0: degradar a validación por reglas con mensaje honesto.
    const degradedMessage = (typeof DEGRADED_MESSAGE === 'string' && DEGRADED_MESSAGE)
      || 'ejecución no disponible — validando por reglas';
    const backendReady = (typeof isBackendConfigured === 'function')
      && isBackendConfigured(CONFIG.backendUrl, CONFIG.executeEndpoint);

    if (!backendReady) {
      const validation = validateByRules(userCode, exercise);
      const executionResult = { success: true, output: validation.output || '', errors: [] };
      displayValidationResult(validation, executionResult, exerciseId, { notice: degradedMessage });
      return;
    }

    // Verificar si es un ejercicio de solo indentación (no requiere compilación)
    const isIndentationOnly = exercise.validation && exercise.validation.checkIndentation &&
      exercise.lessonId === 1; // Lección 1 es de indentación

    let executionResult;

    if (isIndentationOnly) {
      // Para ejercicios de indentación, solo validar el formato sin compilar
      executionResult = {
        success: true,
        output: '',
        errors: []
      };
    } else {
      // Extraer el nombre de la clase del código del usuario
      const classNameMatch = userCode.match(/public\s+class\s+(\w+)/);
      const className = classNameMatch ? classNameMatch[1] : 'Main';

      // Ejecutar el código en el backend (un único intento con timeout)
      const executor = new JavaExecutor(CONFIG.executeEndpoint);
      executionResult = await executor.execute(userCode, className);
    }

    // Validación por reglas: el veredicto siempre lo da validator.js
    const validationResult = validateByRules(userCode, exercise);

    // Paso 3: Mostrar resultados
    displayValidationResult(
      validationResult,
      executionResult.degraded
        ? { success: true, output: validationResult.output || '', errors: [] }
        : executionResult,
      exerciseId,
      executionResult.degraded ? { notice: executionResult.notice || degradedMessage } : {}
    );

  } catch (error) {
    console.error('Error en validación:', error);
    resultDiv.innerHTML = `
      <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <strong style="color: #742a2a;">❌ No se pudo validar tu código</strong>
        <p style="margin: 0.5rem 0 0; color: #742a2a; font-size: 0.9rem;">
          ejecución no disponible — validando por reglas
        </p>
        <p style="margin: 0.5rem 0 0; color: #742a2a; font-size: 0.85rem;">
          Probá de nuevo en unos segundos. Si el problema sigue, revisá tu conexión.
        </p>
      </div>
    `;
    try {
      const fallback = validateByRules(userCode, exercise);
      displayValidationResult(
        fallback,
        { success: true, output: fallback.output || '', errors: [] },
        exerciseId,
        { notice: 'ejecución no disponible — validando por reglas' }
      );
    } catch (_) { /* el mensaje visible ya explica el estado */ }
  }
}

// Veredicto por reglas (validator.js decide; sin puntajes ni etiquetas de IA).
function validateByRules(userCode, exercise) {
  // C-18 ajuste 1: los ids 1-4 ya tienen regla estructural propia en
  // validator.js y van por javaValidator (abajo). Este atajo de igualdad
  // exacta queda solo para otros ejercicios de lección 1 sin regla propia.
  const isIndentationOnly = exercise.validation && exercise.validation.checkIndentation &&
    exercise.lessonId === 1 && ![1, 2, 3, 4].includes(exercise.id);
  if (isIndentationOnly) {
    const normalizeCode = (str) => {
      return str
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.replace(/\/\/.*$/, '').trimEnd())
        .filter(line => line.trim().length > 0)
        .join('\n')
        .trim();
    };
    if (normalizeCode(userCode) === normalizeCode(exercise.solution)) {
      return { success: true, output: '', errors: [], suggestions: [] };
    }
    // Aviso de llaves (c-11-editor-ux): solo TEXTO agregado al mensaje.
    // El veredicto se decidió arriba y no se toca (éxito solo si coincide).
    const baseMessage = 'La indentación no coincide con la solución esperada';
    const notice = (typeof braceNotice === 'function') ? braceNotice(userCode) : null;
    return {
      success: false,
      output: '',
      errors: [{ message: notice ? baseMessage + '. ' + notice : baseMessage, severity: 'error' }],
      suggestions: [
        'Cada vez que abrís una llave {, el código dentro lleva 4 espacios más',
        'Verificá que todas las líneas estén alineadas con espacios, no tabulaciones'
      ]
    };
  }
  const verdict = javaValidator.validate(userCode, exercise.id);
  return {
    success: verdict.isValid === true,
    output: verdict.output || '',
    errors: (verdict.errors || []).map(m => ({ message: String(m), severity: 'error' })),
    suggestions: (verdict.warnings || []).map(w => String((w && w.message) || w))
  };
}

function displayValidationResult(validation, execution, exerciseId, options = {}) {
  const resultDiv = document.getElementById('exercise-result');

  // C-12 Pendiente 4: aviso discreto en vez del banner azul llamativo, manteniendo contrato C-04
  let noticeHtml = '';
  if (options.notice) {
    noticeHtml = `
      <div class="validation-mode-note" data-notice="${options.notice}" title="${options.notice}">
        <span>✓ Validado en tu navegador</span>
      </div>
    `;
  }

  let errorsHtml = '';
  if (validation.errors && validation.errors.length > 0) {
    const criticalErrors = validation.errors.filter(e => e.severity === 'error');
    const warnings = validation.errors.filter(e => e.severity === 'warning' || e.severity === 'info');

    if (criticalErrors.length > 0) {
      errorsHtml += `
        <div class="result-card result-errors-list">
          <strong>✗ Errores Encontrados:</strong>
          <ul>
            ${criticalErrors.map(e => `<li>${e.message}${e.line ? ` (Línea ${e.line})` : ''}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (warnings.length > 0) {
      errorsHtml += `
        <div class="result-card result-warnings-list">
          <strong>⚠️ Sugerencias de Mejora:</strong>
          <ul>
            ${warnings.map(w => `<li>${w.message}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  let suggestionsHtml = '';
  if (validation.suggestions && validation.suggestions.length > 0) {
    suggestionsHtml = `
      <div class="result-card result-suggestions-list">
        <strong>💡 Sugerencias:</strong>
        <ul>
          ${validation.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let outputHtml = '';
  const shownOutput = (execution && execution.output && execution.output !== 'Código ejecutado')
    ? execution.output
    : '';
  if (shownOutput) {
    outputHtml = `
      <div class="result-card result-output-card">
        <div class="result-output-title">▸ Salida del programa:</div>
        <pre>${shownOutput}</pre>
      </div>
    `;
  }

  const hintDiv = document.getElementById('exercise-hint');
  const hintExercise = exercisesData.find(e => e.id === exerciseId);

  if (validation.success) {
    if (hintDiv) hintDiv.style.display = 'none';
    resultDiv.innerHTML = `
      <div class="result-card result-success">
        <strong>✓ ¡Excelente Trabajo!</strong>
        <p>Tu código es correcto y cumple con los requisitos del ejercicio.</p>
      </div>
      ${errorsHtml}
      ${suggestionsHtml}
      ${outputHtml}
      ${noticeHtml}
    `;
    resultDiv.className = 'exercise-result success';

    const exercise = exercisesData.find(e => e.id === exerciseId);
    if (exercise) {
      progressManager.markAsCompleted(exercise.lessonId);
      try {
        if (typeof safeSet === 'function') {
          safeSet(localStorage, `exercise_${exerciseId}_completed`, 'true');
        } else {
          localStorage.setItem(`exercise_${exerciseId}_completed`, 'true');
        }
      } catch (_) { /* el progreso en memoria sigue v?lido */ }
      checkLessonCompletion(exercise.lessonId, exerciseId, resultDiv);
    }
  } else {
    if (hintDiv && hintExercise && hintExercise.hint) {
      hintDiv.textContent = '💡 Pista: ' + hintExercise.hint;
      hintDiv.style.display = 'block';
    }
    resultDiv.innerHTML = `
      <div class="result-card result-error">
        <strong>✗ Necesita Correcciones</strong>
        <p>Revisá los puntos señalados abajo para ajustar tu solución.</p>
      </div>
      ${errorsHtml}
      ${suggestionsHtml}
      ${outputHtml}
      ${noticeHtml}
    `;
    resultDiv.className = 'exercise-result error';
  }
}

/**
 * Verifica si todos los ejercicios de una lecci?n est?n completados
 * Si es as?, muestra un mensaje de felicitaci?n con bot?n a la siguiente lecci?n
 */
function checkLessonCompletion(lessonId, currentExerciseId, resultDiv) {
  // Obtener todos los ejercicios de esta lección
  const allExercisesInLesson = exercisesData.filter(e => e.lessonId === lessonId);

  console.log(`Verificando lección ${lessonId}:`, {
    totalExercises: allExercisesInLesson.length,
    exerciseIds: allExercisesInLesson.map(e => e.id),
    currentExerciseId
  });

  // Verificar cuántos están completados (incluyendo el actual)
  const completedExercises = allExercisesInLesson.filter(e => {
    // El ejercicio actual siempre cuenta como completado
    if (e.id === currentExerciseId) {
      return true;
    }
    // Para los demás, verificar el guardado (sin romper si está bloqueado)
    let savedResult = null;
    try {
      savedResult = (typeof safeGet === 'function')
        ? safeGet(localStorage, `exercise_${e.id}_completed`, null)
        : localStorage.getItem(`exercise_${e.id}_completed`);
    } catch (_) {
      savedResult = null;
    }
    return savedResult === 'true';
  });

  console.log(`Ejercicios completados: ${completedExercises.length}/${allExercisesInLesson.length}`);

  // Si todos los ejercicios están completados
  if (completedExercises.length === allExercisesInLesson.length) {
    console.log('¡Lección completada! Mostrando mensaje...');

    // Obtener información de la lección actual y la siguiente
    const currentLesson = lessonsData.find(l => l.id === lessonId);
    const currentLessonIndex = lessonsData.findIndex(l => l.id === lessonId);
    const nextLesson = lessonsData[currentLessonIndex + 1];

    if (currentLesson) {
      // Agregar mensaje de felicitación al final del resultado
      const congratsMessage = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem; 
                    text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">🎉 ¡Felicidades!</h3>
          <p style="margin: 0 0 1rem 0; opacity: 0.95; font-size: 1rem;">
            Has completado todos los ejercicios de<br>
            <strong>"${currentLesson.title}"</strong>
          </p>
          ${nextLesson ? `
            <button onclick="closeExercise(); openLesson(${nextLesson.id})" 
                    style="background: white; color: #667eea; border: none; 
                           padding: 0.75rem 2rem; border-radius: 6px; font-weight: 600; 
                           cursor: pointer; font-size: 1rem; transition: transform 0.2s;
                           box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                    onmouseover="this.style.transform='scale(1.05)'"
                    onmouseout="this.style.transform='scale(1)'">
              📚 Continuar con: ${nextLesson.title} →
            </button>
          ` : `
            <p style="margin: 1rem 0 0; font-size: 1.1rem; font-weight: 600;">
              🏆 ¡Has completado todo el curso!
            </p>
          `}
        </div>
      `;

      // Agregar el mensaje al div de resultados
      resultDiv.innerHTML += congratsMessage;
    }
  } else {
    console.log('Lección aún no completada');
  }
}


function showHint(exerciseId) {
  const exercise = exercisesData.find(e => e.id === exerciseId);
  const hintDiv = document.getElementById('exercise-hint');
  hintDiv.textContent = '💡 Pista: ' + exercise.hint;
  hintDiv.style.display = 'block';
}

function resetExercise(exerciseId) {
  const exercise = exercisesData.find(e => e.id === exerciseId);
  const codeArea = document.getElementById('exercise-code');
  codeArea.value = exercise.starterCode;
  // Re-sincroniza números y guías (el valor por código no dispara `input`)
  try { codeArea.dispatchEvent(new Event('input')); } catch (_) { /* visual */ }
  const resultDiv = document.getElementById('exercise-result');
  resultDiv.innerHTML = '';
  resultDiv.className = ''; // Clear error/success classes
  document.getElementById('exercise-hint').style.display = 'none';
}

function filterExercisesMenuLevel(levelKey, btn) {
  const root = document.getElementById('exercise-content');
  if (!root) return;
  root.querySelectorAll('.exercises-level-pill').forEach((b) => {
    b.classList.toggle('active', b === btn);
  });
  root.querySelectorAll('.exercises-level-section').forEach((sec) => {
    sec.style.display = (!levelKey || levelKey === 'all' || sec.dataset.level === levelKey) ? '' : 'none';
  });
}

function showExercisesMenu() {
  const viewer = document.getElementById('exercise-viewer');
  if (viewer) viewer.scrollTop = 0;
  const content = document.getElementById('exercise-content');
  delete content.dataset.exerciseId;

  const levelMeta = [
    { key: 'beginner', name: 'Principiante', icon: '🌱' },
    { key: 'intermediate', name: 'Intermedio', icon: '🚀' },
    { key: 'advanced', name: 'Avanzado', icon: '⚡' },
    { key: 'expert', name: 'Experto', icon: '👑' }
  ];

  const groups = (typeof LessonNav !== 'undefined' && LessonNav.groupExercisesByLesson)
    ? LessonNav.groupExercisesByLesson(exercisesData, lessonsData)
    : [];
  const readingIds = (typeof LessonNav !== 'undefined' && LessonNav.readingLessonIds)
    ? LessonNav.readingLessonIds(exercisesData, lessonsData)
    : [];

  const levelSectionsHtml = levelMeta.map((lvl) => {
    const lvlGroups = groups.filter((g) => g.lesson.level === lvl.key);
    const lvlExCount = lvlGroups.reduce((acc, g) => acc + g.exercises.length, 0);
    return `
      <section class="exercises-level-section level-${lvl.key}" data-level="${lvl.key}">
        <header class="exercises-level-header">
          <div class="exercises-level-title">
            <span class="exercises-level-icon" aria-hidden="true">${lvl.icon}</span>
            <h3>Nivel ${lvl.name}</h3>
          </div>
          <span class="exercises-level-badge">${lvlGroups.length} lecciones • ${lvlExCount} ejercicios</span>
        </header>
        <div class="exercises-level-groups">
          ${lvlGroups.map((group) => `
            <div class="exercise-group" data-lesson-id="${group.lesson.id}" data-level="${lvl.key}">
              <h4 class="exercise-group-title">
                <span class="exercise-group-num">Lección #${group.lesson.id}</span>
                <span class="exercise-group-name">${group.lesson.title}</span>
                <span class="exercise-group-count">${group.exercises.length} ${group.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}</span>
              </h4>
              <div class="exercise-group-items">
                ${group.exercises.map((ex, idx) => `
                  <div class="exercise-item" data-exercise-id="${ex.id}" onclick="openExercise(${ex.id})">
                    <div class="exercise-item-main">
                      <div class="exercise-item-meta">Ejercicio ${idx + 1} de ${group.exercises.length} • ${lvl.name}</div>
                      <div class="exercise-item-title">${ex.title}</div>
                      <p class="exercise-item-desc">${String(ex.description || "").split("<br>")[0]}</p>
                    </div>
                    <span class="exercise-item-cta" aria-hidden="true">Practicar →</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');

  content.innerHTML = `
    <button class="lesson-close" onclick="closeExercise()" aria-label="Cerrar listado">×</button>
    <h2>💻 Todos los Ejercicios (${exercisesData.length} total)</h2>
    <p class="exercises-menu-lead">Recorré los ejercicios organizados por nivel y por lección. Elegí cualquiera para abrir el editor.</p>
    ${readingIds.length ? `<p class="exercises-menu-reading-note">📖 Lecciones teóricas de lectura (sin ejercicios): ${readingIds.map(id => '#' + id).join(', ')}</p>` : ''}

    <div class="exercises-level-filter" role="group" aria-label="Filtrar ejercicios por nivel">
      <button type="button" class="exercises-level-pill active" data-level-filter="all" onclick="filterExercisesMenuLevel('all', this)">Todos (${exercisesData.length})</button>
      ${levelMeta.map((lvl) => {
        const count = groups.filter((g) => g.lesson.level === lvl.key).reduce((a, g) => a + g.exercises.length, 0);
        return `<button type="button" class="exercises-level-pill level-${lvl.key}" data-level-filter="${lvl.key}" onclick="filterExercisesMenuLevel('${lvl.key}', this)">${lvl.icon} ${lvl.name} (${count})</button>`;
      }).join('')}
    </div>

    <div class="exercises-menu-groups">
      ${levelSectionsHtml}
    </div>

    <div class="lesson-navigation">
      <button class="nav-btn" data-nav="close" onclick="closeExercise()">Cerrar</button>
    </div>
  `;
}

// ============================================
// EVALUACIONES
// ============================================

let currentEvaluation = null;
let evaluationAnswers = [];
let evaluationStartTime = null;
let evaluationTimer = null;

function startEvaluation(level) {
  const evaluation = evaluationsData[level];
  if (!evaluation) return;

  currentEvaluation = { level, ...evaluation };
  evaluationAnswers = new Array(evaluation.questions.length).fill(null);
  evaluationStartTime = Date.now();

  renderEvaluation();
  startTimer(evaluation.timeLimit);

  const modal = document.getElementById('evaluation-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderEvaluation() {
  const content = document.getElementById('evaluation-content');

  content.innerHTML = `
    <button class="lesson-close" onclick="closeEvaluation()">×</button>
    <div class="evaluation-header">
      <h2>${currentEvaluation.title}</h2>
      <p>Responde correctamente al menos ${currentEvaluation.passingScore}% para aprobar</p>
      <div class="evaluation-timer" id="evaluation-timer">10:00</div>
    </div>
    
    ${currentEvaluation.questions.map((q, index) => `
      <div class="question-card">
        <div class="question-number">Pregunta ${index + 1} de ${currentEvaluation.questions.length}</div>
        <div class="question-text">${q.question}</div>
        <div class="question-options">
          ${q.options.map((option, optIndex) => `
            <button class="option-btn" onclick="selectAnswer(${index}, ${optIndex})" id="q${index}-opt${optIndex}">
              ${String.fromCharCode(65 + optIndex)}. ${option}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('')}
    
    <div class="evaluation-actions">
      <button class="btn-primary" onclick="submitEvaluation()">Enviar Evaluación</button>
    </div>
  `;
}

function selectAnswer(questionIndex, optionIndex) {
  // Deselect all options for this question
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`q${questionIndex}-opt${i}`);
    if (btn) btn.classList.remove('selected');
  }

  // Select the clicked option
  const selectedBtn = document.getElementById(`q${questionIndex}-opt${optionIndex}`);
  if (selectedBtn) selectedBtn.classList.add('selected');

  evaluationAnswers[questionIndex] = optionIndex;
}

function startTimer(seconds) {
  let remaining = seconds;
  const timerEl = document.getElementById('evaluation-timer');

  evaluationTimer = setInterval(() => {
    remaining--;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (remaining <= 0) {
      clearInterval(evaluationTimer);
      submitEvaluation();
    }
  }, 1000);
}

function submitEvaluation() {
  if (evaluationTimer) clearInterval(evaluationTimer);

  // Calculate score
  let correct = 0;
  currentEvaluation.questions.forEach((q, index) => {
    if (evaluationAnswers[index] === q.correct) {
      correct++;
    }
  });

  const score = Math.round((correct / currentEvaluation.questions.length) * 100);
  const passed = score >= currentEvaluation.passingScore;

  // Save result
  let results = {};
  try {
    const raw = (typeof safeGet === 'function')
      ? safeGet(localStorage, 'evaluationResults', '{}')
      : localStorage.getItem('evaluationResults');
    results = JSON.parse(raw || '{}');
  } catch (_) {
    results = {};
  }
  results[currentEvaluation.level] = { score, passed, date: new Date().toISOString() };
  try {
    if (typeof safeSet === 'function') {
      safeSet(localStorage, 'evaluationResults', JSON.stringify(results));
    } else {
      localStorage.setItem('evaluationResults', JSON.stringify(results));
    }
  } catch (_) { /* el resultado en pantalla sigue válido */ }

  showEvaluationResult(score, correct, passed);
}

function showEvaluationResult(score, correct, passed) {
  const content = document.getElementById('evaluation-content');

  content.innerHTML = `
    <button class="lesson-close" onclick="closeEvaluation()">×</button>
    <div class="evaluation-result">
      <div class="result-score">${score}%</div>
      <div class="result-message">${passed ? '¡Felicitaciones! 🎉' : 'Sigue practicando 💪'}</div>
      <div class="result-details">
        Respondiste correctamente ${correct} de ${currentEvaluation.questions.length} preguntas
      </div>
      
      ${passed ? `
        <div class="info-box success">
          <strong>✅ Nivel Aprobado</strong><br>
          Has desbloqueado el siguiente nivel. ¡Sigue así!
        </div>
      ` : `
        <div class="info-box warning">
          <strong>📚 Repasa el contenido</strong><br>
          Necesitas al menos ${currentEvaluation.passingScore}% para aprobar. Revisa las lecciones y vuelve a intentarlo.
        </div>
      `}
      
      <div class="evaluation-actions">
        <button class="btn-primary" onclick="closeEvaluation()">Continuar</button>
        ${!passed ? '<button class="btn-secondary" onclick="startEvaluation(\'' + currentEvaluation.level + '\')">Reintentar</button>' : ''}
      </div>
    </div>
  `;

  // Check if all levels completed
  if (passed) {
    checkForCertificate();
  }
}

function closeEvaluation() {
  if (evaluationTimer) clearInterval(evaluationTimer);
  document.getElementById('evaluation-modal').classList.remove('active');
  document.body.style.overflow = 'auto';
  currentEvaluation = null;
}

// ============================================
// CERTIFICADO
// ============================================

function checkForCertificate() {
  let results = {};
  try {
    const raw = (typeof safeGet === 'function')
      ? safeGet(localStorage, 'evaluationResults', '{}')
      : localStorage.getItem('evaluationResults');
    results = JSON.parse(raw || '{}');
  } catch (_) {
    results = {};
  }
  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];

  const allPassed = levels.every(level => results[level]?.passed);

  if (allPassed) {
    setTimeout(() => {
      showCertificate();
    }, 1000);
  }
}

function showCertificate() {
  const modal = document.getElementById('certificate-modal');
  const container = document.getElementById('certificate-container');

  const today = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <button class="lesson-close" onclick="closeCertificate()">×</button>
    <div class="certificate" id="certificate">
      <div class="certificate-header">
        <div class="certificate-logo">☕</div>
        <h1 class="certificate-title">Certificado de Finalización</h1>
        <p class="certificate-subtitle">JavaMaster - Programa Completo</p>
      </div>
      
      <div class="certificate-body">
        <p class="certificate-text">Se otorga el presente certificado a:</p>
        <h2 class="certificate-name">Estudiante de JavaMaster</h2>
        <p class="certificate-achievement">
          Por haber completado exitosamente el programa completo de Java,
          demostrando dominio desde conceptos fundamentales hasta nivel experto.
        </p>
        <p class="certificate-text">
          <strong>Niveles Completados:</strong> Principiante, Intermedio, Avanzado y Experto
        </p>
      </div>
      
      <div class="certificate-footer">
        <div class="certificate-signature">
          <div class="signature-line"></div>
          <div class="signature-name">Belén Calvo</div>
          <div class="signature-title">Creadora de JavaMaster</div>
        </div>
        <div class="certificate-signature">
          <div class="signature-line"></div>
          <div class="signature-name">JavaMaster</div>
          <div class="signature-title">Plataforma Educativa</div>
        </div>
      </div>
      
      <p class="certificate-date">Fecha de emisión: ${today}</p>
    </div>
    
    <div class="certificate-actions">
      <button class="btn-primary" onclick="downloadCertificate()">📥 Descargar Certificado</button>
      <button class="btn-secondary" onclick="closeCertificate()">Cerrar</button>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertificate() {
  document.getElementById('certificate-modal').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function downloadCertificate() {
  alert('Para descargar el certificado, haz clic derecho en el certificado y selecciona "Guardar imagen como..." o usa la función de impresión de tu navegador (Ctrl+P) y selecciona "Guardar como PDF".');
}

// ============================================
// ENHANCED LESSON VIEWER
// ============================================

// Override the original openLesson to include exercises and C-11b lesson-nav tags
const originalOpenLesson = window.openLesson;
window.openLesson = function (lessonId) {
  originalOpenLesson(lessonId);

  const content = document.getElementById('lesson-content');
  if (content) content.dataset.lessonId = String(lessonId);
  const navDiv = content ? content.querySelector('.lesson-navigation') : null;
  if (navDiv) {
    const btns = navDiv.querySelectorAll('.nav-btn');
    if (btns[0]) btns[0].dataset.lessonNav = 'prev';
    if (btns[1]) btns[1].dataset.lessonNav = 'complete';
    if (btns[2]) {
      btns[2].dataset.lessonNav = 'next';
      if (typeof LessonNav !== 'undefined' && LessonNav.isAvailable) {
        const idx = lessonsData.findIndex(l => l.id === lessonId);
        const nextLesson = idx >= 0 ? lessonsData[idx + 1] : null;
        if (nextLesson && !LessonNav.isAvailable('lesson', nextLesson.id)) {
          btns[2].disabled = true;
        }
      }
    }
  }

  // Add exercise button if available (reading lessons 22, 25, 40, 42 do not have exercises)
  const exercise = exercisesData.find(e => e.lessonId === lessonId);
  if (exercise && navDiv) {
    navDiv.classList.remove('lesson-nav-reading');
    const exerciseBtn = document.createElement('button');
    exerciseBtn.className = 'nav-btn';
    exerciseBtn.dataset.lessonNav = 'practice';
    exerciseBtn.textContent = '💻 Practicar';
    if (typeof LessonNav !== 'undefined' && LessonNav.isAvailable && !LessonNav.isAvailable('exercise', exercise.id)) {
      exerciseBtn.disabled = true;
    }
    exerciseBtn.onclick = () => {
      closeLesson();
      setTimeout(() => openExercise(exercise.id), 300);
    };
    navDiv.insertBefore(exerciseBtn, navDiv.children[1]);
  } else if (navDiv) {
    navDiv.classList.add('lesson-nav-reading');
  }
};

// ============================================
// ENHANCED LEVEL CARDS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.level-card').forEach(card => {
    const level = card.dataset.level;
    const studyGuides = {
      beginner: 'guia-principiante.html',
      intermediate: 'guia-intermedio.html',
      advanced: 'guia-avanzado.html',
      expert: 'guia-experto.html'
    };

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'level-card-actions';

    const studyBtn = document.createElement('a');
    studyBtn.href = studyGuides[level];
    studyBtn.download = studyGuides[level];
    studyBtn.className = 'btn-secondary level-guide-btn';
    studyBtn.textContent = '?? Descargar Material de Estudio';
    studyBtn.onclick = (e) => {
      e.stopPropagation();
    };

    const evalBtn = document.createElement('button');
    evalBtn.className = 'btn-primary level-eval-btn';
    evalBtn.textContent = '?? Tomar Evaluaci?n';
    evalBtn.onclick = (e) => {
      e.stopPropagation();
      startEvaluation(level);
    };

    actionsWrap.appendChild(studyBtn);
    actionsWrap.appendChild(evalBtn);
    card.appendChild(actionsWrap);
  });

  checkForCertificate();
});
