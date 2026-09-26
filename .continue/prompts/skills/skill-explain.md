---
name: explicacion-codigo
description: Explica código fuente de forma detallada para perfil fullstack junior.
invokable: true
---

# Skill: Explicación Secuencial de Código para Fullstack Junior

## Descripción

Esta skill permite al agente analizar un fragmento de código (frontend, backend o fullstack) y explicarlo paso a paso con un enfoque pedagógico orientado a perfiles junior. La explicación incluye desglose secuencial, comentarios dentro del propio código y aclaración de conceptos clave.

## Activadores (Triggers)

Se activa cuando el usuario utiliza frases como:

- "Explícame este código"
- "No entiendo qué hace esta función"
- "Desglosa paso a paso este archivo"
- "Añade comentarios a este código"
- "Explica estos últimos cambios"
- "Explica el cambio 3"
- "Explica solo la parte de validación"

## Procedimiento de Ejecución

1. **Identificación del contexto**
   - Detectar lenguaje y tipo de módulo (frontend, backend, fullstack).
   - Identificar si el usuario quiere explicación general, de flujo, arquitectura o una parte concreta.
   - Si hay ambigüedad, pedir aclaración mínima.

2. **Lectura del código (según origen)**  
   El agente **NO debe leer siempre el archivo completo**, sino únicamente el código explícitamente indicado por el usuario. Orden de prioridad:

   **a) Código pegado directamente en el chat**
   - Si el usuario pega un bloque de código, ese es el código a explicar.

   **b) Código referenciado explícitamente por el usuario**  
   Ejemplos:
   - “Explica el cambio 3”
   - “Explica estos últimos cambios”
   - “Explica la función que añadimos antes”
   - “Explica el endpoint mencionado arriba”  
     El agente debe localizar ese fragmento en el historial de la conversación.

   **c) Código presente en el Contexto actual (@archivo.js, @ruta/index.ts, etc.)**
   - Si el usuario no especifica nada y no pega código, el agente debe leer **el archivo o archivos completos** presentes en el contexto actual.

   **d) Cualquier otra forma explícita de selección**
   - “Explica solo la parte de validación”
   - “Explica solo la función login”
   - “Explica solo el componente Header”

   **Regla general:**  
   _El agente solo explica el código señalado de forma directa o indirecta. Nunca asume que debe leer todo el workspace._

3. **Segmentación en bloques lógicos**
   - Dividir el código en secciones comprensibles: imports, configuración, funciones principales, auxiliares, manejo de errores, renderizado o respuesta final.
   - Nombrar cada bloque con un título breve.

4. **Explicación paso a paso**
   - Para cada bloque:
     - Explicar qué hace.
     - Explicar por qué
