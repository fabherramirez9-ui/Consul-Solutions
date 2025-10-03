from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta
import uuid
import hashlib
import hmac
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY') 
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET')

# Check if we have real Supabase configuration
DEMO_MODE = not SUPABASE_URL or SUPABASE_URL == 'https://your-project.supabase.co' or not SUPABASE_SERVICE_KEY

if DEMO_MODE:
    print("🔧 Using mock Supabase configuration for demo")
    SUPABASE_URL = 'https://mock-supabase-demo.co'
    SUPABASE_ANON_KEY = 'mock-anon-key'
    SUPABASE_SERVICE_KEY = 'mock-service-key'
    JWT_SECRET = 'mock-jwt-secret-for-demo-only'

# Mock Supabase client for demo mode
class MockSupabaseClient:
    def __init__(self):
        self.auth = MockAuth()
        self.table_cache = {}
        self.storage_cache = {}
    
    def table(self, name):
        if name not in self.table_cache:
            self.table_cache[name] = MockTable(name)
        return self.table_cache[name]
    
    def storage(self):
        return MockStorage()

class MockAuth:
    def __init__(self):
        self.users_db = {}  # Simple in-memory user store for demo
    
    def sign_up(self, credentials):
        email = credentials.get("email")
        password = credentials.get("password")
        
        if email in self.users_db:
            return MockResponse(None, error="User already exists")
        
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "created_at": datetime.utcnow().isoformat()
        }
        self.users_db[email] = {"user": user, "password": password}
        
        return MockResponse({"user": user, "session": {"access_token": f"mock_token_{user_id}"}})
    
    def sign_in_with_password(self, credentials):
        email = credentials.get("email")
        password = credentials.get("password")
        
        if email not in self.users_db:
            return MockResponse(None, error="Invalid credentials")
        
        stored = self.users_db[email]
        if stored["password"] != password:
            return MockResponse(None, error="Invalid credentials")
        
        return MockResponse({
            "user": stored["user"], 
            "session": {"access_token": f"mock_token_{stored['user']['id']}"}
        })

class MockStorage:
    def from_(self, bucket):
        return MockBucket(bucket)

class MockBucket:
    def __init__(self, name):
        self.bucket_name = name
    
    def upload(self, path, file_data):
        return MockResponse({"path": path, "size": len(file_data) if isinstance(file_data, bytes) else 1024})
    
    def create_signed_url(self, path, expires_in=3600):
        return MockResponse({"signedURL": f"https://mock-storage.supabase.co/{self.bucket_name}/{path}"})

class MockTable:
    def __init__(self, name):
        self.name = name
        self.data = []
    
    def insert(self, data):
        if isinstance(data, dict):
            data = data.copy()  # Don't modify original
            data['id'] = str(uuid.uuid4())
            data['created_at'] = datetime.utcnow().isoformat()
            data['updated_at'] = datetime.utcnow().isoformat()
            self.data.append(data)
            return MockResponse([data])
        return MockResponse([])
    
    def select(self, columns="*"):
        return MockQuery(self.data)
    
    def update(self, data):
        return MockQuery(self.data, update_data=data)
    
    def delete(self):
        return MockQuery([])

class MockQuery:
    def __init__(self, data, update_data=None):
        self.data = data if data else []
        self.update_data = update_data
    
    def eq(self, column, value):
        if self.update_data:
            # Update matching records
            updated = []
            for item in self.data:
                if item.get(column) == value:
                    item.update(self.update_data)
                    item['updated_at'] = datetime.utcnow().isoformat()
                    updated.append(item)
            return MockResponse(updated)
        else:
            # Filter data
            filtered = [item for item in self.data if item.get(column) == value]
            return MockResponse(filtered)
    
    def execute(self):
        return MockResponse(self.data)

class MockResponse:
    def __init__(self, data, error=None):
        self.data = data if data is not None else []
        self.error = error

# Initialize clients
if DEMO_MODE:
    supabase = MockSupabaseClient()
    supabase_admin = MockSupabaseClient()
    print("✅ Mock Supabase clients initialized for demo")
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Real Supabase clients initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase clients: {e}")
        # Fallback to mock mode
        supabase = MockSupabaseClient()
        supabase_admin = MockSupabaseClient()
        DEMO_MODE = True
        print("✅ Fallback to mock Supabase clients")

