# Integración de Supabase en COFEPRIS Pro

## 🎯 Resumen de la Integración

Se ha integrado exitosamente **Supabase** en la aplicación COFEPRIS Pro, reemplazando MongoDB con una solución más robusta que incluye:

- ✅ **PostgreSQL Database** - Base de datos relacional con JSONB support
- ✅ **Autenticación Avanzada** - JWT, OAuth, MFA 
- ✅ **Row Level Security** - Seguridad a nivel de fila
- ✅ **Real-time Features** - Funcionalidades en tiempo real
- ✅ **File Storage** - Almacenamiento de archivos
- ✅ **API Auto-generada** - REST API automática

## 🗄️ Esquema de Base de Datos

### Tablas Principales

```sql
-- Usuarios (extiende auth.users de Supabase)
users: id, email, nombre, telefono, rol, estado_suscripcion, etc.

-- Establecimientos por usuario
establishments: id, usuario_id, giro, servicios, equipo_especial, etc.

-- Plantillas de documentos
document_templates: id, nombre, categoria, campos_definicion, etc.

-- Trámites COFEPRIS
tramites: id, nombre, autoridad, requisitos, costo_externo, etc.

-- Reglas de sugerencias IA
suggestion_rules: id, condiciones, items_sugeridos, justificacion, etc.

-- Instancias de documentos por usuario
document_instances: id, usuario_id, plantilla_id, campos, estado, etc.

-- Expedientes digitales
expediente: id, usuario_id, items, estatus_cumplimiento, etc.

-- Sistema de cursos
course_modules: id, titulo, contenido_html, quiz, etc.
course_progress: id, usuario_id, modulo_id, estado, score, etc.

-- Consultas de IA
consultations: id, usuario_id, pregunta, razonamiento, respuesta, etc.
```

## 🚀 Configuración para Producción

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y nuevo proyecto
3. Obtén las credenciales del proyecto

### 2. Configurar Variables de Entorno

Actualiza `/app/backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_KEY=tu-clave-de-servicio
JWT_SECRET=tu-jwt-secret
```

### 3. Ejecutar Migración de Esquema

```bash
# 1. Ejecuta el esquema SQL en Supabase Dashboard > SQL Editor
cat /app/backend/supabase_schema.sql

# 2. O ejecuta la migración automática
cd /app/backend
python migrate_to_supabase.py
```

### 4. Cambiar al Servidor Supabase

```bash
# Actualizar supervisor para usar servidor Supabase
sudo sed -i 's/server:app/server_supabase:app/' /etc/supervisor/conf.d/supervisord.conf
sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl restart backend
```

## 🔐 Seguridad y Autenticación

### Row Level Security (RLS)

Supabase implementa automáticamente políticas de seguridad:

```sql
-- Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own data" ON establishments
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Acceso público a plantillas y trámites
CREATE POLICY "Public read access" ON document_templates
    FOR SELECT USING (activo = true);
```

### JWT Authentication

El sistema usa JWT tokens seguros:

```python
# Creación de token
def create_jwt_token(user_data: dict) -> str:
    payload = {
        "user_id": user_data["id"],
        "email": user_data["email"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
```

## 📊 Ventajas de Supabase vs MongoDB

| Característica | MongoDB | Supabase (PostgreSQL) |
|----------------|---------|----------------------|
| **Esquema** | Flexible NoSQL | Relacional + JSONB |
| **Consultas** | MongoDB Query | SQL + PostgREST |
| **Autenticación** | Manual | Integrada + OAuth |
| **Seguridad** | Manual | RLS automático |
| **Tiempo Real** | Change Streams | WebSockets nativos |
| **Backups** | Manual | Automáticos |
| **Escalabilidad** | Horizontal | Vertical + Read Replicas |
| **Compliance** | Manual | Built-in GDPR, SOC2 |

## 🛠️ API Endpoints Actualizados

### Autenticación
```bash
POST /api/auth/register  # Registro con Supabase Auth
POST /api/auth/login     # Login con JWT tokens
```

### Establecimientos
```bash
POST /api/establishments  # Crear establecimiento
GET  /api/establishments  # Listar establecimientos del usuario
```

