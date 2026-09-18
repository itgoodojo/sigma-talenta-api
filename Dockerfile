# ---- Build stage ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# tini reaps zombies and forwards SIGTERM so Dokploy restarts/redeploys are clean.
RUN apk add --no-cache tini

COPY package*.json ./
# Production deps + sequelize-cli, which entry.sh needs to run migrations at startup.
RUN npm ci --omit=dev && npm install --no-save sequelize-cli@^6.6.2 && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY config ./config
COPY migrations ./migrations
COPY seeders ./seeders
COPY .sequelizerc ./
COPY entry.sh ./entry.sh

# CRLF from a Windows checkout would make the shebang unusable; strip it, then mark executable.
RUN sed -i 's/\r$//' ./entry.sh && chmod +x ./entry.sh

# Local-disk uploads fallback; owned by the unprivileged runtime user.
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--", "./entry.sh"]
