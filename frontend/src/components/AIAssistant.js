import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Send, Shield, MessageCircle, FileText, ExternalLink, Lightbulb, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../App";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIAssistant = () => {
  const { user, logout } = useAuth();
  const [consultation, setConsultation] = useState({
    giro: "",
    servicios: "",
    ubicacion: "",
    equipo: "",
    pregunta: ""
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const giroOptions = [
    "SPA", "CONSULTORIO_ODONTO", "CLINICA_ESTETICA", "CONSULTORIO_GENERAL", "OTRO"
  ];

  const handleInputChange = (field, value) => {
    setConsultation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!consultation.pregunta.trim()) {
      toast.error("Por favor ingresa tu pregunta");
      return;
    }

    setLoading(true);
    
    try {
      const perfil = {
        giro: consultation.giro,
        servicios: consultation.servicios.split(',').map(s => s.trim()).filter(s => s),
        ubicacion_estado: consultation.ubicacion,
        equipo_especial: consultation.equipo.split(',').map(s => s.trim()).filter(s => s),
        situacion_especifica: consultation.pregunta
      };

      const consultationResponse = await axios.post(`${API}/ai/consultation`, {
        perfil: perfil,
        pregunta: consultation.pregunta
      });

      setResponse(consultationResponse.data);
      toast.success("¡Consulta procesada exitosamente!");
    } catch (error) {
      toast.error("Error al procesar consulta: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setConsultation({
      giro: "",
      servicios: "",
      ubicacion: "",
      equipo: "",
      pregunta: ""
    });
    setResponse(null);
  };

  const sampleQuestions = [
    "¿Qué documentos necesito para un spa que ofrece tratamientos estéticos?",
    "¿Cómo debo manejar los RPBI en mi consultorio odontológico?",
    "¿Cuáles son los requisitos para obtener el Aviso de Funcionamiento?",
    "¿Necesito responsable sanitario para mi clínica de estética?",
    "¿Qué señalética es obligatoria en mi establecimiento?"
  ];

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
              <Link to="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <button onClick={logout} className="btn-ghost">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Asistente IA Especializada
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Obtén respuestas expertas sobre cumplimiento COFEPRIS con análisis detallado 
            y recomendaciones específicas para tu establecimiento.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Consultation Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="h-7 w-7 text-emerald-600 mr-3" />
                Contexto de tu Consulta
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giro del establecimiento
                    </label>
                    <select
                      value={consultation.giro}
                      onChange={(e) => handleInputChange("giro", e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 bg-white"
                      data-testid="ai-giro-select"
                    >
                      <option value="">Selecciona un giro</option>
                      {giroOptions.map((giro) => (
                        <option key={giro} value={giro}>{giro.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado/ubicación
                    </label>
                    <input
                      type="text"
                      value={consultation.ubicacion}
                      onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                      placeholder="Ej: Ciudad de México"
                      data-testid="ai-location-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servicios que ofreces
                  </label>
                  <input
                    type="text"
                    value={consultation.servicios}
                    onChange={(e) => handleInputChange("servicios", e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    placeholder="Ej: Consulta general, Odontología, Tratamientos estéticos"
                    data-testid="ai-services-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipo especial (opcional)
                  </label>
                  <input
                    type="text"
                    value={consultation.equipo}
                    onChange={(e) => handleInputChange("equipo", e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    placeholder="Ej: Autoclave, Rayos X, Láser"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu pregunta específica
                  </label>
                  <textarea
                    value={consultation.pregunta}
                    onChange={(e) => handleInputChange("pregunta", e.target.value)}
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    placeholder="Describe tu situación y pregunta específica sobre cumplimiento COFEPRIS..."
                    data-testid="ai-question-input"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-4 text-base flex items-center justify-center"
                    data-testid="ai-submit-btn"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Obtener Respuesta IA
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearForm}
                    className="btn-secondary px-6"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            {/* AI Response */}
            {response && (
              <div className="glass-card p-8" data-testid="ai-response-container">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Lightbulb className="h-7 w-7 text-emerald-600 mr-3" />
                  Respuesta de IA Especializada
                </h2>

                <div className="space-y-8">
                  {/* Reasoning Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <Brain className="h-6 w-6 mr-2" />
                      Razonamiento y Análisis
                    </h3>
                    <div className="text-blue-800 leading-relaxed whitespace-pre-line">
                      {response.razonamiento}
                    </div>
                  </div>

                  {/* Conclusion Section */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                      <CheckCircle className="h-6 w-6 mr-2" />
                      Conclusión y Recomendaciones
                    </h3>
                    <div className="text-emerald-800 leading-relaxed whitespace-pre-line">
                      {response.respuesta}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                    <Link
                      to="/editor"
                      className="btn-primary flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Abrir Editor
                    </Link>
                    
                    <Link
                      to="/suggestions"
                      className="btn-secondary flex items-center"
                    >
                      Ver Sugerencias
                    </Link>
                    
                    <a
                      href="https://www.gob.mx/cofepris/documentos/guias-de-informacion-estatutos-y-otros"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Guías Oficiales
                    </a>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <p><strong>Fecha de consulta:</strong> {new Date(response.created_at).toLocaleString('es-MX')}</p>
                    <p><strong>ID de consulta:</strong> {response.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sample Questions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preguntas Frecuentes
              </h3>
              
              <div className="space-y-3">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleInputChange("pregunta", question)}
                    className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                Aviso Importante
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  La información proporcionada es de carácter orientativo y educativo, 
                  basada en la normatividad vigente COFEPRIS.
                </p>
                <p>
                  <strong>No constituye asesoría legal vinculante.</strong> Para casos 
                  específicos, consulte con profesionales especializados.
                </p>
                <p>
                  Siempre verifique la normatividad actual en el portal oficial de COFEPRIS.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/profiling"
                  className="w-full btn-secondary text-center block"
                >
                  Crear Nuevo Perfil
                </Link>
                
                <Link
                  to="/course"
                  className="w-full btn-ghost text-center block"
                >
                  Ver Curso COFEPRIS
                </Link>
                
                <a
                  href="https://www.gob.mx/cofepris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-ghost text-center block"
                >
                  Portal COFEPRIS
                </a>
              </div>
            </div>

            {/* AI Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sobre la IA
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Nuestro asistente utiliza <strong>Claude Sonnet 4</strong>, 
                  especializado en regulación sanitaria mexicana.
                </p>
                <p>
                  Entrenado con normativas COFEPRIS actualizadas para 
                  proporcionar respuestas precisas y contextualizadas.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-700 text-center">
                    ✓ <strong>Incluido en tu suscripción</strong><br />
                    Consultas ilimitadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;