# Pilates Kfarkna - Full Stack Application

This repository contains both the frontend and backend components of the Pilates Kfarkna application. The project uses Expo for the frontend and Node.js with MySQL for the backend, both containerized using Docker.

## Project Structure

```
.
├── client/                 # Frontend application (Expo)
│   ├── web-build/         # Generated web build
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── README.md
│
├── server/                 # Backend application (Node.js)
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── README.md
│
└── README.md              # This file
```

## Quick Start

1. Clone the repository:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Set up both frontend and backend environments:
```bash
# Frontend (.env)
cd client/
cp .env.example .env

# Backend (.env)
cd ../server/
cp .env.example .env
```

3. Configure environment variables according to your needs:

### Frontend Environment Variables
```plaintext
EXPO_PUBLIC_API_URL=https://pilates-kfarkna.com/api
EXPO_PUBLIC_WEBSOCKET_URL=wss://pilates-kfarkna.com
```

### Backend Environment Variables
| Variable Name | Description |
|---|---|
| `PORT` | Server port number |
| `NODE_ENV` | Environment mode |
| `ALLOWED_ORIGINS` | CORS allowed origins |
| `DB_HOST` | Database host |
| `DB_USER` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `MYSQL_DATABASE` | MySQL database name |
| `MYSQL_USER` | MySQL user |
| `MYSQL_PASSWORD` | MySQL password |
| `PASSWORD_HASHING_SEED` | Password hashing seed |
| `ACCESS_TOKEN_SECRET` | JWT access token secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret |
| `TOKEN_EXPIRATION` | Access token expiration |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token expiration |
| `DB_BACKUP_FILE` | Database backup file path |

## Development Setup

### Frontend Development
1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

### Backend Development
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Production Deployment

### Frontend Deployment
1. Generate the web build:
```bash
cd client
npx expo export:web
```

2. Transfer files to your server:
```bash
scp -r web-build/ user@your-server:~/app/client/
scp docker-compose.yml user@your-server:~/app/client/
scp Dockerfile user@your-server:~/app/client/
scp nginx.conf user@your-server:~/app/client/
```

3. Start the frontend container:
```bash
docker compose up -d
```

### Backend Deployment
1. Transfer server files to your deployment machine:
```bash
scp -r server/ user@your-server:~/app/
```

2. Start the backend containers:
```bash
cd server
docker compose up -d
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use strong, unique passwords and secrets
   - Regularly rotate sensitive credentials

2. **Database**
   - Configure regular automated backups
   - Implement proper access controls
   - Monitor database performance and health

3. **API Security**
   - Implement rate limiting
   - Use HTTPS for all communications
   - Validate all user inputs
   - Keep dependencies updated

## Monitoring and Maintenance

### Docker Commands
```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Update and rebuild
docker compose down
docker compose up -d --build

# View container status
docker compose ps
```

### Health Checks
- Monitor container health status
- Set up alerts for service disruptions
- Regularly check system logs

## Backup and Recovery

1. **Database Backups**
   - Configure automated daily backups
   - Test backup restoration regularly
   - Store backups in secure, off-site location

2. **Application State**
   - Document all configuration changes
   - Maintain deployment scripts
   - Keep recovery procedures updated

## Support and Documentation

- Client Documentation: See `client/README.md`
- Server Documentation: See `server/README.md`
- For issues or support: Contact the development team
