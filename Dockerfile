FROM nginx:alpine

# Copy website files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY admin.html /usr/share/nginx/html/
COPY membership.html /usr/share/nginx/html/
COPY welcome.html /usr/share/nginx/html/
COPY community.html /usr/share/nginx/html/
COPY bulletin.html /usr/share/nginx/html/
COPY contact.html /usr/share/nginx/html/
COPY sponsorship.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/

# Ensure proper permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chmod -R 644 /usr/share/nginx/html/* && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

# Create custom nginx config that includes mime types and server config
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://tzitghqmrmsxddysxhvc.supabase.co https://cbgevvuvleuwjjmefjza.supabase.co; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com data: blob:; img-src 'self' https://images.unsplash.com https: data: blob:; media-src 'self' https: blob: data:; connect-src 'self' https: https://tzitghqmrmsxddysxhvc.supabase.co https://cbgevvuvleuwjjmefjza.supabase.co; object-src 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|jpg|jpeg|png|gif|ico|svg|webp|heic|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri /index.html;
    }
}
EOF

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
