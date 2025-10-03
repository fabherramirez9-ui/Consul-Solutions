from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
from enum import Enum
import uuid
import hashlib
import hmac
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="COFEPRIS Compliance API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    admin = "admin"
    gestor_contenido = "gestor_contenido"
    usuario_final = "usuario_final"

class SubscriptionStatus(str, Enum):
    ACTIVA = "ACTIVA"
    INACTIVA = "INACTIVA"

class Giro(str, Enum):
    SPA = "SPA"
    CONSULTORIO_ODONTO = "CONSULTORIO_ODONTO"
    CLINICA_ESTETICA = "CLINICA_ESTETICA"
    CONSULTORIO_GENERAL = "CONSULTORIO_GENERAL"
    OTRO = "OTRO"

class DocumentCategory(str, Enum):
    POE = "POE"
    RPBI = "RPBI"
    SENIALETICA = "SENIALETICA"
    TRAMITE = "TRAMITE"
    MANUAL = "MANUAL"
    CONSENTIMIENTOS = "CONSENTIMIENTOS"
    OTRO = "OTRO"

class DocumentStatus(str, Enum):
    BORRADOR = "BORRADOR"
    LISTO = "LISTO"

class SelectionStatus(str, Enum):
    BORRADOR = "BORRADOR"
    ACTIVO = "ACTIVO"

class ComplianceStatus(str, Enum):
    VERDE = "VERDE"
    AMARILLO = "AMARILLO"
    ROJO = "ROJO"

class CourseStatus(str, Enum):
    NO_INICIADO = "NO_INICIADO"
    EN_CURSO = "EN_CURSO"
    COMPLETADO = "COMPLETADO"

# Pydantic Models
class UserBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telefono: Optional[str] = None
    rol: UserRole = UserRole.usuario_final
    estado_suscripcion: SubscriptionStatus = SubscriptionStatus.INACTIVA
    fecha_renovacion: Optional[datetime] = None
    rfc: Optional[str] = None
    razon_social: Optional[str] = None

class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    telefono: Optional[str] = None
    rfc: Optional[str] = None
    razon_social: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EstablishmentCreate(BaseModel):
    giro: Giro
    servicios: List[str] = []
    numero_salas: int = Field(ge=0, default=1)
    equipo_especial: List[str] = []
    maneja_rpbi: bool = False
    responsable_sanitario: bool = False
    ubicacion_estado: str
    farmacia_anexo: bool = False
    notas_estatales: Optional[str] = None

