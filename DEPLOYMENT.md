# Adyapan LMS — Production Deployment Guide

---

## Option A: Free Tier (Vercel + Render + Atlas)

### 1. MongoDB Atlas
- Create free M0 cluster at mongodb.com/atlas
- Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/adyapan`

### 2. Backend → Render
- Root: `server/`
- Build: `npm install`
- Start: `node server.js`
- Env vars: MONGO_URI, JWT_SECRET, CLIENT_URL, EMAIL_USER, EMAIL_PASS

### 3. Frontend → Vercel
- Root: `client/`
- Build: `npm run build`
- Output: `dist/`
- Env: `VITE_API_URL=https://your-api.onrender.com/api`

---

## Option B: VPS (Ubuntu 22.04)

### Install dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx

# Install Node 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20

# Install PM2 (process manager)
npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod && sudo systemctl enable mongod
```

### Clone and configure
```bash
git clone https://github.com/yourusername/adyapan.git
cd adyapan

# Server
cd server
cp .env.example .env
nano .env   # Fill in all values

npm install
node seedAdmin.js
node seedCourses.js
node seedQuizzes.js

# Client
cd ../client
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production
npm install
npm run build
```

### Run backend with PM2
```bash
cd server
pm2 start server.js --name "adyapan-api"
pm2 startup
pm2 save
```

### Nginx config
```nginx
# /etc/nginx/sites-available/adyapan

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/adyapan/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /certificates {
        alias /var/www/adyapan/server/certificates;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/adyapan /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL (free Let's Encrypt)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Copy built files
```bash
sudo mkdir -p /var/www/adyapan
sudo cp -r . /var/www/adyapan/
sudo chown -R www-data:www-data /var/www/adyapan/client/dist
```

---

## Environment Variables (Production)

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/adyapan   # or Atlas URI
JWT_SECRET=<generate: openssl rand -hex 64>
CLIENT_URL=https://yourdomain.com
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Security Checklist

- [ ] Strong JWT_SECRET (64+ chars, random)
- [ ] MongoDB Atlas IP whitelist (not 0.0.0.0/0 in production)
- [ ] HTTPS enabled (Let's Encrypt / Vercel auto-SSL)
- [ ] Admin password changed after first login
- [ ] EMAIL_PASS is Gmail App Password (not main password)
- [ ] Rate limiting active (already in code)
- [ ] CORS restricted to CLIENT_URL (already in code)
- [ ] Helmet security headers (already in code)
- [ ] .env never committed to git

---

## Custom Domain

### Vercel (Frontend)
1. Project Settings → Domains → Add domain
2. Point your domain's DNS: CNAME `@` → `cname.vercel-dns.com`

### Render (Backend)
1. Service Settings → Custom Domains → Add domain
2. Point: CNAME `api` → your-api.onrender.com

Result:
- Frontend: `https://yourdomain.com`
- Backend:  `https://api.yourdomain.com`

---

## After Going Live

1. Change admin password immediately
2. Add real course content via `/admin/courses/add`
3. Configure Gmail App Password for certificate emails
4. Set up MongoDB Atlas automated backups (free tier: manual)
5. Monitor with PM2: `pm2 logs adyapan-api`
6. Set up uptime monitoring: UptimeRobot (free)

---

## Scaling (when you grow)

| Traffic | Action |
|---------|--------|
| 1K users | Render paid plan ($7/mo) — no cold starts |
| 5K users | DigitalOcean Droplet $12/mo + MongoDB Atlas M10 |
| 10K+ users | Add Redis caching, CDN for videos, S3 for file storage |
