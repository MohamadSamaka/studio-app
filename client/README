# Pilates Kfarkna Frontend

This repository contains the frontend web application for Pilates Kfarkna, built with Expo.

## Environment Setup

1. Create a `.env` file in the root directory based on `.env.example`:

```plaintext
EXPO_PUBLIC_API_URL=https://pilates-kfarkna.com/api
EXPO_PUBLIC_WEBSOCKET_URL=wss://pilates-kfarkna.com
```

## Building for Production

To build the web version of the application:

1. Install dependencies:
```bash
npm install
```

2. Generate the web build:
```bash
npx expo export:web
```

This will create a `web-build` directory containing the static files for deployment.

## Docker Deployment

The application uses Docker for containerization and Nginx as the web server.

### Prerequisites
- Docker
- Docker Compose
- Access to your deployment server (e.g., DigitalOcean)

### Project Structure
```
.
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── web-build/         # Generated after running expo export:web
```

### Deployment Steps

1. Generate the web build locally:
```bash
npx expo export:web
```

2. Transfer the files to your server:
```bash
scp -r web-build/ user@your-server:~/app/
scp docker-compose.yml user@your-server:~/app/
scp Dockerfile user@your-server:~/app/
scp nginx.conf user@your-server:~/app/
```

3. SSH into your server and navigate to the app directory:
```bash
ssh user@your-server
cd ~/app
```

4. Start the Docker container:
```bash
docker compose up -d
```

The application will be available on port 8080 of your server.

### Docker Configuration

The application uses the following Docker configuration:

- Base image: `nginx:alpine`
- Container port: 80
- Host port mapping: 8080:80
- Mounted volumes:
  - `web-build` -> `/usr/share/nginx/html`
  - `nginx.conf` -> `/etc/nginx/nginx.conf`

### Maintenance

To update the application:

1. Generate a new web build locally
2. Transfer the new `web-build` to the server
3. Rebuild and restart the container:
```bash
docker compose down
docker compose up -d --build
```

To view logs:
```bash
docker compose logs -f
```

## Support

For any issues or questions, please contact the development team.