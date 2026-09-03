FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

RUN addgroup -S nest && adduser -S nest -G nest
COPY --from=builder --chown=nest:nest /app/dist ./dist

EXPOSE 3000
USER nest

CMD ["node", "dist/main"]