### IA y Sugerencias
```bash
POST /api/suggestions      # Generar sugerencias regulatorias
POST /api/ai/consultation  # Consultar IA especializada
```

### Templates y Trámites
```bash
GET /api/templates  # Plantillas de documentos
GET /api/tramites   # Trámites COFEPRIS
```

## 🔄 Funciones en Tiempo Real

### Configuración Real-time

```python
# Suscribirse a cambios en documentos
supabase.channel('documents') \
    .on('postgres_changes', 
        {'event': '*', 'schema': 'public', 'table': 'document_instances'},
        handle_document_change) \
    .subscribe()
```

### Casos de Uso

- **Colaboración de documentos**: Ver quién está editando
- **Notificaciones instantáneas**: Cambios de estado
- **Dashboard en vivo**: Métricas actualizadas
- **Chat de soporte**: Comunicación en tiempo real

## 📁 Almacenamiento de Archivos

### Configuración Storage

```python
# Subir documento PDF
supabase.storage.from_('documents').upload(
    f'user_{user_id}/documento.pdf',
    file_data
)

# Obtener URL firmada
url = supabase.storage.from_('documents').create_signed_url(
    f'user_{user_id}/documento.pdf',
    expires_in=3600
)
```

### Organización de Archivos

```
documents/
├── user_123/
│   ├── poe/
│   │   ├── limpieza.pdf
│   │   └── desinfeccion.pdf
│   ├── rpbi/
│   │   └── manejo_rpbi.pdf
│   └── tramites/
│       └── aviso_funcionamiento.pdf
```

## 📈 Migración de Datos Existentes

### Proceso Automático

El script `migrate_to_supabase.py` maneja:

1. **Conversión de tipos**: ObjectId → UUID
2. **Mapeo de esquemas**: Documentos → Tablas relacionales
3. **Validación de datos**: Limpieza y normalización
4. **Preservación de relaciones**: Foreign keys automáticas

### Ejecución

```bash
cd /app/backend
python migrate_to_supabase.py

# Output esperado:
# ✅ Collections migrated: 8
# ✅ Documents migrated: 1,234
# ✅ Errors encountered: 0
```

## 🧪 Testing y Validación

### Verificar Instalación

```bash
# Test de salud
curl https://tu-app.com/api/health
# Response: {"status":"healthy","database":"supabase"}

# Test de sugerencias
curl -X POST https://tu-app.com/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{"giro":"CONSULTORIO_ODONTO","maneja_rpbi":true}'
```

### Tests Automatizados

```python
# Test de autenticación
async def test_supabase_auth():
    response = await client.post("/api/auth/register", json={
        "nombre": "Test User",
        "email": "test@example.com",
        "password": "test123456"
    })
    assert response.status_code == 200
    assert "token" in response.json()
```

## 🚨 Troubleshooting

### Errores Comunes

1. **"Invalid API key"**
   - Verificar variables de entorno
   - Confirmar claves en Supabase Dashboard

2. **"RLS violation"** 
   - Revisar políticas de seguridad
   - Verificar autenticación de usuario

3. **"Connection failed"**
   - Verificar URL de proyecto
   - Confirmar configuración de red

### Logs Útiles

```bash
# Logs del backend
tail -f /var/log/supervisor/backend.out.log

# Logs de Supabase (en dashboard)
# Settings > Logs > API/Database
```

## 🔮 Próximos Pasos

### Características Avanzadas

1. **OAuth Integration**
   - Google, Microsoft, Apple login
   - SSO empresarial

2. **Advanced Real-time**
   - Presence tracking
   - Collaborative editing
   - Live cursors

3. **AI/ML Features**
   - pgvector for embeddings
   - Document similarity
   - Smart categorization

4. **Advanced Security**
   - API rate limiting
   - Advanced audit logs
   - Compliance reporting

## 📚 Recursos Adicionales

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Real-time Features](https://supabase.com/docs/guides/realtime)

---

**🎉 ¡Integración completada exitosamente!**

La aplicación COFEPRIS Pro ahora cuenta con una base de datos PostgreSQL robusta, autenticación avanzada, y funcionalidades en tiempo real gracias a Supabase.