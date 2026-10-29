import { describe, expect, test } from '@jest/globals';
import { swaggerSpec } from '../config/swagger.js';

describe('documentacao OpenAPI', () => {
  test('publica os endpoints exigidos e define autenticacao JWT', () => {
    const expectedPaths = [
      '/api/users/register', '/api/users/login', '/api/wallets/me', '/api/wallets/deposit',
      '/api/lots', '/api/lots/{id}', '/api/lots/{id}/bids', '/api/lots/{id}/audit', '/api/receipts/me',
      '/api/admin/overview', '/api/admin/users', '/api/admin/users/{id}/role', '/api/admin/lots', '/api/admin/transactions',
    ];

    for (const path of expectedPaths) expect(swaggerSpec.paths[path]).toBeDefined();
    expect(swaggerSpec.paths['/api/admin/lots'].post).toBeDefined();
    expect(swaggerSpec.paths['/api/admin/lots/{id}'].patch).toBeDefined();
    expect(swaggerSpec.paths['/api/admin/lots/{id}'].delete).toBeDefined();
    expect(swaggerSpec.paths['/api/admin/lots/{id}/open'].post).toBeDefined();
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toMatchObject({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });
    expect(swaggerSpec.paths['/api/lots/{id}/audit'].get.responses['200']).toBeDefined();
  });

});
