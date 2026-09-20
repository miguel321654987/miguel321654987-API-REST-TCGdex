import requests
from flask import Blueprint, request, jsonify
from Backend.models import db, Pokemon, FilterOption
from sqlalchemy import select
from Backend.utils import APIException

# 1. Definimos el Blueprint
pokemon_bp = Blueprint('Pokemon', __name__)


@pokemon_bp.route('/pokemon/<string:pokemon_id>', methods=['GET'])
def get_pokemon_by_id(pokemon_id):
    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

    return jsonify({
        "message": "Pokémon obtenido con éxito",
        "results": pokemon.serialize()
    }), 200


@pokemon_bp.route('/pokemon', methods=['POST'])
def create_pokemon():
    body = request.get_json()

    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON",
            status_code=400
        )

    # === CAMBIO: recibimos el ID string de TCGdex ===
    pokemon_id = body.get('id')

    if (
        not pokemon_id
        or not isinstance(pokemon_id, str)
        or pokemon_id.strip() == ""
    ):
        raise APIException(
            "El campo 'id' es obligatorio y debe ser un texto válido",
            status_code=400
        )

    # === CAMBIO: limpiamos el ID antes de guardarlo ===
    id_clean = pokemon_id.strip()

    pokemon_name = body.get('pokemon_name')
    if (
        not pokemon_name
        or not isinstance(pokemon_name, str)
        or pokemon_name.strip() == ""
    ):
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y debe ser un texto válido",
            status_code=400
        )

    name_clean = pokemon_name.strip()

    # === CAMBIO: comprobamos que no exista ya ese ID ===
    if db.session.get(Pokemon, id_clean):
        raise APIException(
            f"El Pokémon con ID '{id_clean}' ya existe en la base de datos",
            status_code=409
        )

    stmt = select(Pokemon).where(Pokemon.pokemon_name == name_clean)
    exist_pokemon = db.session.execute(stmt).scalar_one_or_none()

    if exist_pokemon is not None:
        raise APIException(
            f"El Pokémon '{name_clean}' ya existe en la base de datos",
            status_code=409
        )

    try:
        # === CAMBIO: guardamos explícitamente el ID string de TCGdex ===
        new_pokemon = Pokemon(
            id=id_clean,
            pokemon_name=name_clean
        )

        db.session.add(new_pokemon)
        db.session.commit()

        return jsonify({
            "message": "Pokémon creado con éxito",
            "results": new_pokemon.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno del servidor al crear el Pokémon: {str(e)}", status_code=500)


@pokemon_bp.route('/pokemon/<string:pokemon_id>', methods=['DELETE'])
def delete_pokemon(pokemon_id):
    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no existe", status_code=404)

    # CORRECCIÓN: Guardamos el nombre antes del commit para evitar errores de expiración
    pokemon_name = pokemon.pokemon_name

    try:
        db.session.delete(pokemon)
        db.session.commit()

        return jsonify({
            "message": f"Pokémon '{pokemon_name}' eliminado con éxito",
            "id_deleted": pokemon_id
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al eliminar el Pokémon: {str(e)}", status_code=500)


@pokemon_bp.route('/pokemon/<string:pokemon_id>', methods=['PUT'])
def update_pokemon(pokemon_id):
    body = request.get_json()

    if body is None:
        raise APIException(
            "Debes incluir el cuerpo (body) en formato JSON", status_code=400)

    pokemon_name = body.get('pokemon_name')
    if not pokemon_name or not isinstance(pokemon_name, str) or pokemon_name.strip() == "":
        raise APIException(
            "El campo 'pokemon_name' es obligatorio y debe ser un texto válido", status_code=400)

    pokemon = db.session.get(Pokemon, pokemon_id)

    if pokemon is None:
        raise APIException(
            f"El Pokémon con ID {pokemon_id} no fue encontrado", status_code=404)

    name_clean = pokemon_name.strip()

    if name_clean != pokemon.pokemon_name:
        stmt = select(Pokemon).where(Pokemon.pokemon_name == name_clean)
        name_taken = db.session.execute(stmt).scalar_one_or_none()
        if name_taken:
            raise APIException(
                f"El nombre '{name_clean}' ya está registrado en otro Pokémon", status_code=409)

    try:
        pokemon.pokemon_name = name_clean
        db.session.commit()

        return jsonify({
            "message": "Pokémon actualizado con éxito",
            "results": pokemon.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error interno al actualizar el Pokémon: {str(e)}", status_code=500)


# === CATÁLOGOS DE FILTROS ===

FILTER_ENDPOINTS = {
    "types": "types",
    "retreat": "retreats",
    "rarity": "rarities",
    "illustrator": "illustrators",
    "hp": "hp",
    "category": "categories",
    "energyType": "energy-types",
    "regulationmarks": "regulation-marks",
    "stage": "stages",
    "suffix": "suffixes",
    "trainertypes": "trainer-types",
    "variants": "variants",
}

# Consulta la db local y devuelve un objeto JSON agrupado
#  con los arrays ordenados por categoría para el Frontend.


@pokemon_bp.route('/filters', methods=['GET'])
def get_filters():
    """Returns grouped filter options from database for frontend store.api.filters"""
    try:
        stmt = select(FilterOption)
        results = db.session.execute(stmt).scalars().all()

        # Initialize dictionary structure with empty arrays
        grouped_filters = {key: [] for key in FILTER_ENDPOINTS.keys()}

        # Group values by category
        for option in results:
            if option.category in grouped_filters:
                grouped_filters[option.category].append(option.value)

        return jsonify({
            "message": "Filter options fetched successfully",
            "results": grouped_filters
        }), 200

    except Exception as e:
        raise APIException(
            f"Error fetching filter options from DB: {str(e)}", status_code=500)


# ================================================================
# FUNCIÓN PURA DE SINCRONIZACIÓN (sin decorador Flask)
#
# Al separar la lógica del endpoint HTTP, esta función puede ser
# invocada desde dos lugares distintos:
#   1. Desde el endpoint POST /filters/sync (llamada manual/admin).
#   2. Desde app.py al arrancar el servidor (seeding automático).
#
# Así evitamos duplicar código y mantenemos un único punto de verdad.
# ================================================================
def run_filter_sync():
    """Consulta los 11 catálogos de TCGdex y guarda los valores en la DB.
    Puede ser llamada tanto desde el endpoint HTTP como al arrancar Flask."""

    total_added = 0  # Contador de nuevos registros insertados en esta ejecución

    for key, endpoint in FILTER_ENDPOINTS.items():
        # Construimos la URL completa del catálogo de TCGdex
        url = f"https://api.tcgdex.net/v2/en/{endpoint}"

        # Petición HTTP al servidor externo TCGdex con timeout de seguridad
        response = requests.get(url, timeout=10)

        # Si el endpoint externo falla, continuamos con el siguiente sin abortar todo
        if not response.ok:
            print(f"⚠️  No se pudo obtener el catálogo '{key}' ({url})")
            continue

        data = response.json()

        # TCGdex devuelve un array directo; si no, ignoramos este catálogo
        if not isinstance(data, list):
            continue

        for item in data:
            # Descartamos valores nulos o en blanco que no son útiles como opción de filtro
            if item is None or str(item).strip() == "":
                continue

            value_clean = str(item).strip()

            # Comprobamos si el par (categoría, valor) ya existe para evitar duplicados.
            # La restricción UniqueConstraint del modelo también lo garantiza,
            # pero esta comprobación previa evita excepciones innecesarias.
            stmt = select(FilterOption).where(
                FilterOption.category == key,
                FilterOption.value == value_clean
            )
            existing = db.session.execute(stmt).scalar_one_or_none()

            if existing is None:
                # Solo insertamos si el valor no estaba ya en la base de datos
                db.session.add(FilterOption(category=key, value=value_clean))
                total_added += 1

    # Confirmamos todos los insertos de esta ejecución en un único commit
    db.session.commit()

    return total_added


# ================================================================
# ENDPOINT HTTP: POST /filters/sync
#
# Permite disparar la sincronización manualmente desde Postman,
# un script de administración o un panel de control.
# Delega toda la lógica en run_filter_sync() para no duplicar código.
# ================================================================
@pokemon_bp.route('/filters/sync', methods=['POST'])
def sync_filters():
    """Sincroniza las opciones de filtro desde TCGdex hacia la base de datos local."""
    try:
        total_added = run_filter_sync()

        return jsonify({
            "message": "Filtros sincronizados correctamente con la base de datos",
            "total_new_added": total_added
        }), 200

    except Exception as e:
        # Si algo falla a mitad del proceso, revertimos todos los cambios pendientes
        db.session.rollback()
        raise APIException(
            f"Error al sincronizar las opciones de filtro: {str(e)}", status_code=500)
