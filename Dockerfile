# Fase 1: Build con límite de memoria explícito
FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN node --max-old-space-size=4096 ./node_modules/@angular/cli/bin/ng build --configuration production

# Fase 2: Servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist/ai-melt-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]