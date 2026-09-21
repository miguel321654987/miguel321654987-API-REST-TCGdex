---
name: analisis-código
description: Realiza una auditoría de calidad de código sobre archivos específicos del workspace para identificar malas prácticas y sugerir refactorizaciones. Úsalo cuando el usuario pida revisar código, deuda técnica o buenas prácticas.
invokable: true
---

# Skill: Análisis de Deuda Técnica y Buenas Prácticas

## Descripción

Permite al agente realizar una auditoría de calidad de código sobre archivos específicos del workspace para identificar malas prácticas y sugerir refactorizaciones.

## Activadores (Triggers)

Esta habilidad se activa cuando el usuario utiliza frases como:

- "Analiza este código"
- "Revisa la deuda técnica de..."
- "Aplica la skill de buenas prácticas en..."

## Procedimiento de Ejecución

1. **Escaneo:** El agente leerá el archivo o bloque de código proporcionado.
2. **Evaluación:** Medirá el código bajo tres criterios: Complejidad ciclomática, duplicidad y manejo de errores.
3. **Reporte:** Emitirá una respuesta estructurada con la siguiente plantilla:
   - **Puntuación de Calidad:** (De 1 a 10)
   - **Puntos Críticos Identificados:** (Lista de problemas encontrados)
   - **Propuesta de Refactorización:** (Bloque de código corregido)
