import { describe, expect, test } from '@jest/globals';
import { helmetOptions } from '../config/securityHeaders.js';

describe('politica de seguranca de conteudo', () => {
  test('permite imagens locais, incorporadas e HTTPS', () => {
    expect(helmetOptions.contentSecurityPolicy.directives.imgSrc).toEqual(["'self'", 'data:', 'https:']);
  });

  test('usa nonce para liberar o CSS inline sem unsafe-inline', () => {
    const styleSource = helmetOptions.contentSecurityPolicy.directives.styleSrc[1]({}, { locals: { cspNonce: 'nonce-teste' } });
    expect(styleSource).toBe("'nonce-nonce-teste'");
  });
});
