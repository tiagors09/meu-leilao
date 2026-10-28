FROM node:20-alpine
WORKDIR /app

# Copia os arquivos de workspace da raiz e o package do backend
COPY package.json package-lock.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Instala todas as dependências do monorepo a partir da raiz
RUN npm install

# Copia o código fonte do backend e do shared
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

WORKDIR /app/packages/backend

EXPOSE 3000
CMD ["npm", "run", "dev"]