# PokemonWorld (API-REST-TCGdex) — Valoración de nivel Fullstack

> **VEREDICTO: Junior+** (Junior "alto", limitando con **Senior-**).
> Hay módulos puntuales que rayan Senior- (resiliencia backend, integración de API externa). El bloqueador para Senior es la **ausencia total de tests y automatización**.

*(Informe completo guardado en `project_info__1.md`)*

---

## 1. Qué es

- **Fullstack real**: Flask + SQLAlchemy 2.0 + Alembic + JWT + Bcrypt (**backend**) ↔ React 19 + Vite + Router 7 + `useReducer`/Context + Bootstrap (**frontend**).
- El backend actúa además como **proxy/fachada** de la API pública TCGdex.
- Funcionalidad: catálogo, búsqueda con debounce, multifiltro (12 categorías), detalle, favoritos M2M persistidos, despliegue en Render.

---

## 2. Razones de la nota (evidencia a favor)

| Hallazgo | Nivel |
|---|---|
| Blueprints anidados + `url_prefix` (`api`/`auth`/`pok`/`favorites`) | Junior+ |
| `APIException` centralizada + `@app.errorhandler` global | Junior+ |
| SQLAlchemy 2.0 idiomático (`select`, `session.get`, `selectinload` → evita N+1) | Junior+/Senior- |
| M2M con `UniqueConstraint` (idempotencia) | Junior+ |
| **Seeding con commit-por-categoría + rollback localizado** ante fallo de red | **Senior-** |
| **Timeouts diferenciados por endpoint externo** (`variants`=20s) | **Senior-** |
| **Validación IDOR** (token vs `user_id` URL) + **re-auth con `current_password`** para editar/borrar cuenta | **Senior-** |
| Códigos HTTP semánticos (400/401/403/404/409/500) + `is_active` check | Junior+ |
| Frontend: store con `useReducer`, `actions` memoizadas, **debounce + guard de race-condition** (`isInternalNavigation`), helpers de modal con fallback | Junior+/Senior- |
| DevOps: `render.yaml`, `Procfile` (`release: migrate`), `gunicorn`, fallback SQLite local | Junior+ |

---

## 3. Razones de por qué NO es Senior

| Brecha | Impacto |
|---|---|
| **Cero tests** (ni pytest, ni Vitest/RTL) | 🔴 Bloqueador principal |
| Sin capa de validación formal (sin Marshmallow/Pydantic) | Deuda/duplicación |
| Sin rate limiting ni rotación de tokens; JWT en `localStorage` | Seguridad buena, no endurecida |
| `totalPages` en store pero paginación no cableada en UI | Feature a medias |
| Login exige 6 chars vs signup exige 8 → contrato desalineado | Bug latente |
| `console.error` silencioso (errores no llegan al usuario) | Observabilidad débil |
| Sin CI (Actions), sin lint bloqueante, sin Docker Compose completo | Proceso junior |
| Import duplicado en `pokemon_bp.py` + comentarios didácticos en producción | Pulido pendiente |

---

## 4. Rúbrica

| Área | Nivel |
|---|---|
| API REST / diseño de endpoints | Junior+ |
| ORM / modelado (SQLAlchemy 2.0, M2M, Alembic) | Junior+ → Senior- |
| Autenticación / seguridad | Junior+ (destellos Senior-) |
| Frontend React | Junior+ |
| Integración API externa / resiliencia | **Senior-** |
| Manejo de errores backend | **Senior-** |
| Testing / CI-CD | Estudiante → Junior |
| **Global** | **Junior+ (limítrofe Senior-)** |

---

## 5. Para llegar a Senior-
1. Tests (pytest + Vitest/RTL) en auth, IDOR, favoritos, reducers.
2. Validación con esquemas (Marshmallow/Pydantic).
3. JWT a cookie `HttpOnly` + refresh tokens + `flask-limiter`.
4. GitHub Actions (lint + tests + build) obligatorios.
5. Cablear paginación real y unificar reglas de password.
6. Reemplazar `console.error` por manejo de errores visible al usuario.

---

**Resumen en una línea:** arquitectura limpia, seguridad cuidada y buen manejo de una API externa → **Junior+ sólido**; le falta la disciplina ingenieril (tests, CI, validación formal) que marca el salto a Senior-.