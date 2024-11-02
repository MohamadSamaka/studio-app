# Use the official Nginx image as the base
FROM nginx:alpine

# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output to Nginx's html directory
COPY web-build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 8081

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
