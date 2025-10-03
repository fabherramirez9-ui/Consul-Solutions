import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, BookOpen, Brain, FileText, Calendar } from "lucide-react";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">COFEPRIS Pro</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/auth" className="btn-ghost">
              Iniciar Sesión
            </Link>
            <Link to="/auth" className="btn-primary">
              Comenzar Prueba
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 text-heading animate-fade-in-up">
            Cumplimiento COFEPRIS
            <span className="block text-emerald-600">Simplificado</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up">
            Plataforma integral para establecimientos de salud que automatiza el cumplimiento regulatorio, 
            genera documentos personalizados y te prepara para verificaciones COFEPRIS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link 
              to="/auth" 
              className="btn-primary text-lg px-8 py-4"
              data-testid="get-started-btn"
            >
              Comenzar Ahora - $199 MXN/mes
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Ver Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✅ 30 días de prueba • ✅ Sin permanencia • ✅ Soporte especializado
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="card text-center animate-slide-in-right">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-heading">IA Especializada</h3>
            <p className="text-gray-600 text-body">
              Asistente con conocimiento específico en regulación sanitaria mexicana. 
              Analiza tu establecimiento y sugiere documentos exactos.
            </p>
          </div>

          <div className="card text-center animate-slide-in-right" style={{animationDelay: '0.1s'}}>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-heading">Documentos Automáticos</h3>
            <p className="text-gray-600 text-body">
              Genera POEs, manuales, bitácoras y señalética personalizados. 
              Descarga PDFs profesionales listos para verificación.
            </p>
          </div>

          <div className="card text-center animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-heading">Curso Certificado</h3>
            <p className="text-gray-600 text-body">
              Capacitación completa en normativa COFEPRIS con evaluaciones. 
              Prepárate para verificaciones con confianza.
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="glass-card p-12 text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-heading">
            Todo lo que necesitas en una suscripción
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Perfilado regulatorio inteligente</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Documentos y POEs personalizados</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Editor visual con ayudas</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">IA Q&A especializada</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Curso COFEPRIS completo</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Expediente digital organizado</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Recordatorios automáticos</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-gray-700">Descargas PDF ilimitadas</span>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 inline-block">
            <div className="text-3xl font-bold text-emerald-600 mb-2">$199 MXN/mes</div>
            <div className="text-sm text-emerald-700">
              Incluye todo • Sin costos adicionales • Cancela cuando quieras
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12 text-heading">
            Cómo funciona
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3 text-heading">Perfila tu establecimiento</h3>
              <p className="text-gray-600 text-body">
                Completa un wizard inteligente sobre tu giro, servicios y equipos.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3 text-heading">Recibe sugerencias</h3>
              <p className="text-gray-600 text-body">
                La IA analiza tu perfil y sugiere documentos y trámites específicos.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3 text-heading">Edita y descarga</h3>
              <p className="text-gray-600 text-body">
                Usa el editor visual para personalizar y generar PDFs profesionales.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-3 text-heading">Mantén cumplimiento</h3>
              <p className="text-gray-600 text-body">
                Organiza tu expediente y recibe recordatorios de vencimientos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-heading">
            Comienza tu cumplimiento COFEPRIS hoy
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a cientos de establecimientos que ya simplifican su cumplimiento regulatorio
          </p>
          <Link 
            to="/auth" 
            className="btn-primary text-xl px-12 py-5 inline-block"
            data-testid="cta-register-btn"
          >
            Registrarme - Prueba 30 días gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
                <span className="text-xl font-bold">COFEPRIS Pro</span>
              </div>
              <p className="text-gray-400">
                Plataforma líder en cumplimiento regulatorio para establecimientos de salud en México.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Aviso legal</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 COFEPRIS Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;