class Establishment(EstablishmentCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DocumentTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    categoria: DocumentCategory
    que_incluye: str
    razones: str
    campos_definicion: Dict[str, Any] = {}
    versiones: List[Dict[str, Any]] = []
    activo: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Tramite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    autoridad: str = "COFEPRIS"
    requisitos: str
    costo_externo: Optional[float] = None
    periodicidad: Optional[str] = None
    guia_url: Optional[str] = None
    activo: bool = True

class SuggestionRule(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    condiciones: Dict[str, Any]
    items_sugeridos: Dict[str, List[str]]
    justificacion: str
    prioridad: int = 100
    activo: bool = True

class Selection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    items: Dict[str, List[str]]
    estado: SelectionStatus = SelectionStatus.BORRADOR
    completitud_estimado: int = Field(ge=0, le=100, default=0)

class DocumentInstance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    plantilla_id: str
    estado: DocumentStatus = DocumentStatus.BORRADOR
    campos: Dict[str, Any] = {}
    validaciones: Dict[str, Any] = {}
    historial_versiones: List[Dict[str, Any]] = []
    pdf_url: Optional[str] = None
    carpeta: DocumentCategory
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AIConsultation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    perfil_snapshot: Dict[str, Any]
    pregunta: str
    razonamiento: str
    respuesta: str
    links_relacionados: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AIConsultationRequest(BaseModel):
    perfil: Dict[str, Any]
    pregunta: str

class SuggestionRequest(BaseModel):
    giro: Giro
    servicios: List[str] = []
    equipo_especial: List[str] = []
    maneja_rpbi: bool = False
    responsable_sanitario: bool = False
    ubicacion_estado: str
    farmacia_anexo: bool = False

class SuggestionResponse(BaseModel):
    plantillas: List[Dict[str, Any]]
    tramites: List[Dict[str, Any]]
    justificacion: str
    completitud_estimado: int

# Authentication helpers
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

def create_token(user_id: str) -> str:
    # Simple token creation - in production, use JWT
    return f"token_{user_id}_{datetime.utcnow().isoformat()}"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not token.startswith("token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        user_id = token.split("_")[1]
        user = await db.usuarios.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# AI Chat helper
async def get_ai_response(perfil: Dict[str, Any], pregunta: str) -> tuple[str, str]:
    """Get AI response with reasoning and conclusion."""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=api_key,
            session_id=f"cofepris_{uuid.uuid4()}",
            system_message="""
Eres un asistente especializado en cumplimiento regulatorio COFEPRIS para establecimientos de salud en México.

INSTRUCCIONES:
1. Siempre responde en español
2. Estructura tu respuesta en DOS secciones claramente diferenciadas:

**RAZONAMIENTO Y ANÁLISIS:**
- Analiza el perfil del establecimiento
- Identifica los factores regulatorios relevantes
- Explica los criterios de evaluación
- Menciona alternativas si aplica

**CONCLUSIÓN Y RECOMENDACIÓN:**
- Proporciona recomendaciones específicas y concretas
- Sugiere documentos o trámites necesarios
- Indica prioridades (Obligatorio/Recomendado)

Tu tono debe ser empático, profesional y educativo. No brindas asesoría legal vinculante.
            """
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")

        context = f"Perfil del establecimiento: {json.dumps(perfil, ensure_ascii=False, indent=2)}"
        user_message = UserMessage(text=f"{context}\n\nPregunta: {pregunta}")
        
        response = await chat.send_message(user_message)
        
        # Split response into reasoning and conclusion
        response_text = str(response)
        if "CONCLUSIÓN Y RECOMENDACIÓN:" in response_text:
            parts = response_text.split("CONCLUSIÓN Y RECOMENDACIÓN:")
            reasoning = parts[0].replace("RAZONAMIENTO Y ANÁLISIS:", "").strip()
            conclusion = parts[1].strip()
        else:
            reasoning = response_text[:len(response_text)//2]
            conclusion = response_text[len(response_text)//2:]
            
        return reasoning, conclusion
    except Exception as e:
        return f"Error en análisis: {str(e)}", "No se pudo generar recomendación. Intente nuevamente."

# Suggestion engine
def convert_objectid(data):
    """Convert MongoDB ObjectId to string recursively."""
    if isinstance(data, list):
        return [convert_objectid(item) for item in data]
    elif isinstance(data, dict):
        if '_id' in data:
            del data['_id']  # Remove MongoDB _id field
        return {key: convert_objectid(value) for key, value in data.items()}
    else:
        return data

async def generate_suggestions(perfil: Dict[str, Any]) -> SuggestionResponse:
    """Generate document and procedure suggestions based on establishment profile."""
    
    # Get all templates and rules
    templates_raw = await db.documento_plantillas.find({"activo": True}).to_list(None)
    tramites_raw = await db.tramites.find({"activo": True}).to_list(None)
    rules_raw = await db.reglas_sugerencia.find({"activo": True}).to_list(None)
    
    # Convert ObjectIds to avoid serialization errors
    templates = convert_objectid(templates_raw)
    tramites = convert_objectid(tramites_raw)
    rules = convert_objectid(rules_raw)
    
    suggested_templates = []
    suggested_tramites = []
    justifications = []
    
    # Apply suggestion rules
    for rule in rules:
        conditions = rule["condiciones"]
        if evaluate_conditions(perfil, conditions):
            # Add suggested templates
            if "plantillas" in rule["items_sugeridos"]:
                for template_id in rule["items_sugeridos"]["plantillas"]:
                    template = next((t for t in templates if t["id"] == template_id), None)
                    if template and template not in suggested_templates:
                        suggested_templates.append(template)
            
            # Add suggested tramites
            if "tramites" in rule["items_sugeridos"]:
                for tramite_id in rule["items_sugeridos"]["tramites"]:
                    tramite = next((t for t in tramites if t["id"] == tramite_id), None)
                    if tramite and tramite not in suggested_tramites:
                        suggested_tramites.append(tramite)
            
            justifications.append(rule["justificacion"])
    
    # Calculate completeness estimate
    total_required = len([t for t in suggested_templates if "obligatorio" in t.get("razones", "").lower()])
    completeness = min(100, (len(suggested_templates) + len(suggested_tramites)) * 10)
    
    return SuggestionResponse(
        plantillas=suggested_templates,
        tramites=suggested_tramites,
        justificacion="; ".join(justifications),
        completitud_estimado=completeness
    )

def evaluate_conditions(perfil: Dict[str, Any], conditions: Dict[str, Any]) -> bool:
    """Evaluate if profile matches rule conditions."""
    if "all" in conditions:
        return all(evaluate_single_condition(perfil, cond) for cond in conditions["all"])
    elif "any" in conditions:
        return any(evaluate_single_condition(perfil, cond) for cond in conditions["any"])
    else:
        return evaluate_single_condition(perfil, conditions)

def evaluate_single_condition(perfil: Dict[str, Any], condition: Dict[str, Any]) -> bool:
    """Evaluate a single condition against the profile."""
    field = condition.get("field")
    op = condition.get("op")
    value = condition.get("value")
    
    if field not in perfil:
        return False
        
    profile_value = perfil[field]
    
    if op == "=":
        return profile_value == value
    elif op == "!=":
        return profile_value != value
    elif op == "contains":
        return value in profile_value if isinstance(profile_value, (list, str)) else False
    elif op == "in":
        return profile_value in value if isinstance(value, list) else False
    
    return False

# Routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.usuarios.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    user_dict["password_hash"] = hashed_password
    
    user = User(**user_dict)
    await db.usuarios.insert_one(user.dict())
    
    token = create_token(user.id)
    return {"token": token, "user": user}

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login_user(login_data: UserLogin):
    user = await db.usuarios.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return {"token": token, "user": User(**user)}

@api_router.post("/establishments", response_model=Establishment)
async def create_establishment(establishment_data: EstablishmentCreate, current_user: User = Depends(get_current_user)):
    establishment_dict = establishment_data.dict()
    establishment_dict["usuario_id"] = current_user.id
    
    establishment = Establishment(**establishment_dict)
    await db.establecimientos.insert_one(establishment.dict())
    
    return establishment

@api_router.get("/establishments", response_model=List[Establishment])
async def get_user_establishments(current_user: User = Depends(get_current_user)):
    establishments = await db.establecimientos.find({"usuario_id": current_user.id}).to_list(None)
    return [Establishment(**est) for est in establishments]

@api_router.post("/suggestions", response_model=SuggestionResponse)
async def get_regulatory_suggestions(request: SuggestionRequest):
    perfil = request.dict()
    suggestions = await generate_suggestions(perfil)
    return suggestions

@api_router.post("/ai/consultation", response_model=AIConsultation)
async def ai_consultation(request: AIConsultationRequest, current_user: User = Depends(get_current_user)):
    reasoning, conclusion = await get_ai_response(request.perfil, request.pregunta)
    
    consultation = AIConsultation(
        usuario_id=current_user.id,
        perfil_snapshot=request.perfil,
        pregunta=request.pregunta,
        razonamiento=reasoning,
        respuesta=conclusion
    )
    
    await db.consultas.insert_one(consultation.dict())
    return consultation

@api_router.get("/templates", response_model=List[DocumentTemplate])
async def get_document_templates():
    templates_raw = await db.documento_plantillas.find({"activo": True}).to_list(None)
    templates = convert_objectid(templates_raw)
    return [DocumentTemplate(**template) for template in templates]

@api_router.get("/tramites", response_model=List[Tramite])
async def get_tramites():
    tramites = await db.tramites.find({"activo": True}).to_list(None)
    return [Tramite(**tramite) for tramite in tramites]

@api_router.post("/webhooks/pago")
async def webhook_payment(payload: Dict[str, Any]):
    # Mock payment webhook - in production, verify HMAC signature
    user_id = payload.get("user_id")
    if user_id:
        await db.usuarios.update_one(
            {"id": user_id},
            {
                "$set": {
                    "estado_suscripcion": "ACTIVA",
                    "fecha_renovacion": (datetime.utcnow() + timedelta(days=30)).isoformat()
                }
            }
        )
    return {"status": "ok"}

# Initialize sample data
@api_router.post("/init/sample-data")
async def init_sample_data():
    # Sample document templates
    templates = [
        {
            "id": str(uuid.uuid4()),
            "nombre": "POE de Limpieza y Desinfección",
            "categoria": "POE",
            "que_incluye": "Procedimientos detallados de limpieza, desinfección, frecuencia, insumos requeridos, responsables y registros de control.",
            "razones": "Obligatorio para todos los establecimientos de salud según NOM-045-SSA2-2005. Previene infecciones asociadas a la atención de la salud.",
            "campos_definicion": {
                "areas": {"type": "array", "required": True},
                "frecuencia": {"type": "select", "options": ["Diaria", "Semanal", "Mensual"], "required": True},
                "productos": {"type": "array", "required": True},
                "responsable": {"type": "string", "required": True}
            },
            "activo": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "nombre": "Programa de Manejo de RPBI",
            "categoria": "RPBI",
            "que_incluye": "Clasificación de residuos, contenedores apropiados, rutas de recolección, almacenamiento temporal y disposición final.",
            "razones": "Obligatorio para establecimientos que generen residuos peligrosos biológico-infecciosos según NOM-087-SEMARNAT-SSA1-2002.",
            "campos_definicion": {
                "tipos_residuos": {"type": "array", "required": True},
                "contenedores": {"type": "array", "required": True},
                "empresa_recolectora": {"type": "string", "required": True}
            },
            "activo": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Sample tramites
    tramites = [
        {
            "id": str(uuid.uuid4()),
            "nombre": "Aviso de Funcionamiento COFEPRIS",
            "autoridad": "COFEPRIS",
            "requisitos": "Formato de aviso, licencia sanitaria, responsable sanitario, planos del establecimiento",
            "costo_externo": 2500.0,
            "periodicidad": "Cada cambio de actividad o ubicación",
            "guia_url": "https://www.gob.mx/cofepris/acciones-y-programas/avisos-de-funcionamiento",
            "activo": True
        }
    ]
    
    # Sample suggestion rules
    rules = [
        {
            "id": str(uuid.uuid4()),
            "condiciones": {"all": [{"field": "giro", "op": "=", "value": "CONSULTORIO_ODONTO"}]},
            "items_sugeridos": {"plantillas": [templates[0]["id"], templates[1]["id"]], "tramites": [tramites[0]["id"]]},
            "justificacion": "Los consultorios odontológicos requieren protocolos específicos de limpieza y manejo de RPBI por uso de instrumental punzocortante",
            "prioridad": 100,
            "activo": True
        },
        {
            "id": str(uuid.uuid4()),
            "condiciones": {"all": [{"field": "maneja_rpbi", "op": "=", "value": True}]},
            "items_sugeridos": {"plantillas": [templates[1]["id"]]},
            "justificacion": "El manejo de RPBI requiere programa específico y registro ante SEMARNAT",
            "prioridad": 90,
            "activo": True
        }
    ]
    
    # Insert sample data
    await db.documento_plantillas.delete_many({})
    await db.documento_plantillas.insert_many(templates)
    
    await db.tramites.delete_many({})
    await db.tramites.insert_many(tramites)
    
    await db.reglas_sugerencia.delete_many({})
    await db.reglas_sugerencia.insert_many(rules)
    
    return {"message": "Sample data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()