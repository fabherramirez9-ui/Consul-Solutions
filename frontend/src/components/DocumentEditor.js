import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FileText, Save, Download, Shield, CheckCircle, AlertTriangle, Eye, History, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import { api } from "../utils/api";

const DocumentEditor = () => {
  const { templateId } = useParams();
  const { logout } = useAuth();
  
  const [template, setTemplate] = useState(null);
  const [document, setDocument] = useState({
    campos: {},
    estado: "BORRADOR",
    validaciones: {}
  });
  const [validationResults, setValidationResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      const templatesResponse = await axios.get(`${API}/templates`);
      const templates = templatesResponse.data;
      
      if (templateId) {
        const selectedTemplate = templates.find(t => t.id === templateId);
        if (selectedTemplate) {
          setTemplate(selectedTemplate);
          initializeDocument(selectedTemplate);
        } else {
          toast.error("Plantilla no encontrada");
        }
      } else {
        // Show template selection if no ID provided
        setTemplate({ selection: true, templates });
      }
    } catch (error) {
      toast.error("Error cargando plantilla");
    } finally {
      setLoading(false);
    }
  };

  const initializeDocument = (template) => {
    const initialFields = {};
    
    Object.entries(template.campos_definicion || {}).forEach(([field, config]) => {
      if (config.type === 'array') {
        initialFields[field] = [];
      } else {
        initialFields[field] = '';
      }
    });

    setDocument({
      campos: initialFields,
      estado: "BORRADOR",
      validaciones: {}
    });
  };

  const handleFieldChange = (field, value) => {
    setDocument(prev => ({
      ...prev,
      campos: {
        ...prev.campos,
        [field]: value
      }
    }));
    
    // Clear validation error for this field
    if (validationResults[field]) {
      setValidationResults(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleArrayFieldAdd = (field, newItem) => {
    if (newItem.trim()) {
      setDocument(prev => ({
        ...prev,
        campos: {
          ...prev.campos,
          [field]: [...(prev.campos[field] || []), newItem.trim()]
        }
      }));
    }
  };

  const handleArrayFieldRemove = (field, index) => {
    setDocument(prev => ({
      ...prev,
      campos: {
        ...prev.campos,
        [field]: prev.campos[field].filter((_, i) => i !== index)
      }
    }));
  };

  const validateDocument = () => {
    const errors = {};
    
    Object.entries(template.campos_definicion || {}).forEach(([field, config]) => {
      if (config.required) {
        const value = document.campos[field];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors[field] = 'Este campo es obligatorio';
        }
      }
    });

    setValidationResults(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateDocument()) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    
    try {
      // Mock save - in production, this would create/update document instance
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDocument(prev => ({ ...prev, estado: "LISTO" }));
      toast.success("Documento guardado exitosamente");
    } catch (error) {
      toast.error("Error guardando documento");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // Mock PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("PDF generado exitosamente");
    } catch (error) {
      toast.error("Error generando PDF");
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const value = document.campos[fieldName] || '';
    const hasError = validationResults[fieldName];

    switch (fieldConfig.type) {
      case 'string':
      case 'text':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className={`w-full p-3 border-2 rounded-lg ${
                hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } focus:border-emerald-500`}
              placeholder={`Ingresa ${fieldName}`}
              data-testid={`field-${fieldName}`}
            />
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              rows={4}
              className={`w-full p-3 border-2 rounded-lg ${
                hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } focus:border-emerald-500`}
              placeholder={`Describe ${fieldName}`}
            />
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className={`w-full p-3 border-2 rounded-lg ${
                hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
              } focus:border-emerald-500`}
            >
              <option value="">Selecciona una opción</option>
              {fieldConfig.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case 'array':
        const arrayValue = Array.isArray(value) ? value : [];
        const [newItem, setNewItem] = useState('');
        
        return (
          <div key={fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <div className="space-y-2">
              {arrayValue.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 p-2 bg-gray-50 rounded border text-sm">{item}</span>
                  <button
                    onClick={() => handleArrayFieldRemove(fieldName, index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500"
                placeholder={`Agregar ${fieldName}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayFieldAdd(fieldName, newItem);
                    setNewItem('');
                  }
                }}
              />
              <button
                onClick={() => {
                  handleArrayFieldAdd(fieldName, newItem);
                  setNewItem('');
                }}
                className="btn-secondary px-4"
              >
                Agregar
              </button>
            </div>
            
            {hasError && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  // Template selection view
  if (template?.selection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Selecciona una Plantilla
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {template.templates.map((tmpl) => (
              <Link
                key={tmpl.id}
                to={`/editor/${tmpl.id}`}
                className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tmpl.nombre}</h3>
                <p className="text-sm text-gray-600 mb-3">{tmpl.que_incluye}</p>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                  {tmpl.categoria}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{template?.nombre}</h1>
                  <p className="text-gray-600">{template?.que_incluye}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    document.estado === 'LISTO' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.estado}
                  </span>
                </div>
              </div>

              {/* Document Fields */}
              <div className="space-y-6" data-testid="document-editor-form">
                {template && Object.entries(template.campos_definicion || {}).map(([fieldName, fieldConfig]) =>
                  renderField(fieldName, fieldConfig)
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center"
                  data-testid="save-document-btn"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="btn-secondary flex items-center"
                  data-testid="download-pdf-btn"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </button>

                <button className="btn-ghost flex items-center">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </button>

                <button className="btn-ghost flex items-center">
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validation Checklist */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 text-emerald-600 mr-2" />
                Lista de Verificación
              </h3>
              
              <div className="space-y-3">
                {template && Object.entries(template.campos_definicion || {}).map(([fieldName, fieldConfig]) => {
                  const isCompleted = document.campos[fieldName] && 
                    (!Array.isArray(document.campos[fieldName]) || document.campos[fieldName].length > 0);
                  
                  return (
                    <div key={fieldName} className="flex items-center space-x-3">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className={`text-sm ${isCompleted ? 'text-emerald-700' : 'text-gray-600'}`}>
                        {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                        {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Template Info */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de la Plantilla
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <strong className="text-gray-900">Categoría:</strong>
                  <p className="text-gray-600 mt-1">{template?.categoria}</p>
                </div>
                
                <div>
                  <strong className="text-gray-900">Razón de uso:</strong>
                  <p className="text-gray-600 mt-1">{template?.razones}</p>
                </div>
              </div>
            </div>

            {/* Help & Examples */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ayuda y Ejemplos
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white transition-colors text-sm flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                  Ver ejemplo completo
                </button>
                
                <button className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white transition-colors text-sm flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Descargar plantilla vacía
                </button>
                
                <Link
                  to="/ai-assistant"
                  className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white transition-colors text-sm flex items-center"
                >
                  <Brain className="h-4 w-4 mr-2 text-gray-500" />
                  Consultar IA especializada
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <button className="w-full btn-secondary text-sm">
                  Añadir a Expediente
                </button>
                
                <Link to="/files" className="w-full btn-ghost text-sm text-center block">
                  Ver Mi Expediente
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;