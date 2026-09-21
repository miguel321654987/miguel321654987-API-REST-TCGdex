---
name: compactar-contexto
description: Realiza un análisis de contenido estático sobre la Conversation completa para generar directamente el prompt de inicio de una nueva Conversation limpia.
---

# Skill: Análisis de Contenido de Contexto (Pase de Testigo)

## Descripción

Esta habilidad procesa el texto del historial del chat como un corpus de datos estático y cerrado. Realiza una extracción de información para generar el prompt mínimo de inicialización optimizado para una nueva sesión, reduciendo el coste de tokens al mínimo.

## Procedimiento de Ejecución

1. **Naturaleza del Análisis:** El agente operará bajo el principio de "Análisis de Contenido Estático". Trata el chat completo como un documento de texto inmutable. Queda estrictamente prohibido ejecutar razonamientos generativos, deducir intenciones o auditar procesos internos y logs de herramientas del sistema.
2. **Restricción de Longitud:** La extracción debe ser extremadamente corta, específica y estructurada en viñetas. Queda prohibida la redacción de párrafos narrativos extensos para evitar el arrastre de tokens innecesarios en la siguiente sesión.
3. **Formato de Salida:** Genera directamente un bloque de código conteniendo el prompt mínimo de entrada listo para la siguiente Conversation. Omite introducciones, saludos o comentarios periféricos. Usa la siguiente estructura exacta:

```text
Actúa como un desarrollador experto. Continuamos el proyecto desde un chat limpio para optimizar contexto. Basándote exclusivamente en las specs globales de nuestro @AGENTS.md, toma el siguiente estado actual como punto de partida inmutable:

- **Componentes Consolidados:** [Lista esquemática de archivos y funciones modificadas con éxito]
- **Patrón/Stack Fijo:** [Tecnologías, librerías y decisiones de arquitectura finales]
- **Siguiente Acción:** [Punto exacto de partida para esta nueva sesión]

Contesta "Entendido y alineado con el estado actual" en una sola línea y espera mis instrucciones para el código.
```
