import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Shield, CheckCircle, Clock, Play, Award, Brain, FileText } from "lucide-react";
import { useAuth } from "../App";

const CourseSystem = () => {
  const { logout } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);
  
  const courseModules = [
    {
      id: 1,
      title: "Introducción a COFEPRIS",
      duration: "45 min",
      status: "completed",
      progress: 100,
      description: "Fundamentos de la regulación sanitaria en México",
      topics: ["Historia de COFEPRIS", "Marco legal", "Ámbitos de competencia", "Proceso regulatorio"]
    },
    {
      id: 2,
      title: "Requisitos por Tipo de Establecimiento",
      duration: "60 min",
      status: "completed",
      progress: 100,
      description: "Clasificación y requisitos específicos según el giro",
      topics: ["Consultorios", "Spas", "Clínicas estéticas", "Establecimientos odontológicos", "Hospitales"]
    },
    {
      id: 3,
      title: "Documentación Base Requerida",
      duration: "75 min",
      status: "in_progress",
      progress: 65,
      description: "POEs, manuales y documentos fundamentales",
      topics: ["POE de Limpieza", "Manuales de procedimientos", "Bitácoras", "Registros obligatorios"]
    },
    {
      id: 4,
      title: "Manejo de RPBI",
      duration: "50 min",
      status: "not_started",
      progress: 0,
      description: "Residuos Peligrosos Biológico-Infecciosos",
      topics: ["Clasificación de RPBI", "Contenedores", "Almacenamiento", "Disposición final"]
    },
    {
      id: 5,
      title: "Señalética y Seguridad",
      duration: "40 min",
      status: "not_started",
      progress: 0,
      description: "Señalización obligatoria y medidas de seguridad",
      topics: ["Señales de seguridad", "Rutas de evacuación", "Ubicación de extintores", "Zonas restringidas"]
    },
    {
      id: 6,
      title: "Calibraciones y Mantenimientos",
      duration: "55 min",
      status: "not_started",
      progress: 0,
      description: "Mantenimiento preventivo de equipos médicos",
      topics: ["Cronogramas", "Proveedores certificados", "Registros", "Calibración de autoclaves"]
    },
    {
      id: 7,
      title: "Preparación para Verificaciones",
      duration: "70 min",
      status: "not_started",
      progress: 0,
      description: "Cómo prepararse para inspecciones COFEPRIS",
      topics: ["Proceso de verificación", "Documentos requeridos", "Buenas prácticas", "Manejo de observaciones"]
    },
    {
      id: 8,
      title: "Trámites Frecuentes",
      duration: "85 min",
      status: "not_started",
      progress: 0,
      description: "Avisos de funcionamiento y otros trámites",
      topics: ["Aviso de funcionamiento", "Modificaciones", "Responsable sanitario", "Renovaciones"]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En progreso";
      default:
        return "No iniciado";
    }
  };

  const totalProgress = Math.round(
    courseModules.reduce((acc, module) => acc + module.progress, 0) / courseModules.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">COFEPRIS Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <button onClick={logout} className="btn-ghost">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Curso COFEPRIS Certificado
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Capacitación completa en normatividad sanitaria mexicana con evaluaciones 
            y certificación oficial al completar todos los módulos.
          </p>
          
          {/* Progress Overview */}
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tu Progreso General</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Completado</span>
                  <span className="text-2xl font-bold text-emerald-600">{totalProgress}%</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill h-3"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">2</div>
                  <div className="text-sm text-gray-600">Completados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <div className="text-sm text-gray-600">En Progreso</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">5</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Modules */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Módulos del Curso
              </h2>
              
              <div className="space-y-4" data-testid="course-modules-list">
                {courseModules.map((module) => (
                  <div
                    key={module.id}
                    className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                      selectedModule?.id === module.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-200"
                    }`}
                    onClick={() => setSelectedModule(module)}
                    data-testid={`course-module-${module.id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(module.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Módulo {module.id}: {module.title}
                          </h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">{module.duration}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          module.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : module.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {getStatusText(module.status)}
                        </span>
                      </div>
                    </div>
                    
                    {module.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                          <span>Progreso</span>
                          <span>{module.progress}%</span>
                        </div>
                        <div className="progress-bar h-2">
                          <div 
                            className="progress-fill h-2"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {module.id <= 2 ? "✓ Evaluación aprobada" : 
                         module.id === 3 ? "⚡ Evaluación pendiente" : "📝 Evaluación disponible"}
                      </div>
                      
                      <button
                        className={`flex items-center text-sm font-medium ${
                          module.status === "completed"
                            ? "text-emerald-600 hover:text-emerald-700"
                            : module.status === "in_progress"
                            ? "text-yellow-600 hover:text-yellow-700"
                            : "text-gray-600 hover:text-gray-700"
                        }`}
                        data-testid={`module-action-${module.id}`}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        {module.status === "completed" ? "Revisar" : 
                         module.status === "in_progress" ? "Continuar" : "Iniciar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Details */}
            {selectedModule && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Módulo Seleccionado
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{selectedModule.title}</h4>
                    <p className="text-sm text-gray-600">{selectedModule.description}</p>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duración:</span>
                    <span className="font-medium">{selectedModule.duration}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium">{getStatusText(selectedModule.status)}</span>
                  </div>
                  
                  {selectedModule.progress > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progreso:</span>
                        <span className="font-medium">{selectedModule.progress}%</span>
                      </div>
                      <div className="progress-bar h-2">
                        <div 
                          className="progress-fill h-2"
                          style={{ width: `${selectedModule.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="w-full btn-primary"
                    data-testid="start-selected-module-btn"
                  >
                    {selectedModule.status === "completed" ? "Revisar Módulo" : 
                     selectedModule.status === "in_progress" ? "Continuar Módulo" : "Iniciar Módulo"}
                  </button>
                </div>
              </div>
            )}

            {/* Certification Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-6 w-6 text-yellow-500 mr-2" />
                Certificación
              </h3>
              
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>🏆 Certificado Oficial</strong><br />
                    Al completar todos los módulos con 80% o más en las evaluaciones, 
                    recibirás un certificado oficial.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-700">Válido para verificaciones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-700">Reconocido por autoridades</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-700">Actualizado con normativa vigente</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Progreso actual: {totalProgress}% completado
                  </p>
                </div>
              </div>
            </div>

            {/* Course Features */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Características del Curso
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>Contenido interactivo y actualizado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <span>Evaluaciones con IA adaptativa</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <span>Recursos descargables</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Certificación oficial</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/ai-assistant"
                  className="w-full btn-secondary text-center block"
                >
                  Consultar IA Especializada
                </Link>
                
                <Link
                  to="/editor"
                  className="w-full btn-ghost text-center block"
                >
                  Editor de Documentos
                </Link>
                
                <button className="w-full btn-ghost">
                  Descargar Recursos
                </button>
              </div>
            </div>

            {/* Study Recommendations */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recomendaciones de Estudio
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  📅 <strong>Ritmo sugerido:</strong> 1-2 módulos por semana
                </p>
                <p>
                  ⏰ <strong>Tiempo dedicado:</strong> 2-3 horas semanales
                </p>
                <p>
                  📝 <strong>Evaluaciones:</strong> Mínimo 80% para aprobar
                </p>
                <p>
                  🔄 <strong>Repaso:</strong> Disponible 24/7 sin límites
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSystem;