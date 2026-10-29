import { describe, expect, jest, test } from '@jest/globals';
import { UserService } from '../services/UserService.js';

describe('UserService', () => {
  test('sempre registra licitante mesmo se o payload tentar escolher papel elevado', async () => {
    const userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({ id: 8, name: 'Admin Falso', email: 'novo@example.com', role: 'LICITANTE' }),
    };
    const service = new UserService({
      userRepository,
      passwordHasher: { hash: jest.fn().mockResolvedValue('hash') },
      tokenSigner: { sign: jest.fn().mockReturnValue('token') },
      jwtSecret: 'segredo-de-teste',
    });

    const result = await service.register({
      name: 'Admin Falso', email: 'novo@example.com', password: 'senha1234', role: 'ADMIN',
    });

    expect(userRepository.createUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'LICITANTE' }));
    expect(result.user.role).toBe('LICITANTE');
  });
});
