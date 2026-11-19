# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /web
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# nginx sin privilegios: corre como el usuario "nginx" (uid 101) en el puerto 8080.
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=build /web/dist /usr/share/nginx/html
# El entrypoint oficial renderiza /etc/nginx/templates/*.template con envsubst,
# sustituyendo solo variables de entorno definidas (BACKEND_URL); $uri se conserva.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
USER nginx
EXPOSE 8080
