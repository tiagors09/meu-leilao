import { describe, expect, test } from '@jest/globals';
import { helmetOptions } from '../config/securityHeaders.js';

describe('politica de seguranca de conteudo', () => {
  test('permite imagens locais, incorporadas e HTTPS', () => {
    expect(helmetOptions.contentSecurityPolicy.directives.imgSrc).toEqual(["'self'", 'data:', 'https:']);
  });
});
