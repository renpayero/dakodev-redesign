# Static Nginx server for the landing page
FROM nginx:alpine

# Cambiamos el puerto de escucha de 80 a 3060 internamente
RUN sed -i 's/listen\(.*\)80;/listen 3060;/g' /etc/nginx/conf.d/default.conf

# Copy static files
COPY index.html /usr/share/nginx/html/index.html

EXPOSE 3060

CMD ["nginx", "-g", "daemon off;"]
