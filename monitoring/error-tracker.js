// Sistema de tracking de errores para Ecologist-GPT
// Captura y reporta errores de manera estructurada

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.errorCounts = {};
    this.maxErrors = 100;
    
    this.init();
  }
  
  init() {
    console.log('🐛 Iniciando tracking de errores...');
    
    // Capturar errores JavaScript
    window.addEventListener('error', (event) => {
      this.trackError('javascript', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
    
    // Capturar errores de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.trackError('resource', {
          type: event.target.tagName,
          src: event.target.src || event.target.href,
          message: event.message,
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
    }, true);
    
    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
    
    // Capturar errores de Supabase
    this.trackSupabaseErrors();
  }
  
  trackSupabaseErrors() {
    // Interceptar errores de Supabase
    const originalCreateClient = window.supabase?.createClient;
    if (originalCreateClient) {
      window.supabase.createClient = (...args) => {
        const client = originalCreateClient.apply(window.supabase, args);
        
        // Interceptar métodos que pueden fallar
        const methods = ['select', 'insert', 'update', 'delete'];
        
        methods.forEach(method => {
          const originalMethod = client.from;
          client.from = function(table) {
            const query = originalMethod.call(this, table);
            
            if (query[method]) {
              const originalQueryMethod = query[method];
              query[method] = function(...queryArgs) {
                return originalQueryMethod.apply(this, queryArgs)
                  .catch(error => {
                    ErrorTracker.trackError('supabase', {
                      method,
                      table,
                      error: error.message,
                      code: error.code,
                      details: error.details,
                      hint: error.hint,
                      userAgent: navigator.userAgent,
                      url: window.location.href
                    });
                    throw error;
                  });
              };
            }
            
            return query;
          };
        });
        
        return client;
      };
    }
  }
  
  static trackError(type, data) {
    const error = {
      id: this.generateErrorId(),
      type,
      timestamp: new Date().toISOString(),
      data,
      severity: this.calculateSeverity(type, data),
      fingerprint: this.generateFingerprint(type, data)
    };
    
    // Agregar a la lista de errores
    this.errors.push(error);
    
    // Contar errores por tipo
    this.errorCounts[type] = (this.errorCounts[type] || 0) + 1;
    
    // Limitar número de errores
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // Log del error
    console.error(`🚨 Error ${type}:`, data);
    
    // Enviar alerta si es crítico
    if (error.severity === 'critical') {
      this.sendCriticalAlert(error);
    }
    
    // Guardar en localStorage
    this.saveError(error);
    
    return error;
  }
  
  static generateErrorId() {
    return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  static calculateSeverity(type, data) {
    // Determinar severidad basada en tipo y datos
    if (type === 'javascript' && data.message?.includes('Cannot read property')) {
      return 'high';
    }
    
    if (type === 'supabase' && data.code === 'PGRST301') {
      return 'critical';
    }
    
    if (type === 'resource' && data.type === 'IMG') {
      return 'low';
    }
    
    if (type === 'promise') {
      return 'medium';
    }
    
    return 'medium';
  }
  
  static generateFingerprint(type, data) {
    // Generar huella digital para agrupar errores similares
    const key = `${type}_${data.message || data.reason || 'unknown'}`;
    return btoa(key).substr(0, 16);
  }
  
  static sendCriticalAlert(error) {
    console.warn('🚨 ALERTA CRÍTICA:', error);
    
    // Enviar a servicio de monitoreo
    if (window.MONITORING_CONFIG?.webhookUrl) {
      fetch(window.MONITORING_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'critical_error',
          error,
          timestamp: new Date().toISOString()
        })
      }).catch(err => {
        console.error('Error enviando alerta crítica:', err);
      });
    }
  }
  
  static saveError(error) {
    try {
      const errors = JSON.parse(localStorage.getItem('tracked_errors') || '[]');
      errors.push(error);
      
      // Mantener solo los últimos 50 errores
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('tracked_errors', JSON.stringify(errors));
    } catch (err) {
      console.error('Error guardando error:', err);
    }
  }
  
  static getErrors() {
    return [...this.errors];
  }
  
  static getErrorCounts() {
    return { ...this.errorCounts };
  }
  
  static getErrorSummary() {
    const summary = {
      total: this.errors.length,
      byType: { ...this.errorCounts },
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      recent: this.errors.slice(-10)
    };
    
    // Contar por severidad
    this.errors.forEach(error => {
      summary.bySeverity[error.severity]++;
    });
    
    return summary;
  }
  
  static clearErrors() {
    this.errors = [];
    this.errorCounts = {};
    localStorage.removeItem('tracked_errors');
  }
  
  static exportErrors() {
    const errors = JSON.parse(localStorage.getItem('tracked_errors') || '[]');
    const blob = new Blob([JSON.stringify(errors, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `errors_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}

// Inicializar tracking de errores solo en el navegador
if (typeof window !== 'undefined') {
  window.errorTracker = new ErrorTracker();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorTracker;
}
