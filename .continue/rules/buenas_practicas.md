---
name: buenas-practicas-codigo-limpio
description: Fuerza al agente a generar código legible usando Clean Code, control estructurado de excepciones y modularidad simple (KISS).
activation: always_on
---

# Rule: Buenas Prácticas de Desarrollo y Código Limpio

## Contexto

Esta regla se aplica de forma global y obligatoria a cualquier generación, modificación o revisión de código que realice el agente dentro de este espacio de trabajo.

## Directrices Obligatorias

- **Legibilidad:** El código generado debe seguir principios de Clean Code. Usa nombres de variables y funciones descriptivos y autoexplicativos.
- **Comentarios:** No satures el código con comentarios obvios. Incluye comentarios únicamente para explicar lógica compleja o decisiones de arquitectura no evidentes.
- **Manejo de Errores:** Todo bloque de código que realice operaciones propensas a fallos (I/O, llamadas de red, parsing) debe incluir un control de excepciones (`try/catch` o equivalente del lenguaje) estructurado.
- **Simplicidad:** Prioriza soluciones simples y modulares sobre arquitecturas sobreingeniadas (Principio KISS).

## Formato de Respuesta

Al entregar código, incluye siempre una brevísima sección al final titulada `### Adherencia a Reglas` detallando cómo se aplicaron estos puntos.
