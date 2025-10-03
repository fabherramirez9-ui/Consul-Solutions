import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FileText, AlertTriangle, CheckCircle, ShoppingCart, Eye, Edit, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import { api } from "../utils/api";

const SuggestionsView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const [suggestions, setSuggestions] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedItems, setSelectedItems] = useState({
    plantillas: [],
    tramites: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get data from navigation state or fetch fresh data
    if (location.state?.suggestions && location.state?.profile) {
      setSuggestions(location.state.suggestions);
      setProfile(location.state.profile);
    } else {
      // Redirect back to profiling if no data
      navigate("/profiling");
    }
  }, [location, navigate]);

  const handleItemToggle = (type, itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(itemId)
        ? prev[type].filter(id => id !== itemId)
        : [...prev[type], itemId]
    }));
  };

  const handleActivateItems = async () => {
    if (selectedItems.plantillas.length === 0 && selectedItems.tramites.length === 0) {
      toast.error("Selecciona al menos un documento o trámite");
      return;
    }

    setLoading(true);
    
    try {
      // Create selection record
      await api.post('/selections', {
        items: selectedItems,
        estado: "ACTIVO"
      });
      
      toast.success("¡Documentos activados! Redirigiendo al editor...");
      
      // Navigate to editor with first selected template
      if (selectedItems.plantillas.length > 0) {
        navigate(`/editor/${selectedItems.plantillas[0]}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Error al activar documentos: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (item) => {
    if (item.razones?.toLowerCase().includes("obligatorio")) {
      return { label: "Obligatorio", class: "bg-red-100 text-red-800 border-red-200" };
    }
    return { label: "Recomendado", class: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  };

  if (!suggestions || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sugerencias...</p>
        </div>
      </div>
    );
  }

  const totalSelected = selectedItems.plantillas.length + selectedItems.tramites.length;

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sugerencias Personalizadas
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Basadas en tu perfil: {profile.giro} en {profile.ubicacion_estado}
          </p>
          
          <div className="inline-flex items-center space-x-6 bg-white/80 backdrop-blur-md rounded-2xl px-8 py-4 border border-emerald-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{suggestions.plantillas?.length || 0}</div>
              <div className="text-sm text-gray-600">Documentos</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{suggestions.tramites?.length || 0}</div>
              <div className="text-sm text-gray-600">Trámites</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{suggestions.completitud_estimado}%</div>
              <div className="text-sm text-gray-600">Completitud</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Justification */}
            {suggestions.justificacion && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                  Análisis Regulatorio
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {suggestions.justificacion}
                </p>
              </div>
            )}

            {/* Document Templates */}
            {suggestions.plantillas && suggestions.plantillas.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="h-7 w-7 text-emerald-600 mr-3" />
                  Documentos Recomendados
                </h2>
                
                <div className="space-y-4">
                  {suggestions.plantillas.map((template) => {
                    const priority = getPriorityLabel(template);
                    const isSelected = selectedItems.plantillas.includes(template.id);
                    
                    return (
                      <div
                        key={template.id}
                        className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-emerald-200"
                        }`}
                        onClick={() => handleItemToggle("plantillas", template.id)}
                        data-testid={`template-${template.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {template.nombre}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priority.class}`}>
                                {priority.label}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-4">
                              <strong>Qué incluye:</strong> {template.que_incluye}
                            </p>
                            
                            <p className="text-sm text-gray-700 mb-4">
                              <strong>Razón:</strong> {template.razones}
                            </p>
                            
                            <div className="flex items-center space-x-4">
                              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver ejemplo
                              </button>
                              <button className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center">
                                <Edit className="h-4 w-4 mr-1" />
                                Editar después
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center ml-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleItemToggle("plantillas", template.id)}
                              className="h-5 w-5 text-emerald-600 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tramites */}
            {suggestions.tramites && suggestions.tramites.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CheckCircle className="h-7 w-7 text-blue-600 mr-3" />
                  Trámites Requeridos
                </h2>
                
                <div className="space-y-4">
                  {suggestions.tramites.map((tramite) => {
                    const isSelected = selectedItems.tramites.includes(tramite.id);
                    
                    return (
                      <div
                        key={tramite.id}
                        className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 bg-white hover:border-emerald-200"
                        }`}
                        onClick={() => handleItemToggle("tramites", tramite.id)}
                        data-testid={`tramite-${tramite.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              {tramite.nombre}
                            </h3>
                            
                            <div className="space-y-2 text-sm">
                              <p><strong>Autoridad:</strong> {tramite.autoridad}</p>
                              <p><strong>Requisitos:</strong> {tramite.requisitos}</p>
                              {tramite.costo_externo && (
                                <p><strong>Costo:</strong> ${tramite.costo_externo.toLocaleString()} MXN</p>
                              )}
                              {tramite.periodicidad && (
                                <p><strong>Periodicidad:</strong> {tramite.periodicidad}</p>
                              )}
                            </div>
                            
                            {tramite.guia_url && (
                              <a
                                href={tramite.guia_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ver guía oficial
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </a>
                            )}
                          </div>
                          
                          <div className="flex items-center ml-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleItemToggle("tramites", tramite.id)}
                              className="h-5 w-5 text-emerald-600 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selection Summary */}
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-6 w-6 text-emerald-600 mr-2" />
                Carrito de Documentos
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Documentos seleccionados:</span>
                  <span className="font-semibold">{selectedItems.plantillas.length}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Trámites seleccionados:</span>
                  <span className="font-semibold">{selectedItems.tramites.length}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total seleccionado:</span>
                    <span className="text-lg font-bold text-emerald-600">{totalSelected}</span>
                  </div>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 text-center">
                    <strong>✓ Incluido en tu suscripción</strong><br />
                    Sin costos adicionales
                  </p>
                </div>
                
                <button
                  onClick={handleActivateItems}
                  disabled={totalSelected === 0 || loading}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    totalSelected > 0 && !loading
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  data-testid="activate-items-btn"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Activando...</span>
                    </div>
                  ) : (
                    "Finalizar y Abrir Editor"
                  )}
                </button>
              </div>
            </div>

            {/* Completeness Progress */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Completitud Estimada
              </h3>
              
              <div className="space-y-4">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${suggestions.completitud_estimado}%` }}
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    {suggestions.completitud_estimado}%
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Cumplimiento regulatorio estimado
                  </p>
                </div>
                
                <div className="text-xs text-gray-500">
                  <p>
                    Este porcentaje es una estimación basada en los documentos y trámites 
                    recomendados para tu tipo de establecimiento.
                  </p>
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
                  to="/course"
                  className="w-full btn-ghost text-center block"
                >
                  Ver Curso COFEPRIS
                </Link>
                
                <button
                  onClick={() => navigate("/profiling")}
                  className="w-full btn-ghost"
                >
                  Modificar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsView;