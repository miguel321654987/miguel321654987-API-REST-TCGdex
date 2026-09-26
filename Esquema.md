# ESQUEMA FUNCIONAL DE APP "DIARIO DE INTERPRETACIÓN DE SUEÑOS"

## 📥 Paso 1: Entrada de Sueño (Texto Directo o Transcripción de Voz Segura)

- **UI (React):** El usuario cuenta con dos opciones para ingresar el relato de su sueño dentro de la interfaz diseñada con Bootstrap y CSS:
  - **Opción A (Texto):** Escribe su experiencia directamente en un cuadro de texto amplio (`textarea`).
  - **Opción B (Voz):** Presiona un botón de micrófono estilizado para grabar el audio de su relato en vivo.
- **BACKEND:** Si el usuario elige la opción de voz, React envía el archivo de audio crudo (Blob) al servidor de Flask.
- **IA en acción (Solo para Voz):** El backend actúa como un proxy seguro y transmite el audio a la API de Whisper. Whisper convierte la voz en texto exacto en inglés y se lo devuelve a Flask.
- **Resultado en la UI:** El navegador despliega el texto definitivo (ya sea escrito o transcrito por Whisper) dentro del cuadro de edición por si el usuario quiere pulir la redacción, corregir errores o matizar palabras antes de proceder.

## 🧠 Paso 2: Extracción Vectorial de Conceptos Oníricos (Precisión Contextual Local con NumPy)

- **UI (React):** El usuario revisa su texto definitivo, realiza los ajustes necesarios y presiona el botón "Confirmar e Interpretar".
- **Backend + Caché de Memoria (Flask + NumPy):** El servidor de Flask toma el texto final del sueño y ejecuta una búsqueda geométrica en bloque:
  - **Mejora del Diccionario Base:** El diccionario base (~1,000 términos) se ha ampliado previamente con múltiples contextos con su correspondiente `texto_disparador`. Esto aporta precisión gramatical (Ej: diferenciar si una araña persigue al usuario, o si el usuario la aplasta con una piedra).
  - **Formato Vectorial Precargado:** el diccionario se procesa para convertirse en un `.npy` (archivo binario de matrices numéricas densas). Al encender el backend, el `.npy` se monta en la RAM del servidor como caché activa.
  - **Búsqueda Matricial en Bloque:** Flask usa la libreria `sentence-transformers` para convertir textos en vectores matemáticos (`embeddings`) y los compara con los escenarios del diccionario simultáneamente.
- **Resultado:** El motor en memoria RAM localiza el escenario y extrae `summary`.

## 🏎️ Paso 3: Redacción Empática y Síntesis

- **Orquestación (Flask):** El backend combina el texto corregido del usuario con el bloque de significados (`summary`).
- **Elección de la IA:** Flask evalúa la preferencia del usuario:
  - **Opción A (Por defecto):** Usa la clave de la app conectada a OpenRouter, empleando un modelo libre.
  - **Opción B (BYOAI - Pro):** Usa la API Key propia del usuario y el modelo que el usuario haya ingresado en su perfil.
- **Resultado:** El LLM devuelve un JSON en la UI con la interpretación, las emociones predominantes y los símbolos.

## 🗄️ Paso 4: Almacenamiento y Despliegue Visual

- **Base de Datos (SQLAlchemy):** Flask guarda el historial completo (texto original, texto definitivo, los `slugs` de los conceptos detectados y el JSON del LLM).
- **UI Final (React):** La aplicación despliega el resultado de forma visual e intuitiva: la interpretación principal en una tarjeta de Bootstrap, y las emociones y símbolos en etiquetas de colores (`badges`).
