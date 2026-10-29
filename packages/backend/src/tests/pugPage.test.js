import { describe, expect, test } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import pug from 'pug';

const templatePath = fileURLToPath(new URL('../../views/index.pug', import.meta.url));

describe('pagina inicial do backend', () => {
  test('renderiza status, versao, timestamp e link Swagger com CSS nonce', () => {
    const html = pug.renderFile(templatePath, {
      status: 'Online',
      apiName: 'Verzel Leilao API',
      version: '1.2.3',
      timestamp: '2026-10-29T12:00:00.000Z',
      docsUrl: '/api-docs/',
      cspNonce: 'nonce-seguro',
    });

    expect(html).toContain('API Online');
    expect(html).toContain('Verzel Leilao API');
    expect(html).toContain('1.2.3');
    expect(html).toContain('2026-10-29T12:00:00.000Z');
    expect(html).toContain('href="/api-docs/"');
    expect(html).toContain('nonce="nonce-seguro"');
  });
});
