// Sistema de monitoreo de performance para Ecologist-GPT
// Detecta problemas de rendimiento y envía alertas

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: 0,
      memoryUsage: 0,
      errorCount: 0,
      apiCalls: 0,
      domManipulations: 0
    };
    
    this.thresholds = {
      maxPageLoadTime: 3000, // 3 segundos
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      maxErrors: 5,
      maxApiCalls: 100,
      maxDomManipulations: 50
    };
    
    this.alerts = [];
    this.startTime = performance.now();
    
    this.init();
  }
  
  init() {
    console.log('🔍 Iniciando monitoreo de performance...');
    
    // Monitorear carga de página
    this.trackPageLoad();
    
    // Monitorear uso de memoria
    this.trackMemoryUsage();
    
    // Monitorear errores
    this.trackErrors();
    
    // Monitorear llamadas a API
    this.trackApiCalls();
    
    // Monitorear manipulaciones DOM
    this.trackDomManipulations();
    
    // Reporte periódico
    this.startPeriodicReporting();
  }
  
  trackPageLoad() {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.metrics.pageLoad = loadTime;
      
      console.log(`📊 Tiempo de carga: ${loadTime.toFixed(2)}ms`);
      
      if (loadTime > this.thresholds.maxPageLoadTime) {
        this.sendAlert('Slow page load detected', {
          loadTime,
          threshold: this.thresholds.maxPageLoadTime
        });
      }
    });
  }
  
  trackMemoryUsage() {
    setInterval(() => {
      if (performance.memory) {
        const memory = performance.memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize;
        
        if (memory.usedJSHeapSize > this.thresholds.maxMemoryUsage) {
          this.sendAlert('High memory usage detected', {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            threshold: this.thresholds.maxMemoryUsage
          });
        }
      }
    }, 30000); // Cada 30 segundos
  }
  
  trackErrors() {
    // Errores JavaScript
    window.addEventListener('error', (error) => {
      this.metrics.errorCount++;
      
      this.sendAlert('JavaScript error detected', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        stack: error.error?.stack
      });
    });
    
    // Errores de recursos
    window.addEventListener('error', (error) => {
      if (error.target !== window) {
        this.sendAlert('Resource loading error', {
          type: error.target.tagName,
          src: error.target.src || error.target.href,
          message: error.message
        });
      }
    }, true);
    
    // Promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errorCount++;
      
      this.sendAlert('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }
  
  trackApiCalls() {
    // Interceptar llamadas a Supabase
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      this.metrics.apiCalls++;
      
      const startTime = performance.now();
      
      return originalFetch(...args)
        .then(response => {
          const duration = performance.now() - startTime;
          
          if (duration > 5000) { // 5 segundos
            this.sendAlert('Slow API call detected', {
              url: args[0],
              duration,
              status: response.status
            });
          }
          
          return response;
        })
        .catch(error => {
          this.sendAlert('API call failed', {
            url: args[0],
            error: error.message
          });
          throw error;
        });
    };
  }
  
  trackDomManipulations() {
    // Interceptar manipulaciones DOM comunes
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    
    document.querySelector = (...args) => {
      this.metrics.domManipulations++;
      return originalQuerySelector.apply(document, args);
    };
    
    document.querySelectorAll = (...args) => {
      this.metrics.domManipulations++;
      return originalQuerySelectorAll.apply(document, args);
    };
    
    // Monitorear innerHTML
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        this.metrics.domManipulations++;
        originalInnerHTML.set.call(this, value);
      },
      get: originalInnerHTML.get
    });
  }
  
  sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data,
      metrics: { ...this.metrics }
    };
    
    this.alerts.push(alert);
    
    console.warn(`⚠️ ALERTA: ${type}`, data);
    
    // Enviar a servicio de monitoreo si está configurado
    if (window.MONITORING_CONFIG?.webhookUrl) {
      this.sendToWebhook(alert);
    }
    
    // Guardar en localStorage para debugging
    this.saveAlert(alert);
  }
  
  sendToWebhook(alert) {
    fetch(window.MONITORING_CONFIG.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(alert)
    }).catch(error => {
      console.error('Error enviando alerta:', error);
    });
  }
  
  saveAlert(alert) {
    try {
      const alerts = JSON.parse(localStorage.getItem('performance_alerts') || '[]');
      alerts.push(alert);
      
      // Mantener solo las últimas 50 alertas
      if (alerts.length > 50) {
        alerts.splice(0, alerts.length - 50);
      }
      
      localStorage.setItem('performance_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error guardando alerta:', error);
    }
  }
  
  startPeriodicReporting() {
    setInterval(() => {
      this.generateReport();
    }, 300000); // Cada 5 minutos
  }
  
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Últimas 10 alertas
      summary: this.generateSummary()
    };
    
    console.log('📊 Reporte de Performance:', report.summary);
    
    // Guardar reporte
    this.saveReport(report);
    
    return report;
  }
  
  generateSummary() {
    const summary = {
      status: 'good',
      issues: []
    };
    
    if (this.metrics.pageLoad > this.thresholds.maxPageLoadTime) {
      summary.issues.push('Page load time exceeds threshold');
      summary.status = 'warning';
    }
    
    if (this.metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      summary.issues.push('Memory usage exceeds threshold');
      summary.status = 'warning';
    }
    
    if (this.metrics.errorCount > this.thresholds.maxErrors) {
      summary.issues.push('High error count');
      summary.status = 'critical';
    }
    
    if (this.metrics.apiCalls > this.thresholds.maxApiCalls) {
      summary.issues.push('High API call count');
      summary.status = 'warning';
    }
    
    if (this.metrics.domManipulations > this.thresholds.maxDomManipulations) {
      summary.issues.push('High DOM manipulation count');
      summary.status = 'warning';
    }
    
    return summary;
  }
  
  saveReport(report) {
    try {
      const reports = JSON.parse(localStorage.getItem('performance_reports') || '[]');
      reports.push(report);
      
      // Mantener solo los últimos 20 reportes
      if (reports.length > 20) {
        reports.splice(0, reports.length - 20);
      }
      
      localStorage.setItem('performance_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error guardando reporte:', error);
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  getAlerts() {
    return [...this.alerts];
  }
  
  clearAlerts() {
    this.alerts = [];
    localStorage.removeItem('performance_alerts');
  }
}

// Inicializar monitoreo cuando el DOM esté listo (solo en navegador)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.performanceMonitor = new PerformanceMonitor();
    });
  } else {
    window.performanceMonitor = new PerformanceMonitor();
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
