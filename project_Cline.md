# PokemonWorld (API-REST-TCGdex) — Valoración de nivel Fullstack + Overview

> **Veredicto: Senior- (Senior "bajo" con destellos de Senior++).**
> No es Senior++: le faltan **tests automáticos, CI/CD, observabilidad avanzada y documentación técnica completa**.
> No es Senior: demuestra **capacidad fullstack real end-to-end, patrones correctos, conciencia de seguridad/errores y arquitectura sólida** muy por encima de un bootcamp-template sin modificar.

---

## 1. Qué es el proyecto

App fullstack de coleccionismo de cartas Pokémon (TCG):

- **Backend** Flask + SQLAlchemy 2.0 + Alembic + JWT + Bcrypt, que actúa como **API propia** y como **proxy/fachada** de la API pública **TCGdex** (`https://api.tcgdex.net/v2/en`).
- **Frontend** React 19 + Vite + React Router 7 + store con `useReducer`/Context (patrón 4Geeks) + Bootstrap 5.
- **Funcionalidad**: catálogo paginado, búsqueda por nombre (Navbar con debounce), multifiltro avanzado (Sidebar, 12 categorías), detalle de carta, favoritos por usuario persistidos en DB (many-to-many).
- **Despliegue**: Render (`render.yaml`, `Procfile`, `gunicorn`, migraciones en `release`), Docker/Gitpod.

---

## 2. Evidencia técnica (por qué Senior- y no menos)

### Backend

| Hallazgo                                                                                             | Nivel que demuestra |
| ---------------------------------------------------------------------------------------------------- | ------------------- |
| Blueprints anidados (`api` → `user_bp`, `pokemon_bp`, `favorites_bp`) con `url_prefix`               | Senior-             |
| `APIException` centralizada + `@app.errorhandler` global                                             | Senior-             |
| SQLAlchemy 2.0 idiomático: `select()`, `db.session.get()`, `scalars()`, `selectinload()` (evita N+1) | Senior-             |
| Relación many-to-many con tabla de asociación + `UniqueConstraint` (idempotencia)                    | Senior-             |
| Seeding automático al arranque, **commit por categoría** con rollback localizado ante fallo de red   | **Senior++**        |
| Timeouts diferenciados por endpoint externo (`variants` = 20 s)                                      | **Senior++**        |
| Proxy que traduce filtros Front→API (`MAPA_QUERY_CARDS`, `eq:`/`gte:`, `variants.x`)                 | Senior-             |

### Seguridad (punto fuerte)

- Passwords con `bcrypt` (hash + check), nunca en claro.
- JWT (`flask_jwt_extended`) con `identity=str(user.id)`.
- **Validación IDOR** explícita: compara `get_jwt_identity()` con el `user_id` de la URL en PUT/DELETE → 403.
- Reautenticación con `current_password` para **editar o borrar cuenta** (patrón "confirm identity").
- Comprobación de `is_active` → 403 en login y en rutas protegidas.
- Códigos HTTP semánticamente correctos: 400/401/403/404/409/500.

### Frontend

- Estado global con `useReducer` + Context, `actions` memoizadas con `useMemo`.
- `StoreProvider` rehidrata sesión desde el token al cargar la app (validación contra `/profile`).
- **Debounce** (300 ms) de búsqueda sincronizando input ↔ URL (`useSearchParams`, `navigate replace`).
- **Guard de race-condition**: `isInternalNavigation` ref evita que el debounce y la sincronización externa "peleen".
- Helpers defensivos (`closeModalSafely`, `openModalSafely`, `switchModals`) con fallback CSS si Bootstrap no está listo.
- Normalización de datos de la API (`normalizeCard`), fallback de imágenes, `onError`.
- Actualización optimista de favoritos (añade/borra del store + backend).

### DevOps / Config

- `render.yaml` con DB Postgres, `Procfile` con `release: pipenv run upgrade`, `gunicorn wsgi --chdir ./src/`.
- Fallback SQLite para desarrollo local (Windows/VSCode) con creación automática de `instance/`.
- CORS, `.env`, `instance/example.db` para local.

