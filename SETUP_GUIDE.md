# 🚀 Happy Drives - Complete Setup Guide

This guide covers everything you need to run Happy Drives locally or deploy it to a server.

---

## 📋 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 10 GB free space
- **OS**: Windows 10/11, macOS 10.15+, Ubuntu 20.04+, or any Linux distribution

### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8 GB+
- **Storage**: 20 GB+ SSD
- **OS**: Ubuntu 22.04 LTS (recommended for servers)

---

## 🔧 Required Software & Versions

### 1. **Python** (Backend)
- **Version Required**: Python 3.9, 3.10, or 3.11 (Recommended: 3.10)
- **Check Version**: `python --version` or `python3 --version`

**Installation:**

**Windows:**
```bash
# Download from https://www.python.org/downloads/
# Make sure to check "Add Python to PATH" during installation
```

**macOS:**
```bash
# Using Homebrew
brew install python@3.10
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip
```

---

### 2. **Node.js & npm** (Frontend)
- **Version Required**: Node.js 16.x or higher (Recommended: 18.x or 20.x LTS)
- **npm Version**: 8.x or higher (comes with Node.js)
- **Check Version**: `node --version` and `npm --version`

**Installation:**

**Windows:**
```bash
# Download installer from https://nodejs.org/
# Install LTS version
```

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### 3. **Yarn** (Package Manager)
- **Version Required**: 1.22.x
- **Check Version**: `yarn --version`

**Installation (All Platforms):**
```bash
npm install -g yarn
```

---

### 4. **MongoDB** (Database)
- **Version Required**: 5.0 or higher (Recommended: 6.0+)
- **Check Version**: `mongod --version`

**Installation:**

**Windows:**
```bash
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community
# Install as a Service
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify MongoDB is Running:**
```bash
# Check status
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Connect to MongoDB shell
mongosh
```

---

### 5. **Git** (Version Control)
- **Version Required**: 2.x or higher
- **Check Version**: `git --version`

**Installation:**

**Windows:**
```bash
# Download from https://git-scm.com/download/win
```

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

---

## 📦 Quick Installation Summary

### For Windows Users:
```bash
# 1. Install Python 3.10 from python.org
# 2. Install Node.js 20.x LTS from nodejs.org
# 3. Install MongoDB Community from mongodb.com
# 4. Install Git from git-scm.com

# Verify installations
python --version
node --version
npm --version
mongod --version
git --version

# Install Yarn globally
npm install -g yarn
```

### For macOS Users:
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install all requirements
brew install python@3.10 node git
brew tap mongodb/brew
brew install mongodb-community@6.0

# Install Yarn
npm install -g yarn

# Start MongoDB
brew services start mongodb-community@6.0
```

### For Linux (Ubuntu/Debian) Users:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10
sudo apt install python3.10 python3.10-venv python3-pip -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Yarn
npm install -g yarn

# Install MongoDB 6.0 (see detailed steps above)

# Install Git
sudo apt-get install git -y

# Verify installations
python3 --version
node --version
yarn --version
mongod --version
git --version
```

---

## 🎯 Step-by-Step Local Setup

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/yourusername/happy-drives.git
cd happy-drives
```

### Step 2: Set Up MongoDB

**Create Database:**
```bash
# Connect to MongoDB shell
mongosh

# Create database and collections
use happy_drives

# Create collections (optional - will be auto-created)
db.createCollection("users")
db.createCollection("cars")
db.createCollection("bookings")
db.createCollection("packages")
exit
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env  # or create manually
```

**Edit `backend/.env`:**
```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=happy_drives

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Razorpay (Optional - for payment integration)
# Get from https://dashboard.razorpay.com/
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Environment
ENVIRONMENT=development
```

**Test Backend:**
```bash
# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Server should start at http://localhost:8001
# API docs at http://localhost:8001/docs
```

### Step 4: Frontend Setup

**Open a new terminal:**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env  # or create manually
```

**Edit `frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Start Frontend:**
```bash
# Run development server
yarn start

# Frontend should open at http://localhost:3000
```

### Step 5: Verify Everything is Working

Open your browser and visit:
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8001/docs
- **Backend Health Check**: http://localhost:8001/api/

---

## 🌐 Server Deployment (Production)

### Option 1: Deploy on Ubuntu VPS (DigitalOcean, AWS EC2, Linode, etc.)

