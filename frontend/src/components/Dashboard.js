import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, FileText, Brain, BookOpen, FolderOpen, Plus, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Building } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../App";
import { api } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    establishments: 0,
    documents: 0,
    completeness: 0,
    pendingTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load establishments
      const establishments = await api.get('/establishments');

      // Mock stats for now - in production, these would come from backend
      setStats({
        establishments: establishments.length,
        documents: Math.floor(Math.random() * 20) + 5,
        completeness: Math.floor(Math.random() * 40) + 60,
        pendingTasks: Math.floor(Math.random() * 5) + 2
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: "document",
          title: "POE de Limpieza actualizado",
          time: "Hace 2 horas",
          status: "completed"
        },
        {
          id: 2,
          type: "consultation",
          title: "Consulta sobre RPBI respondida",
          time: "Ayer",
          status: "completed"
        },
        {
          id: 3,
          type: "course",
          title: "Módulo COFEPRIS completado",
          time: "Hace 3 días",
          status: "completed"
        },
        {
          id: 4,
          type: "reminder",
          title: "Renovación de licencia próxima",
          time: "En 15 días",
          status: "pending"
        }
      ]);

    } catch (error) {
      toast.error("Error cargando dashboard");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Nuevo Establecimiento",
      description: "Crear perfil regulatorio",
      icon: Building,
      color: "emerald",
      action: () => navigate("/profiling"),
      testid: "new-establishment-btn"
    },
    {
      title: "Consultar IA",
      description: "Pregunta especializada",
      icon: Brain,
      color: "blue",
      action: () => navigate("/ai-assistant"),
      testid: "ai-consultation-btn"
    },
    {
      title: "Editor de Documentos",
      description: "Crear o editar POEs",
      icon: FileText,
      color: "purple",
      action: () => navigate("/editor"),
      testid: "document-editor-btn"
    },
    {
      title: "Curso COFEPRIS",
      description: "Continuar capacitación",
      icon: BookOpen,
      color: "orange",
      action: () => navigate("/course"),
      testid: "course-btn"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
      blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
      purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
    };
    return colors[color] || colors.emerald;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
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
              <span className="text-gray-600">Hola, {user?.nombre}</span>
              <button onClick={logout} className="btn-ghost">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8" data-testid="dashboard-welcome">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard de Cumplimiento
          </h1>
          <p className="text-xl text-gray-600">
            Gestiona tu cumplimiento COFEPRIS de manera inteligente y eficiente
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.establishments}</div>
            <div className="text-sm text-gray-600">Establecimientos</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.documents}</div>
            <div className="text-sm text-gray-600">Documentos</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.completeness}%</div>
            <div className="text-sm text-gray-600">Cumplimiento</div>
          </div>

          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingTasks}</div>
            <div className="text-sm text-gray-600">Tareas Pendientes</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Plus className="h-7 w-7 text-emerald-600 mr-3" />
                Acciones Rápidas
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${getColorClasses(action.color)}`}
                    data-testid={action.testid}
                  >
                    <div className="flex items-start space-x-4">
                      <action.icon className="h-8 w-8 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Overview */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Progreso de Cumplimiento
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Cumplimiento General</span>
                    <span className="font-semibold text-emerald-600">{stats.completeness}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${stats.completeness}%` }}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-xl">
                    <div className="text-lg font-bold text-emerald-600">12</div>
                    <div className="text-sm text-emerald-700">Documentos Listos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-lg font-bold text-yellow-600">3</div>
                    <div className="text-sm text-yellow-700">En Progreso</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <div className="text-lg font-bold text-gray-600">5</div>
                    <div className="text-sm text-gray-700">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Actividad Reciente
              </h2>
              
              <div className="space-y-4" data-testid="recent-activity-list">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estado de Suscripción
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-emerald-700 font-medium">Activa</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Plan:</strong> COFEPRIS Pro</p>
                  <p><strong>Próxima renovación:</strong> 15 Feb 2025</p>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-700 text-center">
                    $199 MXN/mes<br />
                    <span className="text-xs">Incluye todo sin límites</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tareas Pendientes
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Renovar licencia</p>
                    <p className="text-yellow-600">Vence en 15 días</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Actualizar POE</p>
                    <p className="text-blue-600">Revisión anual</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <BookOpen className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-800">Completar curso</p>
                    <p className="text-purple-600">Módulo 3 pendiente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Enlaces Útiles
              </h3>
              
              <div className="space-y-3">
                <Link 
                  to="/files"
                  className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors"
                >
                  <FolderOpen className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Mi Expediente</span>
                </Link>
                
                <Link 
                  to="/ai-assistant"
                  className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors"
                >
                  <Brain className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">IA Especializada</span>
                </Link>
                
                <a 
                  href="https://www.gob.mx/cofepris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors"
                >
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Portal COFEPRIS</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;