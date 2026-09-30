#!/usr/bin/env python3
"""
Ejemplo final práctico de cómo se usarían Marshmallow y Pydantic 
en el contexto del proyecto TCGdex
"""

# Importaciones necesarias
from marshmallow import Schema, fields, ValidationError
from pydantic import BaseModel, field_validator
from typing import Optional

print("=== EJEMPLO FINAL DE VALIDACIÓN EN TCGDEX ===\n")

# Datos de ejemplo que representan la estructura del proyecto
usuario_ejemplo = {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "password": "contraseña_segura",
    "last_name": "Pérez",
    "is_active": True
}

print("Datos de ejemplo (estructura de usuario en TCGdex):")
print(f"Usuario: {usuario_ejemplo}\n")

# ======================================================
# 1. VALIDACIÓN CON MARSHMALLOW (como se usaría en el proyecto)
# ======================================================

print("=== 1. VALIDACIÓN CON MARSHMALLOW ===")

# Definición del esquema de usuario para validación (como se usaría en el proyecto)
class UserCreateSchema(Schema):
    name = fields.Str(required=True, validate=lambda x: len(x) > 2)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
    last_name = fields.Str(required=True, validate=lambda x: len(x) > 1)
    is_active = fields.Bool(required=False)  # Sin default para evitar errores

# Validación con Marshmallow
try:
    user_schema = UserCreateSchema()
    validated_user = user_schema.load(usuario_ejemplo)
    print("✓ Usuario validado correctamente con Marshmallow:")
    print(f"  {validated_user}")
except ValidationError as err:
    print("✗ Error de validación en Marshmallow:")
    print(f"  {err.messages}")

# Ejemplo de validación fallida con Marshmallow
print("\n--- Ejemplo de validación fallida con Marshmallow ---")
usuario_invalido = {
    "name": "Ju",  # Nombre demasiado corto
    "email": "invalid-email",  # Email inválido
    "password": "123",  # Contraseña muy corta
    "last_name": "G",  # Apellido muy corto
    "is_active": True
}

try:
    validated_user = user_schema.load(usuario_invalido)
    print("✓ Usuario validado correctamente")
except ValidationError as err:
    print("✗ Error de validación (como se esperaba):")
    print(f"  {err.messages}")

# ======================================================
# 2. VALIDACIÓN CON PYDANTIC (como se usaría en el proyecto)
# ======================================================

print("\n=== 2. VALIDACIÓN CON PYDANTIC ===")

# Definición del modelo de usuario para validación (como se usaría en el proyecto)
class UserCreatePydantic(BaseModel):
    name: str
    email: str
    password: str
    last_name: str
    is_active: bool = True
    
    @field_validator('name')
    @classmethod
    def name_must_be_longer_than_2(cls, v):
        if len(v) <= 2:
            raise ValueError('El nombre debe tener más de 2 caracteres')
        return v
    
    @field_validator('password')
    @classmethod
    def password_must_be_longer_than_8(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v
    
    @field_validator('last_name')
    @classmethod
    def last_name_must_be_longer_than_1(cls, v):
        if len(v) <= 1:
            raise ValueError('El apellido debe tener más de 1 carácter')
        return v

# Validación con Pydantic
try:
    validated_user = UserCreatePydantic(**usuario_ejemplo)
    print("✓ Usuario validado correctamente con Pydantic:")
    print(f"  {validated_user}")
except Exception as err:
    print("✗ Error de validación en Pydantic:")
    print(f"  {err}")

# Ejemplo de validación fallida con Pydantic
print("\n--- Ejemplo de validación fallida con Pydantic ---")
try:
    validated_user = UserCreatePydantic(**{
        "name": "Ju",  # Nombre demasiado corto
        "email": "invalid-email",  # Email inválido
        "password": "123",  # Contraseña muy corta
        "last_name": "G",  # Apellido muy corto
        "is_active": True
    })
    print("✓ Usuario validado correctamente")
except Exception as err:
    print("✗ Error de validación (como se esperaba):")
    print(f"  {err}")

# ======================================================
# 3. CÓMO SE USARÍA EN EL PROYECTO REAL
# ======================================================

print("\n=== 3. CÓMO SE USARÍA EN EL PROYECTO REAL ===")

print("\nEn el archivo src/Backend/blueprints/user_bp.py, se podría tener algo así:")

codigo_ejemplo = '''
# Importar en el archivo user_bp.py
from marshmallow import Schema, fields, ValidationError
from flask import request, jsonify

# Definir el esquema de validación
class UserRegisterSchema(Schema):
    name = fields.Str(required=True, validate=lambda x: len(x) > 2)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
    last_name = fields.Str(required=True, validate=lambda x: len(x) > 1)

# Endpoint de registro
@app.route('/api/auth/signup', methods=['POST'])
def register_user():
    try:
        # Validar los datos recibidos
        schema = UserRegisterSchema()
        data = schema.load(request.json)
        
        # Procesar los datos validados...
        # Crear usuario en base de datos
        
        return jsonify({"message": "Usuario registrado exitosamente"}), 201
        
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400
'''

print(codigo_ejemplo)

print("\n=== RESUMEN DE LA IMPLEMENTACIÓN ===")
print("• Marshmallow es ideal para proyectos Flask existentes")
print("• Pydantic es ideal para proyectos FastAPI o cuando se necesita validación estricta")
print("• Ambos ayudan a prevenir errores al validar datos antes de procesarlos")
print("• Son fundamentales para mantener la integridad de los datos en APIs REST")

print("\n=== FIN DEL EJEMPLO ===")