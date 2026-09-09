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
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY config ./config
COPY migrations ./migrations
COPY seeders ./seeders
COPY .sequelizerc ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
