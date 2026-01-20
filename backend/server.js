const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Configuración
const TEMP_DIR = path.join(__dirname, 'temp');
const TIMEOUT = 5000; // 5 segundos
const MAX_OUTPUT = 10000; // 10KB max output
const PORT = process.env.PORT || 3000;

// Crear directorio temporal si no existe
(async () => {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
        console.log('✓ Directorio temporal creado');
    } catch (error) {
        console.error('Error creando directorio temporal:', error);
    }
})();

// Endpoint de salud
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Java executor backend is running' });
});

// Endpoint principal de ejecución
app.post('/api/execute', async (req, res) => {
    const { code, className = 'Main' } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            output: '',
            errors: ['No se proporcionó código para ejecutar']
        });
    }

    const sessionId = crypto.randomBytes(16).toString('hex');
    const workDir = path.join(TEMP_DIR, sessionId);

    try {
        // Crear directorio de trabajo
        await fs.mkdir(workDir, { recursive: true });

        // Escribir archivo .java
        const javaFile = path.join(workDir, `${className}.java`);
        await fs.writeFile(javaFile, code);

        // Compilar
        const compileResult = await executeCommand(
            `javac "${javaFile}"`,
            workDir,
            TIMEOUT
        );

        if (compileResult.exitCode !== 0) {
            return res.json({
                success: false,
                output: '',
                errors: [formatCompileError(compileResult.stderr)],
                stage: 'compilation',
                executionTime: compileResult.time
            });
        }

        // Ejecutar
        const runResult = await executeCommand(
            `java -cp "${workDir}" ${className}`,
            workDir,
            TIMEOUT
        );

        res.json({
            success: runResult.exitCode === 0,
            output: runResult.stdout.substring(0, MAX_OUTPUT),
            errors: runResult.exitCode !== 0 ? [runResult.stderr] : [],
            executionTime: runResult.time,
            stage: 'execution'
        });

    } catch (error) {
        console.error('Error ejecutando código:', error);
        res.json({
            success: false,
            output: '',
            errors: [error.message]
        });
    } finally {
        // Limpiar archivos temporales
        setTimeout(async () => {
            try {
                await fs.rm(workDir, { recursive: true, force: true });
            } catch (e) {
                console.error('Error limpiando archivos temporales:', e);
            }
        }, 1000);
    }
});

// Función auxiliar para ejecutar comandos
function executeCommand(command, cwd, timeout) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const process = exec(command, { cwd, timeout }, (error, stdout, stderr) => {
            const exitCode = error ? (error.code || 1) : 0;

            resolve({
                exitCode,
                stdout: stdout.toString(),
                stderr: stderr.toString(),
                time: Date.now() - startTime
            });
        });

        // Manejar timeout
        process.on('error', (error) => {
            if (error.code === 'ETIMEDOUT') {
                resolve({
                    exitCode: 1,
                    stdout: '',
                    stderr: 'Error: El programa excedió el tiempo límite de ejecución (5 segundos)',
                    time: timeout
                });
            }
        });
    });
}

// Formatear errores de compilación para que sean más legibles
function formatCompileError(stderr) {
    // Extraer información relevante del error de javac
    const lines = stderr.split('\n');
    const relevantLines = lines.filter(line =>
        line.includes('error:') ||
        line.includes('^') ||
        line.trim().length > 0
    );

    return relevantLines.join('\n') || stderr;
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   JavaMaster Backend - Executor Server     ║
╠════════════════════════════════════════════╣
║  Puerto: ${PORT}                              ║
║  Timeout: ${TIMEOUT}ms                         ║
║  Directorio temporal: ${path.basename(TEMP_DIR)}           ║
╚════════════════════════════════════════════╝
  `);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});
