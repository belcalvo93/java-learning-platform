// Append to existing script.js - New Features

// ============================================
// EJERCICIOS INTERACTIVOS
// ============================================

function openExercise(exerciseId) {
  const exercise = exercisesData.find(e => e.id === exerciseId);
  if (!exercise) return;

  const viewer = document.getElementById('exercise-viewer');
  const content = document.getElementById('exercise-content');

  // Find current exercise index and get prev/next
  const currentIndex = exercisesData.indexOf(exercise);
  const prevExercise = exercisesData[currentIndex - 1];
  const nextExercise = exercisesData[currentIndex + 1];

  content.innerHTML = `
    <button class="lesson-close" onclick="closeExercise()">×</button>
    <h2>${exercise.title}</h2>
    <p>${exercise.description}</p>
    
    <div class="exercise-editor">
      <textarea class="exercise-textarea" id="exercise-code">${exercise.starterCode}</textarea>
      <div class="exercise-actions">
        <button class="btn-primary" onclick="checkExercise(${exercise.id})">✓ Verificar Solución</button>
        <button class="btn-secondary" onclick="showHint(${exercise.id})">💡 Ver Pista</button>
        <button class="btn-secondary" onclick="resetExercise(${exercise.id})">↻ Reiniciar</button>
      </div>
      <div id="exercise-result"></div>
      <div id="exercise-hint" style="display: none;" class="exercise-hint"></div>
    </div>
    
    <div class="lesson-navigation" style="margin-top: 2rem;">
      <button class="nav-btn" onclick="openExercise(${prevExercise?.id})" ${!prevExercise ? 'disabled' : ''}>
        ← Ejercicio Anterior
      </button>
      <button class="nav-btn" onclick="showExercisesMenu()">
        📋 Ver Todos los Ejercicios
      </button>
      <button class="nav-btn" onclick="closeExercise()">
        Volver a Lecciones
      </button>
      <button class="nav-btn" onclick="openExercise(${nextExercise?.id})" ${!nextExercise ? 'disabled' : ''}>
        Siguiente Ejercicio →
      </button>
    </div>
  `;

  viewer.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Enable tab key in textarea
  setTimeout(() => {
    const textarea = document.getElementById('exercise-code');
    if (textarea) {
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
      <div style="color: var(--text-secondary);">Validando tu código con IA...</div>
    </div>
  `;

  try {
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

      // Ejecutar el código en el backend
      const executor = new JavaExecutor(CONFIG.executeEndpoint);
      executionResult = await executor.execute(userCode, className);
    }

    // Paso 2: Validar con IA
    const validator = new AIValidator(CONFIG.geminiApiKey);
    const validationResult = await validator.validateWithAI(userCode, exercise, executionResult);

    // Paso 3: Mostrar resultados
    displayValidationResult(validationResult, executionResult, exerciseId);

  } catch (error) {
    console.error('Error en validación:', error);
    resultDiv.innerHTML = `
      <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <strong style="color: #742a2a;">❌ Error del Sistema</strong>
        <p style="margin: 0.5rem 0 0; color: #742a2a; font-size: 0.9rem;">
          ${error.message || 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.'}
        </p>
        <p style="margin: 0.5rem 0 0; color: #742a2a; font-size: 0.85rem;">
          Ejecuta: <code>cd backend && npm start</code>
        </p>
      </div>
    `;
  }
}

function displayValidationResult(validation, execution, exerciseId) {
  const resultDiv = document.getElementById('exercise-result');

  // Construir HTML de errores
  let errorsHtml = '';
  if (validation.errors && validation.errors.length > 0) {
    const criticalErrors = validation.errors.filter(e => e.severity === 'error');
    const warnings = validation.errors.filter(e => e.severity === 'warning' || e.severity === 'info');

    if (criticalErrors.length > 0) {
      errorsHtml += `
        <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
          <strong style="color: #742a2a;">❌ Errores Encontrados:</strong>
          <ul style="margin: 0.5rem 0 0 1.5rem; color: #742a2a; font-size: 0.9rem;">
            ${criticalErrors.map(e => `<li>${e.message}${e.line ? ` (Línea ${e.line})` : ''}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (warnings.length > 0) {
      errorsHtml += `
        <div style="background: #fffaf0; border-left: 4px solid #ed8936; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.85rem;">
          <strong style="color: #7c2d12;">⚠ Sugerencias de Mejora:</strong>
          <ul style="margin: 0.25rem 0 0 1.5rem; color: #7c2d12;">
            ${warnings.map(w => `<li>${w.message}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  // Construir HTML de explicación de IA
  let aiExplanationHtml = '';
  if (validation.explanation) {
    aiExplanationHtml = `
      <div style="background: rgba(102, 126, 234, 0.1); border-left: 4px solid #667eea; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <strong style="color: #667eea;">🤖 Feedback de IA:</strong>
        <p style="margin: 0.5rem 0 0; color: var(--text-primary); font-size: 0.9rem; line-height: 1.6;">
          ${validation.explanation}
        </p>
      </div>
    `;
  }

  // Construir HTML de sugerencias
  let suggestionsHtml = '';
  if (validation.suggestions && validation.suggestions.length > 0) {
    suggestionsHtml = `
      <div style="background: rgba(72, 187, 120, 0.1); border-left: 4px solid #48bb78; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem; font-size: 0.85rem;">
        <strong style="color: #22543d;">💡 Sugerencias:</strong>
        <ul style="margin: 0.25rem 0 0 1.5rem; color: #276749;">
          ${validation.suggestions.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // Construir HTML de output
  let outputHtml = '';
  if (execution.output) {
    outputHtml = `
      <div style="background: #1a202c; color: #e2e8f0; padding: 1rem; border-radius: 6px; margin-top: 1rem; font-family: 'Fira Code', monospace;">
        <div style="color: #48bb78; margin-bottom: 0.5rem; font-weight: 600;">▶ Salida del programa:</div>
        <pre style="margin: 0; color: #e2e8f0; white-space: pre-wrap; line-height: 1.6;">${execution.output}</pre>
      </div>
    `;
  }

  // Resultado final
  if (validation.success) {
    resultDiv.innerHTML = `
      <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <strong style="color: #22543d;">✓ ¡Excelente Trabajo!</strong>
        <p style="margin: 0.5rem 0 0; color: #276749; font-size: 0.9rem;">
          Tu código es correcto y cumple con los requisitos del ejercicio.
        </p>
        ${validation.functionalityScore ? `
          <div style="margin-top: 0.5rem; color: #276749; font-size: 0.85rem;">
            📊 Funcionalidad: ${validation.functionalityScore}% | Estilo: ${validation.styleScore}%
          </div>
        ` : ''}
      </div>
      ${errorsHtml}
      ${aiExplanationHtml}
      ${suggestionsHtml}
      ${outputHtml}
    `;
    resultDiv.className = 'exercise-result success';

    // Marcar como completado
    const exercise = exercisesData.find(e => e.id === exerciseId);
    if (exercise) {
      progressManager.markAsCompleted(exercise.lessonId);

      // Guardar que este ejercicio específico está completado
      localStorage.setItem(`exercise_${exerciseId}_completed`, 'true');

      // Verificar si se completaron TODOS los ejercicios de esta lección
      checkLessonCompletion(exercise.lessonId, exerciseId, resultDiv);
    }
  } else {
    resultDiv.innerHTML = `
      <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
        <strong style="color: #742a2a;">✗ Necesita Correcciones</strong>
        <p style="margin: 0.5rem 0 0; color: #742a2a; font-size: 0.9rem;">
          Tu código necesita algunos ajustes para cumplir con los requisitos.
        </p>
      </div>
      ${errorsHtml}
      ${aiExplanationHtml}
      ${suggestionsHtml}
      ${outputHtml}
    `;
    resultDiv.className = 'exercise-result error';
  }
}

/**
 * Verifica si todos los ejercicios de una lección están completados
 * Si es así, muestra un mensaje de felicitación con botón a la siguiente lección
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
    // Para los demás, verificar localStorage
    const savedResult = localStorage.getItem(`exercise_${e.id}_completed`);
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
            <button onclick="openLesson(${nextLesson.id})" 
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
  document.getElementById('exercise-code').value = exercise.starterCode;
  const resultDiv = document.getElementById('exercise-result');
  resultDiv.innerHTML = '';
  resultDiv.className = ''; // Clear error/success classes
  document.getElementById('exercise-hint').style.display = 'none';
}

function showExercisesMenu() {
  const content = document.getElementById('exercise-content');

  const getLevelName = (level) => {
    const names = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' };
    return names[level];
  };

  const getLessonLevel = (lessonId) => {
    const lesson = lessonsData.find(l => l.id === lessonId);
    return lesson ? lesson.level : 'beginner';
  };

  content.innerHTML = `
        <button class="lesson-close" onclick="closeExercise()">×</button>
        <h2>📋 Todos los Ejercicios (${exercisesData.length} total)</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Haz clic en cualquier ejercicio para practicar</p>
        
        <div style="display: grid; gap: 1rem;">
            ${exercisesData.map((ex, index) => {
    const level = getLessonLevel(ex.lessonId);
    return `
                    <div class="lesson-card" onclick="openExercise(${ex.id})" style="cursor: pointer; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                                    Ejercicio ${index + 1} • ${getLevelName(level)}
                                </div>
                                <h4 style="margin: 0; color: var(--text-primary);">${ex.title}</h4>
                                <p style="margin: 0.5rem 0 0; color: var(--text-secondary); font-size: 0.9rem;">${ex.description}</p>
                            </div>
                            <div style="font-size: 1.5rem;">💻</div>
                        </div>
                    </div>
                `;
  }).join('')}
        </div>
        
        <div class="lesson-navigation" style="margin-top: 2rem;">
            <button class="nav-btn" onclick="closeExercise()">Cerrar</button>
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
  const results = JSON.parse(localStorage.getItem('evaluationResults') || '{}');
  results[currentEvaluation.level] = { score, passed, date: new Date().toISOString() };
  localStorage.setItem('evaluationResults', JSON.stringify(results));

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
  const results = JSON.parse(localStorage.getItem('evaluationResults') || '{}');
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

// Override the original openLesson to include exercises
const originalOpenLesson = window.openLesson;
window.openLesson = function (lessonId) {
  originalOpenLesson(lessonId);

  // Add exercise button if available
  const exercise = exercisesData.find(e => e.lessonId === lessonId);
  if (exercise) {
    const content = document.getElementById('lesson-content');
    const navDiv = content.querySelector('.lesson-navigation');
    if (navDiv) {
      const exerciseBtn = document.createElement('button');
      exerciseBtn.className = 'nav-btn';
      exerciseBtn.textContent = '💻 Practicar';
      exerciseBtn.onclick = () => {
        closeLesson();
        setTimeout(() => openExercise(exercise.id), 300);
      };
      navDiv.insertBefore(exerciseBtn, navDiv.children[1]);
    }
  }
};

// ============================================
// ENHANCED LEVEL CARDS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Add evaluation buttons to level cards
  document.querySelectorAll('.level-card').forEach(card => {
    const level = card.dataset.level;

    // Map level to study guide
    const studyGuides = {
      beginner: 'guia-principiante.html',
      intermediate: 'guia-intermedio.html',
      advanced: 'guia-avanzado.html',
      expert: 'guia-experto.html'
    };

    // Add study guide button
    const studyBtn = document.createElement('a');
    studyBtn.href = studyGuides[level];
    studyBtn.download = studyGuides[level];
    studyBtn.className = 'btn-secondary';
    studyBtn.style.marginTop = '1rem';
    studyBtn.style.width = '100%';
    studyBtn.style.display = 'block';
    studyBtn.style.textAlign = 'center';
    studyBtn.textContent = '📚 Descargar Material de Estudio';
    studyBtn.onclick = (e) => {
      e.stopPropagation();
    };

    // Add evaluation button
    const evalBtn = document.createElement('button');
    evalBtn.className = 'btn-primary';
    evalBtn.style.marginTop = '0.5rem';
    evalBtn.style.width = '100%';
    evalBtn.textContent = '📝 Tomar Evaluación';
    evalBtn.onclick = (e) => {
      e.stopPropagation();
      startEvaluation(level);
    };

    card.appendChild(studyBtn);
    card.appendChild(evalBtn);
  });

  // Check for certificate on load
  checkForCertificate();
});
