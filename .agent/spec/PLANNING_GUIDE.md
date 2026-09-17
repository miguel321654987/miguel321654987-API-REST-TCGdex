---
type: agent-rules
project: 4geeks-fullstack-template
version: 1.0
---

# 📋 AI Planning Phase Protocol

This file defines the mandatory protocol the AI must follow whenever the user initiates a planning phase (Plan Mode).

## 🧠 Core Objectives

- Analyze technical requirements thoroughly before proposing architecture.
- Minimize context fatigue and prevent broken loops or logic errors.
- Design atomic, step-by-step implementations aligned with the project's stack.

## 🔄 Mandatory Planning Workflow

Before generating any planning response or proposing a solution, the AI MUST execute the following steps in order:

### Step 1: Context Verification

1.1. Read `ROADMAP.md` to identify the current active task and review past lessons or blockers.
1.2. Inspect relevant codebase files using context providers (e.g., `app.py`, `models.py`) to understand dependencies.

### Step 2: Architecture Design

2.1. Draft structural changes ensuring complete compatibility with the existing technical stack: - **Backend:** Python, Flask, SQLAlchemy ORM, SQLite (`instance/example.db`). - **Frontend:** React.js, Functional Components, Context API.
2.2. Maintain the strict language constraint: all code, variables, and technical files must be written in English.

### Step 3: Atomic Action Steps

3.1. Break down the implementation into a structured sequence of small, verifiable steps (e.g., Step 1, Step 2, Step 3).
3.2. Each step must be isolated enough so that when transitioning to Act/Agent Mode, the agent can verify success.
3.3. 🛑 **ROADMAP.MD LOCK RULE (CRITICAL):** The AI is STRICTLY FORBIDDEN from automatically editing, writing, or modifying `ROADMAP.md` without explicit, step-by-step user confirmation in the chat.
3.4. ⚠️ **ROADMAP CONTROL (STRICT):** It is strictly forbidden to propose or take for granted any changes in `ROADMAP.md`. Before any step simulation or task update, you must present the proposal in plain text inside the chat and wait until the user gives explicit approval. Only after the user provides an explicit green light, the agent can use tools to modify `ROADMAP.md` and trigger a Git commit with date/time/branch/title.
3.5. **File Structure Requirement for ROADMAP.md:** The structure is strictly split vertically into two sections; entries MUST NOT interleave within these blocks but are appended to their respective language section's footer instead.
3.6. **Roadmap Entry Structure:** New entries must follow this exact order: First add the new item at the end of the English section, followed immediately by its translated duplicate at the very end of the Spanish section (commented). Entries MUST NOT interleave; they must remain grouped by language block.
3.7. The translation block MUST end with closing comments (`<!-- ... -->`) to prevent loading heavy context or distracting the AI model during token processing.

## 💬 Output Format

- Present the final plan strictly in Spanish for user review.
- Do not attempt to use file-writing or terminal execution tools during this phase.
- CRITICAL: Always wait for explicit user approval in the chat before touching `ROADMAP.md` or declaring the plan ready for execution.

================================================================================
TRADUCCIÓN AL ESPAÑOL (SOLO PARA REFERENCIA HUMANA - COMPARTIMENTADA PARA LA IA)
================================================================================
📋 Protocolo de la Fase de Planificación de la IA
Este bloque define el protocolo obligatorio que la IA debe seguir cada vez que el usuario inicia una fase de planificación (Modo Plan).

🧠 Objetivos Centrales

- Analizar minuciosamente los requisitos técnicos antes de proponer una arquitectura.
- Minimizar la fatiga de contexto y evitar bucles rotos o errores de lógica.
- Diseñar implementaciones atómicas, paso a paso, alineadas con el stack del proyecto.

🔄 Flujo de Trabajo de Planificación Obligatorio
Antes de generar cualquier respuesta de planificación o proponer una solución, la IA DEBE ejecutar los siguientes pasos en orden:

Paso 1: Verificación del Contexto

1.1. Leer ROADMAP.md para identificar la tarea activa actual y revisar lecciones o bloqueos pasados.
1.2. Inspeccionar los archivos relevantes del código usando los proveedores de contexto (ej. app.py, models.py) para entender las dependencias.

Paso 2: Diseño de la Arquitectura

2.1. Diseñar los cambios estructurales asegurando total compatibilidad con el stack técnico existente: - Backend: Python, Flask, SQLAlchemy ORM, SQLite (instance/example.db). - Frontend: React.js, Componentes Funcionales, Context API.
2.2. Mantener la restricción estricta de idioma: todo el código, variables y archivos técnicos deben escribirse en inglés.

Paso 3: Pasos de Acción Atómicos

3.1. Desglosar la implementación en una secuencia estructurada de pequeños pasos verificables (por ejemplo, Paso 1, Paso 2, Paso 3).
3.2. Cada paso debe estar lo suficientemente aislado para que, al pasar a Modo Act/Agent, el agente pueda verificar el éxito.
3.3. 🛑 **REGLA DE BLOQUEO DE ROADMAP.MD (CRÍTICA):** La IA TIENE ESTRICTAMENTE PROHIBIDO editar, escribir o modificar `ROADMAP.md` de forma automática o autónoma sin confirmación explícita paso a paso en el chat por parte del usuario.
3.4. ⚠️ **CONTROL DE ROADMAP (ESTRICTO):** Queda rotundamente prohibido proponer o dar por hecho cambios en `ROADMAP.md`. Antes de cualquier simulación de pasos o actualización de tareas, debes presentar la propuesta en texto en el chat y esperar a que el usuario te dé su aprobación explícita. Solo cuando el usuario dé su aprobación explícita, el agente podrá usar herramientas de edición para modificar `ROADMAP.md` y generar un commit de Git con fecha/hora/ramal/título.
3.5. Requisito de Estructura para ROADMAP.md: La estructura está dividida verticalmente estrictamente en dos secciones; las entradas NO deben entremezclarse dentro de estos bloques, sino que deben agregarse al pie de la sección del lenguaje correspondiente.
3.6. Estructura de Entrada en el Roadmap: Las nuevas entradas deben seguir este orden exacto: Primero agrega el nuevo elemento al final de la sección en inglés, seguido inmediatamente por su duplicado traducido al español justo al final de la sección española (comentado). LAS ENTRADAS NO DEBEN ENTREMEZCLARSE; deben mantenerse agrupadas por bloque de idioma.
3.7. El bloque de traducción DEBE terminar con comentarios de cierre (<!-- ... -->) para evitar cargar contexto pesado o distraer a la IA durante el procesamiento de tokens.

💬 Formato de Salida

- Presentar el plan final estrictamente en español para la revisión del usuario.
- No intentar usar herramientas de escritura de archivos o ejecución de terminal durante esta fase.
- CRÍTICO: Esperar siempre la aprobación explícita del usuario en el chat antes de tocar `ROADMAP.md` o declarar el plan listo para su ejecución.
