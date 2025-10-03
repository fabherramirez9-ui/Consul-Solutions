-- COFEPRIS Compliance Application - Supabase Schema
-- This schema creates all necessary tables for the COFEPRIS compliance app

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-jwt-secret-here';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(50) DEFAULT 'usuario_final' CHECK (rol IN ('admin', 'gestor_contenido', 'usuario_final')),
    estado_suscripcion VARCHAR(20) DEFAULT 'INACTIVA' CHECK (estado_suscripcion IN ('ACTIVA', 'INACTIVA')),
    fecha_renovacion TIMESTAMP WITH TIME ZONE,
    rfc VARCHAR(20),
    razon_social VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Establishments table
CREATE TABLE IF NOT EXISTS public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    giro VARCHAR(50) NOT NULL CHECK (giro IN ('SPA', 'CONSULTORIO_ODONTO', 'CLINICA_ESTETICA', 'CONSULTORIO_GENERAL', 'OTRO')),
    servicios JSONB DEFAULT '[]'::jsonb,
    numero_salas INTEGER DEFAULT 1 CHECK (numero_salas >= 0),
    equipo_especial JSONB DEFAULT '[]'::jsonb,
    maneja_rpbi BOOLEAN DEFAULT FALSE,
    responsable_sanitario BOOLEAN DEFAULT FALSE,
    ubicacion_estado VARCHAR(100) NOT NULL,
    farmacia_anexo BOOLEAN DEFAULT FALSE,
    notas_estatales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to establishments table
CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON public.establishments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Document templates table
CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('POE', 'RPBI', 'SENIALETICA', 'TRAMITE', 'MANUAL', 'CONSENTIMIENTOS', 'OTRO')),
    que_incluye TEXT NOT NULL,
    razones TEXT NOT NULL,
    campos_definicion JSONB DEFAULT '{}'::jsonb,
    versiones JSONB DEFAULT '[]'::jsonb,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to document_templates table
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON public.document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tramites table
CREATE TABLE IF NOT EXISTS public.tramites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    autoridad VARCHAR(100) DEFAULT 'COFEPRIS',
    requisitos TEXT NOT NULL,
    costo_externo DECIMAL(10,2),
    periodicidad VARCHAR(100),
    guia_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to tramites table
CREATE TRIGGER update_tramites_updated_at BEFORE UPDATE ON public.tramites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Suggestion rules table
CREATE TABLE IF NOT EXISTS public.suggestion_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condiciones JSONB NOT NULL,
    items_sugeridos JSONB NOT NULL,
    justificacion TEXT NOT NULL,
    prioridad INTEGER DEFAULT 100,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to suggestion_rules table
CREATE TRIGGER update_suggestion_rules_updated_at BEFORE UPDATE ON public.suggestion_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Document instances table
CREATE TABLE IF NOT EXISTS public.document_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plantilla_id UUID NOT NULL REFERENCES public.document_templates(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'LISTO')),
    campos JSONB DEFAULT '{}'::jsonb,
    validaciones JSONB DEFAULT '{}'::jsonb,
    historial_versiones JSONB DEFAULT '[]'::jsonb,
    pdf_url TEXT,
    carpeta VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to document_instances table
CREATE TRIGGER update_document_instances_updated_at BEFORE UPDATE ON public.document_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Selections table
CREATE TABLE IF NOT EXISTS public.selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'ACTIVO')),
    completitud_estimado INTEGER DEFAULT 0 CHECK (completitud_estimado >= 0 AND completitud_estimado <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to selections table
CREATE TRIGGER update_selections_updated_at BEFORE UPDATE ON public.selections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Expediente table
CREATE TABLE IF NOT EXISTS public.expediente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    estatus_cumplimiento VARCHAR(20) DEFAULT 'ROJO' CHECK (estatus_cumplimiento IN ('VERDE', 'AMARILLO', 'ROJO')),
    avance INTEGER DEFAULT 0 CHECK (avance >= 0 AND avance <= 100),
    vencimientos JSONB DEFAULT '[]'::jsonb,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to expediente table
CREATE TRIGGER update_expediente_updated_at BEFORE UPDATE ON public.expediente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course modules table
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    objetivos TEXT NOT NULL,
    contenido_html TEXT NOT NULL,
    referencias TEXT,
    recursos JSONB DEFAULT '[]'::jsonb,
    quiz JSONB DEFAULT '{}'::jsonb,
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apply updated_at trigger to course_modules table
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Course progress table
CREATE TABLE IF NOT EXISTS public.course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    modulo_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'NO_INICIADO' CHECK (estado IN ('NO_INICIADO', 'EN_CURSO', 'COMPLETADO')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    ultimo_intento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, modulo_id)
);

