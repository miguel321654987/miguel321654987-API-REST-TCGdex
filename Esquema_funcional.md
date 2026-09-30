# ESQUEMA FUNCIONAL DE APP "SEGUIMIENTO DE HIGIENE DEL SUEÑO"

## 📥 Paso 1: Entrada de Datos de Higiene del Sueño

- **UI (React):** El usuario cuenta con un formulario para ingresar sus hábitos diarios de higiene del sueño dentro de la interfaz diseñada con Bootstrap y CSS:
  - **Actividad física del día:** Selector con opciones: nada, baja, media, alta
  - **Tipo de cena:** Selector con opciones: nada, ligera, media, pesada
  - **Sensación general antes de dormir:** Selector con opciones: cansada, estresada, relajada, triste, alegre
  - **Tiempo de uso de pantallas:** Selector con opciones: móvil, laptop, tablet
  - **Incidencias puntuales:** Selector múltiple con opciones: accidente, buenas noticias, malas noticias, premios, multas, etc.
  - **Campo de comida:** Entrada de texto con sugerencias nutricionales
- **BACKEND:** React envía los datos del formulario al servidor de Flask.
- **API Externa (CalorieNinjas):** El backend actúa como proxy y transmite la información de comida a la API de CalorieNinjas. Esta API devuelve información nutricional detallada (calorías, cafeína, azúcar, etc.).
- **Resultado en la UI:** El navegador muestra la información nutricional obtenida y permite al usuario revisar y confirmar sus datos antes de proceder.

## 🧠 Paso 2: Análisis de Patrones con IA y Nutrición

- **UI (React):** El usuario revisa sus datos confirmados y presiona el botón "Guardar y Analizar".
- **Backend + Lógica de Negocio (Flask):** El servidor de Flask procesa los datos históricos y la información nutricional:
  - **Integración con CalorieNinjas:** Obtiene datos nutricionales detallados de las comidas registradas
  - **Análisis de correlaciones:** Busca patrones entre hábitos y factores nutricionales
  - **Preparación de prompt para IA:** Compila todos los datos relevantes para el análisis
- **Resultado:** El sistema identifica patrones y correlaciones en los datos del usuario.

## 🏎️ Paso 3: Generación de Recomendaciones con IA

- **Orquestación (Flask):** El backend combina los datos del usuario con el análisis histórico.
- **Elección de la IA:** Flask evalúa la preferencia del usuario:
  - **Opción A (Por defecto):** Usa la clave de la app conectada a OpenRouter, empleando un modelo libre.
  - **Opción B (BYOAI - Pro):** Usa la API Key propia del usuario y el modelo que el usuario haya ingresado en su perfil.
- **Resultado:** El LLM devuelve un JSON en la UI con recomendaciones personalizadas basadas en análisis nutricional y patrones de comportamiento.

## 🗄️ Paso 4: Almacenamiento y Despliegue Visual

- **Base de Datos (SQLAlchemy):** Flask guarda el historial completo (datos de higiene, información nutricional, patrones identificados y recomendaciones generadas).
- **UI Final (React):** La aplicación despliega el resultado de forma visual e intuitiva: 
  - Interpretación principal en una tarjeta de Bootstrap
  - Estadísticas de patrones identificados en gráficos
  - Recomendaciones personalizadas en tarjetas de colores
  - Historial de registros anteriores en lista interactiva