from api.blueprints.user_bp import user_bp
from api.blueprints.pokemon_bp import pokemon_bp
from api.blueprints.favorites_bp import favorites_bp
from flask import Blueprint
from api.blueprints.user_bp import user_bp
from api.blueprints.pokemon_bp import pokemon_bp
from api.blueprints.favorites_bp import favorites_bp

api = Blueprint('api', __name__)

# REGISTRO DE BLUEPRINTS
api.register_blueprint(user_bp, url_prefix='/auth')
api.register_blueprint(pokemon_bp, url_prefix='/pok')
api.register_blueprint(favorites_bp, url_prefix='/favorites')
