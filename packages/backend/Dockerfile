FROM node:22-alpine

WORKDIR /app

# O contexto de build deve ser a raiz do monorepo.
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci --omit=dev --workspace=backend --workspace=shared

COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

WORKDIR /app/packages/backend
EXPOSE 3000
CMD ["npm", "run", "start"]
