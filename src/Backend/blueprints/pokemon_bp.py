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
    "hp": "hps",
    "category": "categories",
    "dexId": "dexids",
    "energyType": "energytypes",
    "stage": "stages",
    "suffix": "suffixes",
    "variants": "variants",
}


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


@pokemon_bp.route('/filters/sync', methods=['POST'])
def sync_filters():
    """Syncs filter options from TCGdex API into local database filter_options table"""
    try:
        total_added = 0

        for key, endpoint in FILTER_ENDPOINTS.items():
            url = f"https://api.tcgdex.net/v2/en/{endpoint}"
            response = requests.get(url, timeout=10)

            if not response.ok:
                continue

            data = response.json()
            if not isinstance(data, list):
                continue

            for item in data:
                if item is None or str(item).strip() == "":
                    continue

                value_clean = str(item).strip()

                # Check if this category-value pair already exists
                stmt = select(FilterOption).where(
                    FilterOption.category == key,
                    FilterOption.value == value_clean
                )
                existing = db.session.execute(stmt).scalar_one_or_none()

                if existing is None:
                    new_option = FilterOption(
                        category=key,
                        value=value_clean
                    )
                    db.session.add(new_option)
                    total_added += 1

        db.session.commit()

        return jsonify({
            "message": "Filters synced successfully with database",
            "total_new_added": total_added
        }), 200

    except Exception as e:
        db.session.rollback()
        raise APIException(
            f"Error syncing filter options: {str(e)}", status_code=500)
