# Build stage (Not needed for pure static but good to have if they add build steps later)
FROM nginx:alpine

# Copy static files
COPY index.html /usr/share/nginx/html/index.html
# If there were other assets like images or JS files in folders, we would copy them here
# COPY src /usr/share/nginx/html/src

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
