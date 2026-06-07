FROM nginx:alpine

# Copy website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY admin.html /usr/share/nginx/html/
COPY event.html /usr/share/nginx/html/
COPY membership.html /usr/share/nginx/html/
COPY welcome.html /usr/share/nginx/html/
COPY community.html /usr/share/nginx/html/
COPY bulletin.html /usr/share/nginx/html/
COPY contact.html /usr/share/nginx/html/
COPY sponsorship.html /usr/share/nginx/html/
COPY hackathon.html /usr/share/nginx/html/
COPY about.html /usr/share/nginx/html/
COPY partner-companies.html /usr/share/nginx/html/
COPY partner-community.html /usr/share/nginx/html/
COPY partner-educators.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/

# Ensure proper permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
