/**
 * src/setup-jest.ts
 * Se ejecuta una vez antes de todas las pruebas.
 * Inicializa jest-preset-angular con los polyfills necesarios para Angular.
 */
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();