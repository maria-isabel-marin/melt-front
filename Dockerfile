FROM nginx:alpine

# Copia tu carpeta public/ en la carpeta de contenido web de Nginx
COPY public/ /usr/share/nginx/html

# Mantén la configuración por defecto de Nginx (no borramos nada)
# El contenedor nginx:alpine ya expone el puerto 80 y tiene el CMD correcto.

# (opcional) si quieres ver logs limpios:
# RUN rm -rf /var/cache/apk/*

# El CMD por defecto de la imagen nginx:alpine es:
# CMD ["nginx", "-g", "daemon off;"]

