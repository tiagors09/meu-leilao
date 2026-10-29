import helmet from 'helmet';

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
};

export const securityHeaders = helmet(helmetOptions);
export const swaggerSecurityHeaders = helmet({ contentSecurityPolicy: false });