#### 1. **Server Requirements:**
- Ubuntu 22.04 LTS
- 2+ CPU cores
- 4+ GB RAM
- 20+ GB SSD storage
- Public IP address
- Domain name (optional but recommended)

#### 2. **Initial Server Setup:**

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Create a new user (recommended)
adduser happydrives
usermod -aG sudo happydrives
su - happydrives

# Install required software
sudo apt install python3.10 python3.10-venv python3-pip nodejs npm git nginx -y

# Install Yarn
sudo npm install -g yarn

# Install MongoDB (see MongoDB installation section above)

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2
```

#### 3. **Clone and Setup Project:**

```bash
# Clone repository
cd /home/happydrives
git clone https://github.com/yourusername/happy-drives.git
cd happy-drives

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create production .env
nano .env
# Add production environment variables
```

#### 4. **Build Frontend for Production:**

```bash
cd ../frontend
yarn install
yarn build

# This creates an optimized build in frontend/build/
```

#### 5. **Configure Nginx as Reverse Proxy:**

```bash
sudo nano /etc/nginx/sites-available/happydrives
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend - Serve React build
    location / {
        root /home/happydrives/happy-drives/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/happydrives /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

#### 6. **Set Up SSL with Let's Encrypt (Free):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

#### 7. **Run Backend with PM2:**

```bash
cd /home/happydrives/happy-drives/backend

# Activate virtual environment
source venv/bin/activate

# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add this configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'happydrives-backend',
    script: 'venv/bin/uvicorn',
    args: 'server:app --host 0.0.0.0 --port 8001',
    cwd: '/home/happydrives/happy-drives/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

**Start the application:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start on server reboot
```

#### 8. **Configure Firewall:**

```bash
# Allow necessary ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

### Option 2: Deploy Using Docker (Advanced)

#### 1. **Install Docker:**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y
```

#### 2. **Create Dockerfile for Backend:**

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### 3. **Create Dockerfile for Frontend:**

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4. **Create docker-compose.yml:**

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: happydrives-mongo
    restart: always
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: happydrives-backend
    restart: always
    ports:
      - "8001:8001"
    depends_on:
      - mongodb
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=happy_drives

  frontend:
    build: ./frontend
    container_name: happydrives-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

#### 5. **Deploy with Docker:**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔍 Troubleshooting Common Issues

### Issue 1: MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Issue 2: Port Already in Use
```bash
# Find process using port 3000 (frontend)
# Windows:
netstat -ano | findstr :3000
# macOS/Linux:
lsof -i :3000

# Kill the process
# Windows:
taskkill /PID <process_id> /F
# macOS/Linux:
kill -9 <process_id>
```

### Issue 3: Python Module Not Found
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows

# Reinstall requirements
pip install -r requirements.txt
```

### Issue 4: Yarn Install Fails
```bash
# Clear cache
yarn cache clean

# Remove node_modules and reinstall
rm -rf node_modules
yarn install
```

### Issue 5: CORS Errors
Make sure your backend `.env` has:
```env
CORS_ORIGINS=http://localhost:3000
```

---

## 📊 Performance Optimization

### For Production:

1. **Enable MongoDB Indexing:**
```javascript
// In MongoDB shell
use happy_drives
db.cars.createIndex({ "category": 1 })
db.bookings.createIndex({ "user_id": 1 })
db.bookings.createIndex({ "created_at": -1 })
```

2. **Configure Nginx Caching:**
```nginx
# Add to nginx config
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Use Environment Variables for Production:**
```env
ENVIRONMENT=production
DEBUG=False
```

---

## 📝 Maintenance Commands

```bash
# Update code from Git
git pull origin main

# Update backend dependencies
cd backend
pip install -r requirements.txt --upgrade

# Update frontend dependencies
cd frontend
yarn upgrade

# Restart services
pm2 restart all  # If using PM2
sudo systemctl restart nginx  # Restart Nginx
```

---

## 🆘 Need Help?

- **Documentation**: Check `/memory/PRD.md` for project details
- **API Docs**: Visit `http://localhost:8001/docs` when running
- **GitHub Issues**: Open an issue on the repository
- **Email**: dev@happydrives.com

---

**Ready to get started? Follow the setup guide above and you'll be running Happy Drives in no time! 🚗💨**
