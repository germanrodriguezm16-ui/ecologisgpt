// Setup para tests de Ecologist-GPT
// Configuración global de Jest

// Mock de window.APP_CONFIG
global.window = {
  APP_CONFIG: {
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-key',
    SENTRY_DSN: 'test-sentry-dsn'
  },
  location: {
    hash: '#socios'
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

// Mock de document
global.document = {
  readyState: 'complete',
  addEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    innerHTML: '',
    textContent: '',
    value: ''
  })),
  getElementById: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    style: {}
  }
};

// Mock de console para tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock de Supabase
global.window.supabase = {
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
};

// Mock de performance
global.performance = {
  now: jest.fn(() => 1000),
  memory: {
    usedJSHeapSize: 10 * 1024 * 1024,
    totalJSHeapSize: 20 * 1024 * 1024,
    jsHeapSizeLimit: 50 * 1024 * 1024
  }
};

// Mock de localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Helper para crear elementos DOM mock
global.createMockElement = (tagName = 'div', attributes = {}) => ({
  tagName: tagName.toUpperCase(),
  id: attributes.id || '',
  className: attributes.class || '',
  style: {},
  innerHTML: '',
  textContent: '',
  value: '',
  dataset: {},
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  click: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => [])
});

// Helper para mock de eventos
global.createMockEvent = (type, options = {}) => ({
  type,
  target: options.target || createMockElement(),
  currentTarget: options.currentTarget || createMockElement(),
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options
});

// Timeout para tests async
jest.setTimeout(10000);
