import { describe, expect, jest, test } from '@jest/globals';
import { createAuthMiddleware } from '../middlewares/authMiddleware.js';

describe('middleware de autenticacao', () => {
  test('usa o papel atual do banco para refletir alteracoes administrativas', async () => {
    const authenticate = createAuthMiddleware({
      tokenVerifier: { verify: jest.fn(() => ({ id: 7, role: 'ADMIN' })) },
      jwtSecret: 'segredo-de-teste',
      userRepository: { findById: jest.fn().mockResolvedValue({ id: 7, role: 'LICITANTE' }) },
    });
    const request = { headers: { authorization: 'Bearer token' } };
    const next = jest.fn();

    await authenticate(request, {}, next);

    expect(request.user).toEqual({ id: 7, role: 'LICITANTE' });
    expect(next).toHaveBeenCalledWith();
  });

  test('rejeita token cuja conta nao existe mais', async () => {
    const authenticate = createAuthMiddleware({
      tokenVerifier: { verify: jest.fn(() => ({ id: 7 })) },
      jwtSecret: 'segredo-de-teste',
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
    });
    const next = jest.fn();

    await authenticate({ headers: { authorization: 'Bearer token' } }, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
