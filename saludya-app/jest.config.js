/** @type {import('jest').Config} */
export default {
  // Preset oficial de Angular para Jest
  preset: 'jest-preset-angular',

  // Archivo de setup — se ejecuta antes de cada suite
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],

  // Variables de entorno para tests
  testEnvironment: 'jsdom',

  // Alias de módulos — mapea rutas del tsconfig
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@environments/(.*)': '<rootDir>/src/environments/$1',
  },

  // Extensiones que Jest debe procesar
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],

  // Patrón de archivos de prueba
  testMatch: ['**/*.spec.ts'],

  // Cobertura de código
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts',
    '!src/app/app.config.ts',
  ],

  // Umbrales mínimos de cobertura (ajusta según necesidad)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Carpeta de reporte de cobertura
  coverageDirectory: 'coverage',

  // Ignorar carpetas innecesarias
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Transformaciones — jest-preset-angular maneja .ts y .html
  transform: {
    '^.+\\.(ts|js|mjs|cjs)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
      },
    ],
  },

  // Tiempo máximo de ejecución por test
  testTimeout: 60000,

  // Limitar el número de workers para evitar problemas de recursos
  maxWorkers: '50%',
};
