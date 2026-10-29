export function createAuthMiddleware({ tokenVerifier, jwtSecret, userRepository }) {
  if (!tokenVerifier || !jwtSecret || !userRepository) {
    throw new Error('As dependencias de autenticacao sao obrigatorias.');
  }

  return async function authenticate(request, response, next) {
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return next(Object.assign(new Error('Token de autenticacao obrigatorio.'), {
        statusCode: 401,
      }));
    }

    let payload;
    try {
      payload = tokenVerifier.verify(token, jwtSecret);
    } catch {
      return next(Object.assign(new Error('Token invalido ou expirado.'), {
        statusCode: 401,
      }));
    }

    if (!payload.id) {
      return next(Object.assign(new Error('Token invalido ou expirado.'), { statusCode: 401 }));
    }

    try {
      const user = await userRepository.findById(payload.id);
      if (!user) {
        return next(Object.assign(new Error('Token invalido ou expirado.'), { statusCode: 401 }));
      }
      request.user = { id: user.id, role: user.role };
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function createRoleMiddleware(allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('Informe ao menos um perfil permitido.');
  }

  return function authorizeRole(request, response, next) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return next(Object.assign(new Error('Voce nao tem permissao para esta operacao.'), {
        statusCode: 403,
      }));
    }

    return next();
  };
}
