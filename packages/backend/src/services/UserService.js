export class UserService {
  constructor({ userRepository, passwordHasher, tokenSigner, jwtSecret }) {
    if (!userRepository || !passwordHasher || !tokenSigner || !jwtSecret) {
      throw new Error('As dependencias de autenticacao sao obrigatorias.');
    }

    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenSigner = tokenSigner;
    this.jwtSecret = jwtSecret;
  }

  async register({ name, email, password }) {
    if (typeof name !== 'string' || typeof email !== 'string') {
      throw this.createError('Nome e email sao obrigatorios.', 400);
    }

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      throw this.createError('Nome, email e senha sao obrigatorios.', 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw this.createError('Informe um email valido.', 400);
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw this.createError('A senha deve ter pelo menos 8 caracteres.', 400);
    }
    if (await this.userRepository.findByEmail(normalizedEmail)) {
      throw this.createError('Ja existe um usuario com este email.', 409);
    }

    const passwordHash = await this.passwordHasher.hash(password, 12);
    let user;
    try {
      user = await this.userRepository.createUser({
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        role: 'LICITANTE',
      });
    } catch (error) {
      if (error.code === '23505') {
        throw this.createError('Ja existe um usuario com este email.', 409);
      }
      throw error;
    }

    return { user: this.toPublicUser(user), token: this.createToken(user) };
  }

  async login({ email, password }) {
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      throw this.createError('Email e senha sao obrigatorios.', 400);
    }

    const user = await this.userRepository.findByEmail(email.trim().toLowerCase());
    const passwordMatches = user
      ? await this.passwordHasher.compare(password, user.password_hash)
      : false;

    if (!passwordMatches) {
      throw this.createError('Email ou senha invalidos.', 401);
    }

    return { user: this.toPublicUser(user), token: this.createToken(user) };
  }

  toPublicUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  createToken(user) {
    return this.tokenSigner.sign(
      { id: user.id, role: user.role },
      this.jwtSecret,
      { expiresIn: '1h' },
    );
  }

  createError(message, statusCode) {
    return Object.assign(new Error(message), { statusCode });
  }
}
