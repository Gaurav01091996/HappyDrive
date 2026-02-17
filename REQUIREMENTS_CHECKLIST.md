# ✅ Happy Drives - Complete Requirements Checklist

Use this checklist to ensure you have everything needed to run Happy Drives locally or deploy to production.

---

## 📦 Software Requirements

### Essential Software (Required)

- [ ] **Python 3.9, 3.10, or 3.11** (Recommended: 3.10)
  - Windows: Download from [python.org](https://www.python.org/downloads/)
  - macOS: `brew install python@3.10`
  - Linux: `sudo apt install python3.10 python3-pip`
  - Verify: `python --version` or `python3 --version`

- [ ] **Node.js 16.x or higher** (Recommended: 18.x or 20.x LTS)
  - Windows/macOS: Download from [nodejs.org](https://nodejs.org/)
  - Linux: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install nodejs`
  - Verify: `node --version`

- [ ] **Yarn Package Manager** (1.22.x)
  - All platforms: `npm install -g yarn`
  - Verify: `yarn --version`

- [ ] **MongoDB 5.0+** (Recommended: 6.0)
  - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
  - macOS: `brew tap mongodb/brew && brew install mongodb-community@6.0`
  - Linux: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed steps
  - Verify: `mongod --version`

- [ ] **Git** (Latest version)
  - Windows: Download from [git-scm.com](https://git-scm.com/download/win)
  - macOS: `brew install git`
  - Linux: `sudo apt install git`
  - Verify: `git --version`

### Optional Software (For Production)

- [ ] **Nginx** (Web server & reverse proxy)
  - Linux: `sudo apt install nginx`
  - macOS: `brew install nginx`
  - Verify: `nginx -v`

- [ ] **PM2** (Process manager for Node.js/Python)
  - All platforms: `npm install -g pm2`
  - Verify: `pm2 --version`

- [ ] **Certbot** (For SSL certificates)
  - Linux: `sudo apt install certbot python3-certbot-nginx`
  - Verify: `certbot --version`

- [ ] **Docker & Docker Compose** (For containerized deployment)
  - Install: [docs.docker.com](https://docs.docker.com/get-docker/)
  - Verify: `docker --version && docker-compose --version`

---

## 🔧 Python Packages (Backend)

These are installed automatically with `pip install -r requirements.txt`:

- [ ] **FastAPI** (0.110.1) - Web framework
- [ ] **Uvicorn** (0.25.0) - ASGI server
- [ ] **Motor** (3.3.1) - Async MongoDB driver
- [ ] **Pydantic** (2.6.4) - Data validation
- [ ] **PyJWT** (2.10.1) - JWT authentication
- [ ] **Passlib** (1.7.4) - Password hashing
- [ ] **Python-dotenv** (1.0.1) - Environment variables
- [ ] **Requests** (2.31.0) - HTTP library
- [ ] **Python-multipart** (0.0.9) - File uploads

### Verify Backend Packages:
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pip list
```

---

## 📱 Node.js Packages (Frontend)

These are installed automatically with `yarn install`:

### Core Dependencies
- [ ] **React** (19.0.0) - UI framework
- [ ] **React Router DOM** (7.5.1) - Routing
- [ ] **Axios** (1.8.4) - HTTP client
- [ ] **Tailwind CSS** (3.4.17) - Styling
- [ ] **Lucide React** (0.507.0) - Icons

### UI Components (Shadcn)
- [ ] **@radix-ui/react-*** - UI primitives
- [ ] **class-variance-authority** - Style variants
- [ ] **clsx** & **tailwind-merge** - CSS utilities

### Form & Validation
- [ ] **React Hook Form** (7.56.2) - Form handling
- [ ] **Zod** (3.24.4) - Schema validation

### Additional
- [ ] **Sonner** (2.0.3) - Toast notifications
- [ ] **Date-fns** (4.1.0) - Date utilities

### Verify Frontend Packages:
```bash
cd frontend
yarn list --depth=0
```

---

## 🗄️ Database Setup

- [ ] **MongoDB Installed** and running
- [ ] **MongoDB Service Started**
  - Windows: Automatic
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod && sudo systemctl enable mongod`
- [ ] **MongoDB Connection Verified**
  ```bash
  mongosh  # Should connect without errors
  ```
- [ ] **Database Created** (auto-created on first use)
  ```javascript
  use happy_drives
  show collections
  ```

---

## 🔐 Environment Variables

### Backend Environment (.env)

Create `backend/.env` with:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=happy_drives

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Razorpay Payment (Optional - get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Application
ENVIRONMENT=development
DEBUG=True
```

- [ ] `backend/.env` file created
- [ ] MongoDB URL configured
- [ ] JWT secret generated (min 32 characters)
- [ ] Razorpay keys added (optional for now)

### Frontend Environment (.env)

Create `frontend/.env` with:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

- [ ] `frontend/.env` file created
- [ ] Backend URL configured correctly

---

## 🌐 Network & Ports

### Required Ports (Local Development)

- [ ] **Port 3000** - Frontend React app (default)
- [ ] **Port 8001** - Backend FastAPI server
- [ ] **Port 27017** - MongoDB database

### Check Port Availability:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8001
netstat -ano | findstr :27017

# macOS/Linux
lsof -i :3000
lsof -i :8001
lsof -i :27017
```

### For Production Deployment:

- [ ] **Port 80** - HTTP traffic (Nginx)
- [ ] **Port 443** - HTTPS traffic (SSL/TLS)
- [ ] **Port 22** - SSH access
- [ ] **Firewall configured** to allow necessary ports

---

## 🚀 Production Server Requirements

### Minimum VPS/Cloud Server Specs:

- [ ] **CPU**: 2 cores or more
- [ ] **RAM**: 4 GB or more (8 GB recommended)
- [ ] **Storage**: 20 GB SSD or more
- [ ] **OS**: Ubuntu 22.04 LTS (recommended)
- [ ] **Network**: 100 Mbps+ bandwidth
- [ ] **Domain Name**: Optional but recommended
- [ ] **SSL Certificate**: Let's Encrypt (free)

### Recommended Cloud Providers:

- [ ] **DigitalOcean** - Droplets starting at $6/month
- [ ] **AWS EC2** - t2.small or larger
- [ ] **Google Cloud** - e2-small or larger
- [ ] **Linode** - Nanode 4GB or larger
- [ ] **Vultr** - Cloud Compute starting at $6/month
- [ ] **Hetzner** - Cloud servers starting at €4.15/month

---

## 🔑 API Keys & Credentials

### Required for Full Functionality:

- [ ] **MongoDB Connection String**
  - Local: `mongodb://localhost:27017`
  - Cloud: `mongodb+srv://username:password@cluster.mongodb.net`

- [ ] **JWT Secret Key**
  - Generate: `openssl rand -hex 32`
  - Or: Any random 32+ character string

### Optional (For Payment Integration):

- [ ] **Razorpay Account** created at [dashboard.razorpay.com](https://dashboard.razorpay.com/)
- [ ] **Razorpay API Keys** (Test mode)
  - Key ID: `rzp_test_xxxxxxxxxxxxx`
  - Key Secret: `xxxxxxxxxxxxxxxxxxxxx`
  - Webhook Secret: `xxxxxxxxxxxxxxxxxxxxx`

### Optional (For WhatsApp Integration):

- [ ] **WhatsApp Business Account** (uses Baileys - no API key needed)
- [ ] **QR Code Authentication** setup

---

## 📝 Development Tools (Recommended)

### Code Editors:

- [ ] **Visual Studio Code** (recommended)
  - Install: [code.visualstudio.com](https://code.visualstudio.com/)
  - Extensions:
    - Python
    - ESLint
    - Tailwind CSS IntelliSense
    - MongoDB for VS Code
    - GitLens

- [ ] **PyCharm** (alternative for Python)
- [ ] **WebStorm** (alternative for JavaScript)

### Database Tools:

- [ ] **MongoDB Compass** (GUI for MongoDB)
  - Download: [mongodb.com/products/compass](https://www.mongodb.com/products/compass)

- [ ] **Studio 3T** (alternative MongoDB GUI)

### API Testing:

- [ ] **Postman** or **Insomnia** (API testing)
- [ ] **Thunder Client** (VS Code extension)

---

## 🧪 Testing & Verification

### Local Development Checklist:

- [ ] MongoDB running and accessible
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Home page loads at http://localhost:3000
- [ ] API docs accessible at http://localhost:8001/docs
- [ ] All navigation links work
- [ ] Forms submit without errors (mock data)
- [ ] Images load correctly
- [ ] Responsive design works on mobile view
- [ ] No console errors in browser

### Commands to Verify Everything:

```bash
# Check MongoDB
mongosh --eval "db.version()"

# Check Backend
cd backend && source venv/bin/activate && python -c "import fastapi; print(fastapi.__version__)"

# Check Frontend
cd frontend && yarn --version && node --version

# Check All Services
curl http://localhost:8001/api/  # Backend health check
curl http://localhost:3000  # Frontend
```

---

## 📊 System Resource Usage

### Expected Resource Usage (Development):

- **MongoDB**: ~100-200 MB RAM
- **Backend**: ~50-100 MB RAM
- **Frontend**: ~200-300 MB RAM
- **Total**: ~500 MB RAM minimum

### Expected Resource Usage (Production with Traffic):

- **MongoDB**: ~500 MB - 2 GB RAM
- **Backend**: ~200-500 MB RAM per instance
- **Frontend**: Static files (minimal after build)
- **Nginx**: ~10-50 MB RAM

---

## 🔒 Security Checklist (Production Only)

- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Use environment variables (never hardcode secrets)
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (UFW on Ubuntu)
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Keep system updated (`apt update && apt upgrade`)
- [ ] Set up automatic backups
- [ ] Configure fail2ban for SSH protection
- [ ] Use non-root user for deployment
- [ ] Disable root SSH login
- [ ] Set up monitoring and alerts

---

## 📚 Documentation & Resources

- [ ] [README.md](README.md) - Main documentation
- [ ] [QUICK_START.md](QUICK_START.md) - 5-minute setup guide
- [ ] [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete installation guide
- [ ] [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [ ] [CHANGELOG.md](CHANGELOG.md) - Version history
- [ ] [memory/PRD.md](memory/PRD.md) - Product requirements

---

## ✅ Final Checklist Before Launch

### Development Complete:
- [ ] All pages working correctly
- [ ] All forms functional
- [ ] Images loading properly
- [ ] Mobile responsive
- [ ] No console errors

### Backend Ready:
- [ ] All API endpoints implemented
- [ ] Database models created
- [ ] Payment integration working
- [ ] Error handling implemented
- [ ] API documentation complete

### Testing Done:
- [ ] Manual testing completed
- [ ] API endpoints tested
- [ ] Payment flow tested (test mode)
- [ ] Mobile testing done
- [ ] Cross-browser testing done

### Production Ready:
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 You're Ready!

Once you've checked off all the items above, you're ready to:
1. **Develop** locally
2. **Test** thoroughly
3. **Deploy** to production
4. **Scale** your application

**Need help?** Check the guides or open an issue on GitHub!

**Happy coding! 🚗💨**
