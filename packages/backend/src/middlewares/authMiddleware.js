export function createAuthMiddleware({ tokenVerifier, jwtSecret }) {
  if (!tokenVerifier || !jwtSecret) {
    throw new Error('As dependencias de autenticacao sao obrigatorias.');
  }

  return function authenticate(request, response, next) {
    const authorization = request.headers.authorization;
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      return next(Object.assign(new Error('Token de autenticacao obrigatorio.'), {
        statusCode: 401,
      }));
    }

    try {
      const payload = tokenVerifier.verify(token, jwtSecret);
      if (!payload.id || !payload.role) {
        throw new Error('Token invalido.');
      }

      request.user = { id: payload.id, role: payload.role };
      return next();
    } catch {
      return next(Object.assign(new Error('Token invalido ou expirado.'), {
        statusCode: 401,
      }));
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
