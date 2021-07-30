Valutare la config seguente per renderla default



location /socket.io/ {
                proxy_pass http://localhost:3002/socket.io/;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;

                # dont cache anything
                proxy_cache off;

                #websocket
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_cache_bypass $http_upgrade;

        }
        location / {
                proxy_pass http://localhost:8080/;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;

                # dont cache anything
                proxy_cache off;
        }