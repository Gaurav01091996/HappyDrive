# ⚡ Quick Start Guide - Happy Drives

**Get up and running in 5 minutes!**

---

## 🎯 Prerequisites Checklist

Before starting, make sure you have these installed:

- [ ] **Python 3.9-3.11** → Check: `python --version`
- [ ] **Node.js 16+** → Check: `node --version`
- [ ] **Yarn** → Check: `yarn --version`
- [ ] **MongoDB 5.0+** → Check: `mongod --version`
- [ ] **Git** → Check: `git --version`

❌ **Missing something?** → See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed installation instructions.

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/happy-drives.git
cd happy-drives
```

### Step 2: Start MongoDB
```bash
# Windows: MongoDB runs as service automatically
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Step 3: Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017
DB_NAME=happy_drives
JWT_SECRET=your_secret_key_change_in_production
ENVIRONMENT=development" > .env

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**✅ Backend Running:** http://localhost:8001/docs

### Step 4: Setup Frontend (New Terminal)
```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Start frontend
yarn start
```

**✅ Frontend Running:** http://localhost:3000

### Step 5: Open Browser
```
🌐 Visit: http://localhost:3000
📚 API Docs: http://localhost:8001/docs
```

---

## 🎨 What You'll See

- **Home Page** - Hero section with luxury cars
- **Self-Drive Cars** - Browse 6 premium vehicles
- **Driver Service** - Hire professional drivers
- **Package Trips** - Curated travel packages
- **About Us** - Company information
- **Contact** - Contact form with Google Maps

---

## ⚙️ Environment Variables Reference

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=happy_drives
JWT_SECRET=your_jwt_secret_key
ENVIRONMENT=development

# Optional - Payment Integration
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🐛 Common Issues & Quick Fixes

### "Port 3000 already in use"
```bash
# Kill the process
npx kill-port 3000
```

### "MongoDB connection failed"
```bash
# Check if MongoDB is running
mongosh  # Should connect without errors

# If not running, start it:
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### "Module not found" (Backend)
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # You should see (venv) in terminal

# Reinstall dependencies
pip install -r requirements.txt
```

### "Command 'yarn' not found"
```bash
npm install -g yarn
```

---

## 📦 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | React | 19.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Backend | FastAPI | 0.110.1 |
| Database | MongoDB | 6.0+ |
| UI Components | Shadcn UI | Latest |

---

## 🔥 Development Commands

### Backend
```bash
# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Run with logs
uvicorn app.main:app --reload --log-level debug

# Check Python version
python --version
```

### Frontend
```bash
# Start dev server
yarn start

# Build for production
yarn build

# Run linter
yarn lint
```

### MongoDB
```bash
# Connect to MongoDB shell
mongosh

# View databases
show dbs

# Use happy_drives database
use happy_drives

# View collections
show collections
```

---

## 🎯 Next Steps

1. **Explore the App** - Navigate through all pages
2. **Test Features** - Try booking forms, filters, search
3. **Check API Docs** - Visit http://localhost:8001/docs
4. **Read Full Documentation** - See [README.md](README.md)
5. **Setup Payment Gateway** - Follow Razorpay integration guide
6. **Customize Design** - Modify Tailwind classes in components

---

## 📚 Additional Resources

- **Complete Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **API Documentation**: [README.md#api-documentation](README.md#api-documentation)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Project Requirements**: [memory/PRD.md](memory/PRD.md)

---

## 🆘 Still Stuck?

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Review error logs in terminal
3. Open an issue on GitHub
4. Email: dev@happydrives.com

---

**Happy Coding! 🚗💨**
