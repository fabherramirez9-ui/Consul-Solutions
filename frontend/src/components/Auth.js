import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Phone, CreditCard } from "lucide-react";
import { useAuth } from "../App";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // login, register, payment
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    rfc: "",
    razon_social: ""
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      
      login(response.data.user, response.data.token);
      toast.success("¡Bienvenido! Inicio de sesión exitoso");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error en el inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/register`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        rfc: formData.rfc,
        razon_social: formData.razon_social
      });
      
      toast.success("Registro exitoso. Procesando pago...");
      setMode("payment");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error en el registro");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment webhook
      await axios.post(`${API}/webhooks/pago`, {
        user_id: "mock_user_id",
        status: "paid"
      });
      
      // Register and login user
      const response = await axios.post(`${API}/auth/register`, {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        rfc: formData.rfc,
        razon_social: formData.razon_social
      });
      
      login(response.data.user, response.data.token);
      toast.success("¡Pago procesado! Suscripción activada por 30 días");
      navigate("/profiling");
    } catch (error) {
      toast.error("Error procesando el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex">
      {/* Left Panel - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8" />
            <span className="text-2xl font-bold">COFEPRIS Pro</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6">
            Cumplimiento regulatorio simplificado
          </h1>
          
          <p className="text-xl mb-8 text-emerald-100">
            Genera documentos COFEPRIS automáticamente, recibe asesoría especializada de IA 
            y mantén tu establecimiento siempre en cumplimiento.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-emerald-800 text-sm">✓</span>
              </div>
              <span>Documentos personalizados por IA</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-emerald-800 text-sm">✓</span>
              </div>
              <span>Curso COFEPRIS certificado</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-emerald-800 text-sm">✓</span>
              </div>
              <span>Recordatorios automáticos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {mode === "login" && (
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
                <p className="text-gray-600">Accede a tu cuenta COFEPRIS Pro</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="tu@email.com"
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="Tu contraseña"
                      data-testid="login-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base"
                  data-testid="login-submit-btn"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Registro</h2>
                <p className="text-gray-600">Crea tu cuenta COFEPRIS Pro</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="Tu nombre completo"
                      data-testid="register-name-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="tu@email.com"
                      data-testid="register-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="Mínimo 8 caracteres"
                      data-testid="register-password-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="input-field pl-12"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RFC (opcional)
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="RFC123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razón Social (opcional)
                    </label>
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Mi Empresa SA"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base"
                  data-testid="register-submit-btn"
                >
                  {loading ? "Registrando..." : "Continuar al Pago"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          )}

          {mode === "payment" && (
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Suscripción</h2>
                <p className="text-gray-600">Activa tu plan COFEPRIS Pro</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">$199 MXN/mes</div>
                  <div className="text-sm text-emerald-700 mb-4">
                    Primer mes: $99 MXN (50% descuento)
                  </div>
                  <div className="text-xs text-gray-600">
                    Renovación automática • Cancela cuando quieras
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-gray-900">Tu suscripción incluye:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Perfilado regulatorio inteligente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Generación ilimitada de documentos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Editor visual con ayudas contextuales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>IA especializada en COFEPRIS</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Curso completo con certificación</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600">✓</span>
                    <span>Expediente digital organizado</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Pago simulado para demo. En producción: Stripe/Conekta
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full btn-primary py-3 text-base"
                data-testid="payment-submit-btn"
              >
                {loading ? "Procesando pago..." : "Activar Suscripción - $99 MXN"}
              </button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode("register")}
                  className="text-gray-600 text-sm hover:text-gray-800"
                >
                  ← Volver al registro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;