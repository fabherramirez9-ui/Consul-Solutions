import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Building, MapPin, Wrench, AlertTriangle, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfilingWizard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    giro: "",
    servicios: [],
    numero_salas: 1,
    equipo_especial: [],
    maneja_rpbi: false,
    responsable_sanitario: false,
    ubicacion_estado: "",
    farmacia_anexo: false,
    notas_estatales: ""
  });

  const giroOptions = [
    { value: "SPA", label: "Spa y Centro de Bienestar", icon: "🧘‍♀️" },
    { value: "CONSULTORIO_ODONTO", label: "Consultorio Odontológico", icon: "🦷" },
    { value: "CLINICA_ESTETICA", label: "Clínica Estética", icon: "✨" },
    { value: "CONSULTORIO_GENERAL", label: "Consultorio Médico General", icon: "🩺" },
    { value: "OTRO", label: "Otro (especificar)", icon: "🏥" }
  ];

  const serviciosOptions = [
    "Consulta general", "Odontología", "Cirugía menor", "Inyectables",
    "Tratamientos estéticos", "Masajes", "Fisioterapia", "Laboratorio",
    "Rayos X", "Ultrasonido", "Limpieza dental", "Blanqueamiento",
    "Ortodoncia", "Endodoncia", "Cirugía oral", "Implantes"
  ];

  const equipoOptions = [
    "Autoclave", "Rayos X", "Ultrasonido", "Láser", "Electrocauterio",
    "Unidad dental", "Compresor dental", "Equipo de anestesia",
    "Monitor de signos vitales", "Desfibrilador", "Centrifuga",
    "Microscopio", "Equipo de esterilización"
  ];

  const estadosOptions = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
    "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
    "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco",
    "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León",
    "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala",
    "Veracruz", "Yucatán", "Zacatecas"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create establishment profile
      const establishmentResponse = await fetch(`${API}/establishments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!establishmentResponse.ok) {
        throw new Error('Error creating establishment');
      }
      
      // Generate suggestions immediately
      const suggestionsResponse = await fetch(`${API}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!suggestionsResponse.ok) {
        throw new Error('Error generating suggestions');
      }
      
      const suggestionsData = await suggestionsResponse.json();
      
      toast.success("¡Perfil creado! Generando sugerencias personalizadas...");
      
      // Navigate to suggestions with data
      navigate("/suggestions", { 
        state: { 
          profile: formData, 
          suggestions: suggestionsData 
        } 
      });
    } catch (error) {
      console.error("Profiling error:", error);
      toast.error("Error al crear perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.giro !== "";
      case 2:
        return formData.servicios.length > 0;
      case 3:
        return formData.ubicacion_estado !== "";
      case 4:
        return true; // Optional step
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

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
            <button
              onClick={logout}
              className="btn-ghost"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Perfila tu establecimiento</h1>
            <span className="text-sm text-gray-600">Paso {currentStep} de 5</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Giro</span>
            <span>Servicios</span>
            <span>Ubicación</span>
            <span>Detalles</span>
            <span>Revisión</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Giro */}
          {currentStep === 1 && (
            <div className="glass-card p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <Building className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cuál es el giro de tu establecimiento?</h2>
                <p className="text-gray-600">Esto nos ayuda a identificar los requisitos regulatorios específicos</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {giroOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange("giro", option.value)}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      formData.giro === option.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50"
                    }`}
                    data-testid={`giro-option-${option.value}`}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div className="glass-card p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <Users className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Qué servicios ofreces?</h2>
                <p className="text-gray-600">Selecciona todos los servicios que proporciona tu establecimiento</p>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {serviciosOptions.map((servicio) => (
                  <button
                    key={servicio}
                    onClick={() => handleArrayToggle("servicios", servicio)}
                    className={`p-4 border-2 rounded-lg transition-all text-sm ${
                      formData.servicios.includes(servicio)
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-white hover:border-emerald-200"
                    }`}
                    data-testid={`service-${servicio.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {servicio}
                  </button>
                ))}
              </div>

              {formData.servicios.length > 0 && (
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-700">
                    <strong>Seleccionados:</strong> {formData.servicios.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="glass-card p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <MapPin className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación del establecimiento</h2>
                <p className="text-gray-600">Las regulaciones pueden variar según el estado</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estado donde se ubica tu establecimiento
                  </label>
                  <select
                    value={formData.ubicacion_estado}
                    onChange={(e) => handleInputChange("ubicacion_estado", e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 bg-white"
                    data-testid="state-select"
                  >
                    <option value="">Selecciona un estado</option>
                    {estadosOptions.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Número de salas o consultorios
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.numero_salas}
                    onChange={(e) => handleInputChange("numero_salas", parseInt(e.target.value) || 1)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    data-testid="rooms-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="glass-card p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <Wrench className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalles adicionales</h2>
                <p className="text-gray-600">Información complementaria para personalizar tus documentos</p>
              </div>

              <div className="space-y-8">
                {/* Equipment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipo especial (opcional)</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {equipoOptions.map((equipo) => (
                      <button
                        key={equipo}
                        onClick={() => handleArrayToggle("equipo_especial", equipo)}
                        className={`p-3 border-2 rounded-lg transition-all text-sm ${
                          formData.equipo_especial.includes(equipo)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-gray-200 bg-white hover:border-emerald-200"
                        }`}
                      >
                        {equipo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Boolean options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="rpbi"
                      checked={formData.maneja_rpbi}
                      onChange={(e) => handleInputChange("maneja_rpbi", e.target.checked)}
                      className="h-5 w-5 text-emerald-600"
                    />
                    <label htmlFor="rpbi" className="text-gray-700">
                      ¿Maneja residuos peligrosos biológico-infecciosos (RPBI)?
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="responsable"
                      checked={formData.responsable_sanitario}
                      onChange={(e) => handleInputChange("responsable_sanitario", e.target.checked)}
                      className="h-5 w-5 text-emerald-600"
                    />
                    <label htmlFor="responsable" className="text-gray-700">
                      ¿Cuenta con responsable sanitario?
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="farmacia"
                      checked={formData.farmacia_anexo}
                      onChange={(e) => handleInputChange("farmacia_anexo", e.target.checked)}
                      className="h-5 w-5 text-emerald-600"
                    />
                    <label htmlFor="farmacia" className="text-gray-700">
                      ¿Tiene farmacia o anexo?
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={formData.notas_estatales}
                    onChange={(e) => handleInputChange("notas_estatales", e.target.value)}
                    rows={3}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    placeholder="Cualquier información adicional relevante..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="glass-card p-8 animate-fade-in-up">
              <div className="text-center mb-8">
                <Shield className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu perfil</h2>
                <p className="text-gray-600">Confirma que la información sea correcta antes de generar las sugerencias</p>
              </div>

              <div className="space-y-6 text-left">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información general</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Giro:</strong> {giroOptions.find(g => g.value === formData.giro)?.label}</p>
                      <p><strong>Estado:</strong> {formData.ubicacion_estado}</p>
                      <p><strong>Número de salas:</strong> {formData.numero_salas}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Características especiales</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Maneja RPBI:</strong> {formData.maneja_rpbi ? "Sí" : "No"}</p>
                      <p><strong>Responsable sanitario:</strong> {formData.responsable_sanitario ? "Sí" : "No"}</p>
                      <p><strong>Farmacia anexo:</strong> {formData.farmacia_anexo ? "Sí" : "No"}</p>
                    </div>
                  </div>
                </div>

                {formData.servicios.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Servicios ({formData.servicios.length})</h3>
                    <p className="text-sm text-gray-600">{formData.servicios.join(", ")}</p>
                  </div>
                )}

                {formData.equipo_especial.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Equipo especial ({formData.equipo_especial.length})</h3>
                    <p className="text-sm text-gray-600">{formData.equipo_especial.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 ${
                currentStep === 1 ? "btn-ghost opacity-50 cursor-not-allowed" : "btn-secondary"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 ${
                  canProceed() ? "btn-primary" : "btn-primary opacity-50 cursor-not-allowed"
                }`}
                data-testid="next-step-btn"
              >
                <span>Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-8"
                data-testid="generate-suggestions-btn"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </div>
                ) : (
                  "Generar Sugerencias"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilingWizard;