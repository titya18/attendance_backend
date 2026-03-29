FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN chmod +x ./node_modules/.bin/prisma && npx prisma generate

COPY . .
RUN chmod +x ./node_modules/.bin/tsc \
 && chmod +x ./node_modules/typescript/bin/tsc \
 && npm run build

FROM node:20-bullseye

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN chmod +x ./node_modules/.bin/prisma && npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public


CMD ["node", "dist/server.js"]