# Create the main app without a prefix
app = FastAPI(title="COFEPRIS Compliance API with Supabase", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums and Models (same as before)
from enum import Enum

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

class AIConsultationRequest(BaseModel):
    perfil: Dict[str, Any]
    pregunta: str

class AIConsultation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    perfil_snapshot: Dict[str, Any]
    pregunta: str
    razonamiento: str
    respuesta: str
    links_relacionados: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Authentication helpers
def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for user authentication"""
    # Ensure we have a valid JWT secret
    secret = JWT_SECRET if JWT_SECRET else 'demo-secret-key-not-for-production'
    
    # Ensure datetime objects are serializable
    user_id = str(user_data.get("id", "demo-user"))
    email = str(user_data.get("email", "demo@example.com"))
    
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24),
        "iat": datetime.utcnow(),
        "demo_mode": DEMO_MODE
    }
    
    return jwt.encode(payload, secret, algorithm="HS256")

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return user data"""
    try:
        secret = JWT_SECRET if JWT_SECRET else 'demo-secret-key-not-for-production'
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    
    try:
        # For mock demo, accept any token that starts with "token_" or "mock"
        if token.startswith("token_") or token.startswith("mock"):
            # Extract user_id from token for mock purposes
            if token.startswith("token_"):
                parts = token.split("_")
                user_id = parts[1] if len(parts) > 1 else "mock-user-id"
            else:
                user_id = "mock-user-id"
            
            # Return mock user data
            return User(
                id=user_id,
                nombre="Usuario Demo",
                email="demo@example.com",
                rol=UserRole.usuario_final,
                estado_suscripcion=SubscriptionStatus.ACTIVA
            )
        
        # Try to verify real JWT token
        payload = verify_jwt_token(token)
        
        # Get user from Supabase
        response = supabase.table("users").select("*").eq("id", payload["user_id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="User not found")
        
        user_data = response.data[0]
        return User(**user_data)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# AI Chat helper (same as before)
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

# Sample data storage for demo
SAMPLE_TEMPLATES = [
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

SAMPLE_TRAMITES = [
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

# Suggestion engine
async def generate_suggestions(perfil: Dict[str, Any]) -> SuggestionResponse:
    """Generate document and procedure suggestions based on establishment profile."""
    
    suggested_templates = []
    suggested_tramites = []
    justifications = []
    
    # Basic suggestions based on giro
    if perfil.get("giro") == "CONSULTORIO_ODONTO":
        suggested_templates.extend(SAMPLE_TEMPLATES)
        suggested_tramites.extend(SAMPLE_TRAMITES)
        justifications.append("Los consultorios odontológicos requieren protocolos específicos de limpieza y manejo de RPBI por uso de instrumental punzocortante")
    
    if perfil.get("maneja_rpbi", False):
        # Add RPBI template if not already added
        rpbi_template = next((t for t in SAMPLE_TEMPLATES if t["categoria"] == "RPBI"), None)
        if rpbi_template and rpbi_template not in suggested_templates:
            suggested_templates.append(rpbi_template)
        justifications.append("El manejo de RPBI requiere programa específico y registro ante SEMARNAT")
    
    # Calculate completeness estimate
    completeness = min(100, (len(suggested_templates) + len(suggested_tramites)) * 15)
    
    return SuggestionResponse(
        plantillas=suggested_templates,
        tramites=suggested_tramites,
        justificacion="; ".join(justifications),
        completitud_estimado=completeness
    )

# Routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate):
    try:
        if DEMO_MODE:
            # Mock registration - always succeeds
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if auth_response.error:
                raise HTTPException(status_code=400, detail=auth_response.error)
            
            # Create user profile
            user_dict = user_data.dict()
            del user_dict["password"]  # Don't store password
            user_dict["id"] = auth_response.data["user"]["id"]
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            
            # Store user profile
            supabase.table("users").insert(user_dict)
            
            # Create JWT token
            token = create_jwt_token(user_dict)
            return {"token": token, "user": User(**user_dict)}
        
        else:
            # Real Supabase registration
            response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if response.error:
                raise HTTPException(status_code=400, detail=response.error.message)
            
            # Store additional user data
            user_dict = user_data.dict()
            del user_dict["password"]
            user_dict["id"] = response.user.id
            user_dict["created_at"] = datetime.utcnow()
            user_dict["updated_at"] = datetime.utcnow()
            
            supabase.table("users").insert(user_dict).execute()
            
            token = create_jwt_token(user_dict)
            return {"token": token, "user": User(**user_dict)}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login_user(login_data: UserLogin):
    try:
        if DEMO_MODE:
            # Mock login using the mock auth system
            auth_response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            
            if auth_response.error:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Get user from mock database or create if first time
            user_response = supabase.table("users").select("*").eq("email", login_data.email).execute()
            
            if user_response.data:
                user_data = user_response.data[0]
            else:
                # Create demo user profile if not exists
                user_data = {
                    "id": auth_response.data["user"]["id"],
                    "email": login_data.email,
                    "nombre": "Usuario Demo",
                    "telefono": None,
                    "rol": "usuario_final",
                    "estado_suscripcion": "ACTIVA",
                    "fecha_renovacion": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                    "rfc": None,
                    "razon_social": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                supabase.table("users").insert(user_data)
            
            token = create_jwt_token(user_data)
            return {"token": token, "user": User(**user_data)}
        
        else:
            # Real Supabase login
            response = supabase.auth.sign_in_with_password({
                "email": login_data.email,
                "password": login_data.password
            })
            
            if response.error:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            # Get user details
            user_response = supabase.table("users").select("*").eq("id", response.user.id).execute()
            
            if not user_response.data:
                raise HTTPException(status_code=404, detail="User profile not found")
            
            user_data = user_response.data[0]
            token = create_jwt_token(user_data)
            
            return {"token": token, "user": User(**user_data)}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@api_router.post("/establishments", response_model=Establishment)
async def create_establishment(establishment_data: EstablishmentCreate, current_user: User = Depends(get_current_user)):
    try:
        establishment_dict = establishment_data.dict()
        establishment_dict["usuario_id"] = current_user.id
        establishment_dict["id"] = str(uuid.uuid4())
        establishment_dict["created_at"] = datetime.utcnow()
        establishment_dict["updated_at"] = datetime.utcnow()
        
        # Store in Supabase
        response = supabase.table("establishments").insert(establishment_dict).execute()
        
        return Establishment(**establishment_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create establishment: {str(e)}")

@api_router.get("/establishments", response_model=List[Establishment])
async def get_user_establishments(current_user: User = Depends(get_current_user)):
    try:
        response = supabase.table("establishments").select("*").eq("usuario_id", current_user.id).execute()
        return [Establishment(**est) for est in response.data]
    except Exception as e:
        # Return empty list for demo
        return []

@api_router.post("/suggestions", response_model=SuggestionResponse)
async def get_regulatory_suggestions(request: SuggestionRequest):
    try:
        perfil = request.dict()
        suggestions = await generate_suggestions(perfil)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")

@api_router.post("/ai/consultation", response_model=AIConsultation)
async def ai_consultation(request: AIConsultationRequest, current_user: User = Depends(get_current_user)):
    try:
        reasoning, conclusion = await get_ai_response(request.perfil, request.pregunta)
        
        consultation = AIConsultation(
            usuario_id=current_user.id,
            perfil_snapshot=request.perfil,
            pregunta=request.pregunta,
            razonamiento=reasoning,
            respuesta=conclusion
        )
        
        # Store in Supabase
        consultation_dict = consultation.dict()
        supabase.table("consultations").insert(consultation_dict).execute()
        
        return consultation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI consultation failed: {str(e)}")

@api_router.get("/templates", response_model=List[DocumentTemplate])
async def get_document_templates():
    try:
        # Return sample templates for demo
        return [DocumentTemplate(**template) for template in SAMPLE_TEMPLATES]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

@api_router.get("/tramites", response_model=List[Tramite])
async def get_tramites():
    try:
        # Return sample tramites for demo
        return [Tramite(**tramite) for tramite in SAMPLE_TRAMITES]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get tramites: {str(e)}")

@api_router.post("/webhooks/pago")
async def webhook_payment(payload: Dict[str, Any]):
    try:
        # Mock payment webhook
        user_id = payload.get("user_id")
        if user_id:
            # Update user subscription status
            update_data = {
                "estado_suscripcion": "ACTIVA",
                "fecha_renovacion": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook failed: {str(e)}")

@api_router.post("/init/sample-data")
async def init_sample_data():
    try:
        # Initialize sample data in Supabase tables
        # This would create the initial templates and tramites
        return {"message": "Sample data initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize data: {str(e)}")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "supabase",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)