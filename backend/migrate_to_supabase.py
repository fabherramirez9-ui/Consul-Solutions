<file>
      <absolute_file_name>/app/backend/migrate_to_supabase.py</absolute_file_name>
      <content">#!/usr/bin/env python3
"""
Migration script to transfer data from MongoDB to Supabase
for COFEPRIS Compliance Application
"""

import asyncio
import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from supabase import create_client, Client
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Initialize clients
mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client[DB_NAME]

if SUPABASE_URL and SUPABASE_SERVICE_KEY and SUPABASE_URL != 'https://your-project.supabase.co':
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
else:
    logger.warning("Supabase configuration not found. Running in demo mode.")
    supabase = None

class DataMigrator:
    """Handles migration from MongoDB to Supabase"""
    
    def __init__(self):
        self.mongo_db = mongo_db
        self.supabase = supabase
        self.migration_stats = {
            'collections_migrated': 0,
            'documents_migrated': 0,
            'errors': []
        }
    
    def convert_mongodb_id(self, doc: Dict) -> Dict:
        """Convert MongoDB ObjectId to UUID string and handle nested objects"""
        if isinstance(doc, dict):
            # Remove MongoDB _id field
            if '_id' in doc:
                del doc['_id']
            
            # Convert datetime objects to ISO strings
            for key, value in doc.items():
                if isinstance(value, datetime):
                    doc[key] = value.isoformat()
                elif isinstance(value, dict):
                    doc[key] = self.convert_mongodb_id(value)
                elif isinstance(value, list):
                    doc[key] = [self.convert_mongodb_id(item) if isinstance(item, dict) else item for item in value]
        
        return doc
    
    def validate_data(self, data: Dict, table_name: str) -> Dict:
        """Validate and clean data for Supabase insertion"""
        cleaned_data = self.convert_mongodb_id(data.copy())
        
        # Add UUID if not present
        if 'id' not in cleaned_data:
            import uuid
            cleaned_data['id'] = str(uuid.uuid4())
        
        # Ensure required timestamps
        if 'created_at' not in cleaned_data:
            cleaned_data['created_at'] = datetime.utcnow().isoformat()
        if 'updated_at' not in cleaned_data:
            cleaned_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Table-specific validation
        if table_name == 'users':
            # Ensure required fields for users
            if 'rol' not in cleaned_data:
                cleaned_data['rol'] = 'usuario_final'
            if 'estado_suscripcion' not in cleaned_data:
                cleaned_data['estado_suscripcion'] = 'INACTIVA'
        
        elif table_name == 'establishments':
            # Ensure required fields for establishments
            if 'numero_salas' not in cleaned_data:
                cleaned_data['numero_salas'] = 1
            if 'maneja_rpbi' not in cleaned_data:
                cleaned_data['maneja_rpbi'] = False
            if 'responsable_sanitario' not in cleaned_data:
                cleaned_data['responsable_sanitario'] = False
            if 'farmacia_anexo' not in cleaned_data:
                cleaned_data['farmacia_anexo'] = False
        
        return cleaned_data
    
    async def migrate_collection(self, collection_name: str, table_name: str) -> bool:
        """Migrate a single MongoDB collection to Supabase table"""
        try:
            logger.info(f"Starting migration: {collection_name} -> {table_name}")
            
            # Get documents from MongoDB
            cursor = self.mongo_db[collection_name].find()
            documents = await cursor.to_list(None)
            
            if not documents:
                logger.info(f"No documents found in collection {collection_name}")
                return True
            
            logger.info(f"Found {len(documents)} documents in {collection_name}")
            
            # Migrate documents to Supabase
            migrated_count = 0
            for doc in documents:
                try:
                    # Validate and clean data
                    clean_doc = self.validate_data(doc, table_name)
                    
                    if self.supabase:
                        # Insert into Supabase
                        result = self.supabase.table(table_name).insert(clean_doc).execute()
                        if result.error:
                            logger.error(f"Supabase error for {table_name}: {result.error}")
                        else:
                            migrated_count += 1
                    else:
                        # Demo mode - just log
                        logger.info(f"Demo: Would migrate {table_name} document: {clean_doc.get('id', 'unknown')}")
                        migrated_count += 1
                
                except Exception as e:
                    error_msg = f"Error migrating document in {table_name}: {str(e)}"
                    logger.error(error_msg)
                    self.migration_stats['errors'].append(error_msg)
            
            logger.info(f"Successfully migrated {migrated_count}/{len(documents)} documents from {collection_name}")
            self.migration_stats['documents_migrated'] += migrated_count
            self.migration_stats['collections_migrated'] += 1
            return True
            
        except Exception as e:
            error_msg = f"Failed to migrate collection {collection_name}: {str(e)}"
            logger.error(error_msg)
            self.migration_stats['errors'].append(error_msg)
            return False
    
    async def create_sample_data(self):
        """Create sample data if no MongoDB data exists"""
        logger.info("Creating sample data for Supabase...")
        
        sample_templates = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
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
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440002",
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
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        
        sample_tramites = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440003",
                "nombre": "Aviso de Funcionamiento COFEPRIS",
                "autoridad": "COFEPRIS",
                "requisitos": "Formato de aviso, licencia sanitaria, responsable sanitario, planos del establecimiento",
                "costo_externo": 2500.0,
                "periodicidad": "Cada cambio de actividad o ubicación",
                "guia_url": "https://www.gob.mx/cofepris/acciones-y-programas/avisos-de-funcionamiento",
                "activo": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        
        sample_suggestion_rules = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440004",
                "condiciones": {"all": [{"field": "giro", "op": "=", "value": "CONSULTORIO_ODONTO"}]},
                "items_sugeridos": {
                    "plantillas": ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
                    "tramites": ["550e8400-e29b-41d4-a716-446655440003"]
                },
                "justificacion": "Los consultorios odontológicos requieren protocolos específicos de limpieza y manejo de RPBI por uso de instrumental punzocortante",
                "prioridad": 100,
                "activo": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440005",
                "condiciones": {"all": [{"field": "maneja_rpbi", "op": "=", "value": True}]},
                "items_sugeridos": {
                    "plantillas": ["550e8400-e29b-41d4-a716-446655440002"],
                    "tramites": []
                },
                "justificacion": "El manejo de RPBI requiere programa específico y registro ante SEMARNAT",
                "prioridad": 90,
                "activo": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
        ]
        
        # Insert sample data
        sample_data = [
            ("document_templates", sample_templates),
            ("tramites", sample_tramites),
            ("suggestion_rules", sample_suggestion_rules)
        ]
        
        for table_name, data_list in sample_data:
            try:
                for item in data_list:
                    if self.supabase:
                        result = self.supabase.table(table_name).insert(item).execute()
                        if result.error:
                            logger.error(f"Error inserting sample data into {table_name}: {result.error}")
                        else:
                            logger.info(f"Inserted sample data into {table_name}: {item['nombre']}")
                    else:
                        logger.info(f"Demo: Would insert into {table_name}: {item.get('nombre', item.get('id'))}")
                        
                self.migration_stats['documents_migrated'] += len(data_list)
            except Exception as e:
                error_msg = f"Error creating sample data for {table_name}: {str(e)}"
                logger.error(error_msg)
                self.migration_stats['errors'].append(error_msg)
    
    async def run_migration(self):
        """Run the complete migration process"""
        logger.info("Starting MongoDB to Supabase migration...")
        
        # Define collection to table mappings
        migration_mapping = {
            'usuarios': 'users',
            'establecimientos': 'establishments',
            'documento_plantillas': 'document_templates',
            'tramites': 'tramites',
            'reglas_sugerencia': 'suggestion_rules',
            'selecciones': 'selections',
            'documento_instancias': 'document_instances',
            'expediente': 'expediente',
            'curso_modulos': 'course_modules',
            'curso_progreso': 'course_progress',
            'consultas': 'consultations'
        }
        
        # Check if MongoDB has any data
        has_data = False
        for collection_name in migration_mapping.keys():
            try:
                count = await self.mongo_db[collection_name].count_documents({})
                if count > 0:
                    has_data = True
                    break
            except Exception as e:
                logger.warning(f"Could not check collection {collection_name}: {str(e)}")
        
        if not has_data:
            logger.info("No existing MongoDB data found. Creating sample data...")
            await self.create_sample_data()
        else:
            # Migrate existing data
            for collection_name, table_name in migration_mapping.items():
                success = await self.migrate_collection(collection_name, table_name)
                if not success:
                    logger.warning(f"Migration failed for {collection_name} -> {table_name}")
        
        # Print migration summary
        logger.info("\n" + "="*50)
        logger.info("MIGRATION SUMMARY")
        logger.info("="*50)
        logger.info(f"Collections migrated: {self.migration_stats['collections_migrated']}")
        logger.info(f"Documents migrated: {self.migration_stats['documents_migrated']}")
        logger.info(f"Errors encountered: {len(self.migration_stats['errors'])}")
        
        if self.migration_stats['errors']:
            logger.info("\nERRORS:")
            for error in self.migration_stats['errors']:
                logger.error(f"  - {error}")
        
        logger.info("="*50)
        
        return len(self.migration_stats['errors']) == 0

async def main():
    """Main migration function"""
    migrator = DataMigrator()
    
    try:
        success = await migrator.run_migration()
        
        if success:
            logger.info("✅ Migration completed successfully!")
            exit(0)
        else:
            logger.error("❌ Migration completed with errors.")
            exit(1)
    
    except Exception as e:
        logger.error(f"💥 Migration failed: {str(e)}")
        exit(1)
    
    finally:
        # Close MongoDB connection
        mongo_client.close()

if __name__ == "__main__":
    asyncio.run(main())</content>
    </file>