-- Apply updated_at trigger to course_progress table
CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON public.course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    perfil_snapshot JSONB NOT NULL,
    pregunta TEXT NOT NULL,
    razonamiento TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    links_relacionados JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit events table
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    accion VARCHAR(255) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    payload_resumido TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_establishments_usuario_id ON public.establishments(usuario_id);
CREATE INDEX IF NOT EXISTS idx_document_instances_usuario_id ON public.document_instances(usuario_id);
CREATE INDEX IF NOT EXISTS idx_document_instances_plantilla_id ON public.document_instances(plantilla_id);
CREATE INDEX IF NOT EXISTS idx_consultations_usuario_id ON public.consultations(usuario_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_usuario_id ON public.course_progress(usuario_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_modulo_id ON public.course_progress(modulo_id);
CREATE INDEX IF NOT EXISTS idx_selections_usuario_id ON public.selections(usuario_id);
CREATE INDEX IF NOT EXISTS idx_expediente_usuario_id ON public.expediente(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON public.audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON public.audit_events(timestamp);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expediente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can only access their own establishments
CREATE POLICY "Users can view their own establishments" ON public.establishments
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Users can only access their own document instances
CREATE POLICY "Users can manage their own document instances" ON public.document_instances
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Users can only access their own selections
CREATE POLICY "Users can manage their own selections" ON public.selections
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Users can only access their own expediente
CREATE POLICY "Users can manage their own expediente" ON public.expediente
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Users can only access their own course progress
CREATE POLICY "Users can manage their own course progress" ON public.course_progress
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Users can only access their own consultations
CREATE POLICY "Users can manage their own consultations" ON public.consultations
    FOR ALL USING (auth.uid()::text = usuario_id::text);

-- Public read access for templates, tramites, course modules, and suggestion rules
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON public.document_templates
    FOR SELECT USING (activo = true);

CREATE POLICY "Anyone can view active tramites" ON public.tramites
    FOR SELECT USING (activo = true);

CREATE POLICY "Anyone can view active course modules" ON public.course_modules
    FOR SELECT USING (activo = true);

CREATE POLICY "Anyone can view active suggestion rules" ON public.suggestion_rules
    FOR SELECT USING (activo = true);

-- Admin policies (only admins can modify public data)
CREATE POLICY "Admins can manage templates" ON public.document_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND rol = 'admin'
        )
    );

CREATE POLICY "Admins can manage tramites" ON public.tramites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND rol = 'admin'
        )
    );

CREATE POLICY "Admins can manage course modules" ON public.course_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND rol = 'admin'
        )
    );

CREATE POLICY "Admins can manage suggestion rules" ON public.suggestion_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text AND rol = 'admin'
        )
    );

-- Insert sample data
INSERT INTO public.document_templates (nombre, categoria, que_incluye, razones, campos_definicion, activo) VALUES
('POE de Limpieza y Desinfección', 'POE', 
 'Procedimientos detallados de limpieza, desinfección, frecuencia, insumos requeridos, responsables y registros de control.',
 'Obligatorio para todos los establecimientos de salud según NOM-045-SSA2-2005. Previene infecciones asociadas a la atención de la salud.',
 '{"areas": {"type": "array", "required": true}, "frecuencia": {"type": "select", "options": ["Diaria", "Semanal", "Mensual"], "required": true}, "productos": {"type": "array", "required": true}, "responsable": {"type": "string", "required": true}}',
 true),
('Programa de Manejo de RPBI', 'RPBI',
 'Clasificación de residuos, contenedores apropiados, rutas de recolección, almacenamiento temporal y disposición final.',
 'Obligatorio para establecimientos que generen residuos peligrosos biológico-infecciosos según NOM-087-SEMARNAT-SSA1-2002.',
 '{"tipos_residuos": {"type": "array", "required": true}, "contenedores": {"type": "array", "required": true}, "empresa_recolectora": {"type": "string", "required": true}}',
 true);

INSERT INTO public.tramites (nombre, autoridad, requisitos, costo_externo, periodicidad, guia_url, activo) VALUES
('Aviso de Funcionamiento COFEPRIS', 'COFEPRIS',
 'Formato de aviso, licencia sanitaria, responsable sanitario, planos del establecimiento',
 2500.00, 'Cada cambio de actividad o ubicación',
 'https://www.gob.mx/cofepris/acciones-y-programas/avisos-de-funcionamiento',
 true);

-- Insert sample suggestion rules
INSERT INTO public.suggestion_rules (condiciones, items_sugeridos, justificacion, prioridad, activo) VALUES
('{"all": [{"field": "giro", "op": "=", "value": "CONSULTORIO_ODONTO"}]}',
 '{"plantillas": [], "tramites": []}',
 'Los consultorios odontológicos requieren protocolos específicos de limpieza y manejo de RPBI por uso de instrumental punzocortante',
 100, true),
('{"all": [{"field": "maneja_rpbi", "op": "=", "value": true}]}',
 '{"plantillas": [], "tramites": []}',
 'El manejo de RPBI requiere programa específico y registro ante SEMARNAT',
 90, true);

-- Insert sample course modules
INSERT INTO public.course_modules (titulo, slug, objetivos, contenido_html, orden, activo) VALUES
('Introducción a COFEPRIS', 'intro-cofepris',
 'Comprender los fundamentos de la regulación sanitaria en México',
 '<h1>Introducción a COFEPRIS</h1><p>COFEPRIS es la autoridad sanitaria encargada de la regulación, control y fomento sanitario en México...</p>',
 1, true),
('Requisitos por Tipo de Establecimiento', 'requisitos-establecimiento',
 'Identificar los requisitos específicos según el giro del establecimiento',
 '<h1>Requisitos por Tipo de Establecimiento</h1><p>Cada tipo de establecimiento tiene requisitos específicos...</p>',
 2, true);

-- Create a function to get user role (for RLS policies)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT rol INTO user_role FROM public.users WHERE id = user_id;
    RETURN COALESCE(user_role, 'usuario_final');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, anon;