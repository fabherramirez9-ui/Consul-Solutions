import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Shield, FileText, Download, Calendar, AlertTriangle, CheckCircle, Upload, Search, Filter } from "lucide-react";
import { useAuth } from "../App";

const FileManager = () => {
  const { logout } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const folders = [
    { id: "all", name: "Todos los documentos", count: 18, icon: FolderOpen, color: "gray" },
    { id: "rpbi", name: "RPBI", count: 4, icon: AlertTriangle, color: "red" },
    { id: "poe", name: "POE", count: 6, icon: FileText, color: "blue" },
    { id: "senialetica", name: "Señalética", count: 3, icon: CheckCircle, color: "green" },
    { id: "tramites", name: "Trámites", count: 5, icon: Calendar, color: "purple" }
  ];

  const documents = [
    {
      id: 1,
      name: "POE de Limpieza y Desinfección",
      folder: "poe",
      status: "listo",
      lastModified: "2025-01-15",
      expirationDate: "2025-12-31",
      size: "245 KB",
      type: "PDF"
    },
    {
      id: 2,
      name: "Programa de Manejo de RPBI",
      folder: "rpbi",
      status: "listo",
      lastModified: "2025-01-10",
      expirationDate: "2025-06-15",
      size: "189 KB",
      type: "PDF"
    },
    {
      id: 3,
      name: "Bitácora de Esterilización",
      folder: "poe",
      status: "borrador",
      lastModified: "2025-01-12",
      expirationDate: null,
      size: "156 KB",
      type: "PDF"
    },
    {
      id: 4,
      name: "Señalética de Emergencia",
      folder: "senialetica",
      status: "listo",
      lastModified: "2025-01-08",
      expirationDate: "2025-11-20",
      size: "2.1 MB",
      type: "PDF"
    },
    {
      id: 5,
      name: "Aviso de Funcionamiento",
      folder: "tramites",
      status: "pendiente",
      lastModified: "2025-01-14",
      expirationDate: "2025-02-28",
      size: "98 KB",
      type: "PDF"
    },
    {
      id: 6,
      name: "Manual de Procedimientos",
      folder: "poe",
      status: "listo",
      lastModified: "2025-01-05",
      expirationDate: "2025-10-15",
      size: "512 KB",
      type: "PDF"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "listo":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "borrador":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pendiente":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "listo":
        return "Listo";
      case "borrador":
        return "Borrador";
      case "pendiente":
        return "Pendiente";
      default:
        return "Desconocido";
    }
  };

  const getFolderColor = (color) => {
    const colors = {
      gray: "bg-gray-100 text-gray-600",
      red: "bg-red-100 text-red-600",
      blue: "bg-blue-100 text-blue-600",
      green: "bg-emerald-100 text-emerald-600",
      purple: "bg-purple-100 text-purple-600"
    };
    return colors[color] || colors.gray;
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expiry = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFolder = selectedFolder === "all" || doc.folder === selectedFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const complianceStatus = {
    total: documents.length,
    ready: documents.filter(d => d.status === "listo").length,
    draft: documents.filter(d => d.status === "borrador").length,
    pending: documents.filter(d => d.status === "pendiente").length
  };

  const compliancePercentage = Math.round((complianceStatus.ready / complianceStatus.total) * 100);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mi Expediente Digital
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organiza y gestiona todos tus documentos COFEPRIS en un solo lugar
          </p>

          {/* Compliance Overview */}
          <div className="glass-card p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cumplimiento</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl font-bold text-emerald-600">{compliancePercentage}%</div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Cumplimiento general</div>
                    <div className="progress-bar w-32">
                      <div 
                        className="progress-fill"
                        style={{ width: `${compliancePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">{complianceStatus.ready}</div>
                  <div className="text-sm text-emerald-700">Listos</div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">{complianceStatus.draft}</div>
                  <div className="text-sm text-yellow-700">Borradores</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">{complianceStatus.pending}</div>
                  <div className="text-sm text-red-700">Pendientes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Folders */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Carpetas</h3>
              
              <div className="space-y-2" data-testid="folder-list">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                      selectedFolder === folder.id
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "hover:bg-white/50"
                    }`}
                    data-testid={`folder-${folder.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFolderColor(folder.color)}`}>
                        <folder.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{folder.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <Link to="/editor" className="w-full btn-primary text-center block flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Nuevo Documento
                </Link>
                
                <button className="w-full btn-secondary flex items-center justify-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Archivo
                </button>
                
                <button className="w-full btn-ghost flex items-center justify-center">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Todo
                </button>
              </div>
            </div>

            {/* Expiration Alerts */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                Próximos a Vencer
              </h3>
              
              <div className="space-y-3">
                {documents
                  .filter(doc => isExpiringSoon(doc.expirationDate))
                  .slice(0, 3)
                  .map(doc => (
                    <div key={doc.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">{doc.name}</p>
                      <p className="text-xs text-yellow-600">
                        Vence: {new Date(doc.expirationDate).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
                    data-testid="search-input"
                  />
                </div>
                <button className="btn-ghost flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtrar
                </button>
              </div>

              {/* Documents List */}
              <div className="space-y-4" data-testid="documents-list">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="border border-gray-200 rounded-xl p-6 hover:border-emerald-200 transition-colors bg-white/50"
                    data-testid={`document-${document.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{document.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>Modificado: {new Date(document.lastModified).toLocaleDateString('es-MX')}</span>
                            <span>{document.size}</span>
                            <span>{document.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                          {getStatusText(document.status)}
                        </span>
                        
                        {document.expirationDate && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Vence</div>
                            <div className={`text-xs font-medium ${
                              isExpiringSoon(document.expirationDate) 
                                ? "text-red-600" 
                                : "text-gray-700"
                            }`}>
                              {new Date(document.expirationDate).toLocaleDateString('es-MX')}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <Link 
                            to={`/editor/${document.id}`}
                            className="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Editar"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {isExpiringSoon(document.expirationDate) && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-yellow-700">
                          Este documento vence pronto. Considera renovarlo o actualizarlo.
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm 
                      ? "Intenta con diferentes términos de búsqueda"
                      : "Comienza creando tu primer documento"
                    }
                  </p>
                  <Link to="/editor" className="btn-primary">
                    Crear Documento
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;