import helmet from 'helmet';

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: ["'self'", (request, response) => `'nonce-${response.locals.cspNonce}'`],
    },
  },
};

export const securityHeaders = helmet(helmetOptions);
export const swaggerSecurityHeaders = helmet({ contentSecurityPolicy: false });
