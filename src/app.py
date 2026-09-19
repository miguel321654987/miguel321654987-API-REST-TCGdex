"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from Backend.utils import APIException, generate_sitemap
from Backend.admin import setup_admin
from Backend.models import db, FilterOption
from flask_jwt_extended import JWTManager
from Backend.routes import api
from Backend.extensions import bcrypt
# Importamos la función pura de sincronización para el seeding automático al arrancar
from Backend.blueprints.pokemon_bp import run_filter_sync
from sqlalchemy import select

load_dotenv()

app = Flask(__name__)

CORS(app)

# Nota: este fallback es para trabajar en modo local desde VS Code/localhost.
app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY', 'local-dev-secret-key')

jwt = JWTManager(app)

# UNIÓN OFICIAL: Aquí le inyectamos el motor Flask a Bcrypt
bcrypt.init_app(app)

app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url is not None and not db_url.startswith("sqlite:///"):
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    # Bloque especial para Windows Local
    base_dir = os.path.abspath(os.path.dirname(__file__))
    instance_dir = os.path.join(base_dir, 'instance')

    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir)

    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(instance_dir, 'example.db')}"

MIGRATE = Migrate(app, db)
db.init_app(app)


CORS(app)
setup_admin(app)


# REGISTRO DE BLUEPRINTS
# Registramos el blueprint maestro 'api' que viene de routes.py
app.register_blueprint(api, url_prefix='/api')


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code


# generate sitemap with all your endpoints

@app.route('/')
def sitemap():
    return generate_sitemap(app)


# ==============================================================================
# CONTROL DE ARRANQUE: SEEDING DE FILTROS Y APERTURA DE PUERTOS
#
# Esta condición 'if' es crucial:
# - SI ejecutas '$ pipenv run start', evalúa como VERDADERO y corre todo el bloque.
# - SI ejecutas '$ pipenv run migrate', evalúa como FALSO, ignorando el seeding
#   y permitiendo que la migración termine al instante sin dar Timeout en la red.
# ==============================================================================
if __name__ == '__main__':

    # --------------------------------------------------------------------------
    # FASE 1: SEEDING AUTOMÁTICO DE DATOS (Solo al encender el servidor)
    # --------------------------------------------------------------------------
    # Creamos el contexto de la aplicación para poder interactuar de forma segura con la DB
    with app.app_context():
        # Consultamos un único registro para verificar si la tabla ya tiene información
        stmt = select(FilterOption).limit(1)
        primer_registro = db.session.execute(stmt).scalar_one_or_none()

        # Si la tabla está completamente vacía, disparamos la descarga desde la API
        if primer_registro is None:
            print("⏳ Servidor iniciado. Detectada DB vacía.")
            print("⏳ Seeding inicial: descargando catálogos de filtros desde TCGdex...")

            # Llama a la función del backend para traer los filtros (ahora de forma segura)
            total = run_filter_sync()

            print(
                f"✅ Seeding completado: {total} opciones de filtro guardadas en la DB.")
        else:
            # Si ya hay datos, evitamos peticiones HTTP innecesarias para acelerar el arranque
            print("✅ Catálogos de filtros ya disponibles en la base de datos.")

    # --------------------------------------------------------------------------
    # FASE 2: LANZAMIENTO DEL SERVIDOR WEB FLASK
    # --------------------------------------------------------------------------
    # Leemos el puerto asignado en las variables de entorno (por defecto el 3000)
    PORT = int(os.environ.get('PORT', 3000))

    print(f"🚀 Servidor Flask listo y escuchando en el puerto {PORT}...")

    # Encendemos los sockets de Flask para empezar a recibir peticiones de usuarios o frontend
    app.run(host='0.0.0.0', port=PORT, debug=False)