---

## 3. Brechas (por qué NO es Senior++)

| Brecha                                                                                       | Impacto                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Cero tests** (no hay `tests/`, ni pytest, ni Vitest/RTL)                                   | El mayor bloqueador para Senior++    |
| Sin capa de validación formal (no Marshmallow/Pydantic) — validación manual repetida         | Deuda y duplicación                  |
| Sin rate limiting, sin sanitización más allá de `.strip()`, sin rotación de tokens           | Seguridad "buena" pero no endurecida |
| JWT en `localStorage` (vulnerable a XSS) sin HttpOnly cookie                                 | Senior- típico                       |
| `totalPages` / paginación definidos en el store pero no cableados completamente en UI        | Funcionalidad a medias               |
| Inconsistencia de reglas: login exige mín. 6 chars, signup exige 8 + letra/número            | Contrato front/back desalineado      |
| `console.error` silencioso en varios `catch` (errores no se propagan al usuario)             | Observabilidad débil                 |
| Import duplicado en `pokemon_bp.py`; abundantes comentarios "didácticos" en producción       | Pulido pendiente                     |
| Sin CI (GitHub Actions), sin lint bloqueante en build, sin Docker Compose del stack completo | Proceso de ingeniería junior         |
| `CORS(app)` llamado dos veces en `app.py`                                                    | Detalle menor                        |

---

## 4. Rúbrica rápida

| Área                                                       | Nivel observado                                  |
| ---------------------------------------------------------- | ------------------------------------------------ |
| API REST / diseño de endpoints                             | **Senior-**                                      |
| ORM / modelado de datos (SQLAlchemy 2.0, M2M, Alembic)     | **Senior- → Senior++**                           |
| Autenticación / seguridad                                  | **Senior-** (destellos Senior++ en IDOR/re-auth) |
| Frontend React (estado, hooks, routing)                    | **Senior-**                                      |
| Integración con API externa (proxy, timeouts, resiliencia) | **Senior++**                                     |
| Resiliencia / manejo de errores backend                    | **Senior++**                                     |
| Testing / CI-CD / calidad automatizada                     | **Estudiante → Junior**                          |
| **Global ponderado**                                       | **Senior- (limítrofe con Senior++)**             |

---

## 5. Ruta para subir a Senior++

1. Añadir `pytest` (backend) + Vitest/RTL (frontend) con casos de auth, IDOR, favoritos y reducers.
2. Introducir esquemas de validación (Marshmallow/Pydantic) y eliminar validación manual duplicada.
3. Migrar JWT a cookie `HttpOnly` + refresh tokens; añadir `flask-limiter`.
4. GitHub Actions: lint (ESLint + flake8/pylint) + tests + build obligatorios.
5. Cablear paginación real en UI y unificar reglas de password front/back.
6. Sustituir `console.error` por un manejador que informe al usuario (toast + store).
7. Limpiar comentarios didácticos y duplicados; añadir logging estructurado.

---

## 6. Lectura recomendada (orden)

1. `src/app.py` — arranque, seeding, config DB/JWT/CORS, registro de blueprints.
2. `src/Backend/models.py` — esquema y relación M2M usuario↔pokémon.
3. `src/Backend/blueprints/user_bp.py` — auth, IDOR, re-auth con `current_password`.
4. `src/Backend/blueprints/pokemon_bp.py` — proxy multifiltro TCGdex + `run_filter_sync()` idempotente.
5. `src/Frontend/hooks/actions.js` — capa de datos: fetch, normalización, favoritos, auth headers.
6. `src/Frontend/store.js` + `src/Frontend/hooks/StoreProvider.jsx` — estado global y rehidratación de sesión.
7. `src/Frontend/pages/Home.jsx` + `components/Navbar.jsx` — prioridad de render (search/filter/base) y debounce.

---

_Documento generado en Explore Mode. Resumen: proyecto de bootcamp Fullstack de calidad **Senior-**, con arquitectura limpia, seguridad cuidada y funcionalidad completa, con brechas en automatización y testing._
