# TrueLens

AI-Powered Image Authenticity Detection System

TrueLens is a web application that analyzes images to estimate whether they are likely AI-generated or likely original photographs. It implements multiple machine learning algorithms, compares their performance, and displays evaluation metrics.

**Important:** Image authenticity detection is an evolving field. TrueLens predictions are model estimates, not definitive proof of image origin. Results should be interpreted as indicators, not as conclusive evidence.

---

## Features

- Upload and analyze images (JPG, JPEG, PNG, WEBP)
- Multiple ML algorithm predictions with confidence scores
- Model comparison dashboard with evaluation metrics
- Confusion matrices and performance charts
- Analysis history with search, filter, and export
- User authentication (optional, guest analysis supported)
- Responsive design for desktop, tablet, and mobile
- Uncertainty detection for inconclusive results

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Recharts for data visualization
- Lucide React for icons
- CSS with custom properties

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Multer for file uploads

### ML Service
- Python with FastAPI
- Scikit-learn (Logistic Regression, Random Forest, SVM, KNN)
- XGBoost
- PyTorch (CNN, Vision Transformer)
- OpenCV and Pillow for image processing
- NumPy and Pandas for data handling

## ML Algorithms

| # | Algorithm | Type |
|---|-----------|------|
| 1 | Logistic Regression | Traditional ML |
| 2 | Random Forest | Traditional ML |
| 3 | Support Vector Machine | Traditional ML |
| 4 | K-Nearest Neighbors | Traditional ML |
| 5 | XGBoost | Traditional ML |
| 6 | Convolutional Neural Network | Deep Learning |
| 7 | Vision Transformer | Deep Learning |

## Project Structure

```
TRUE_LENS/
  frontend/           # React application
    src/
      components/     # Reusable UI components
      pages/          # Route pages
      services/       # API service modules
      context/        # React context providers
      hooks/          # Custom hooks
      styles/         # CSS files
    public/
    netlify.toml      # Netlify deployment config
  backend/            # Express.js API server
    src/
      config/         # Database and environment config
      controllers/    # Route controllers
      middleware/     # Auth, validation, error handling
      models/         # Mongoose schemas
      routes/         # Express routes
      services/       # Business logic
    server.js
  ml-service/         # Python ML service
    api/              # FastAPI application
    preprocessing/    # Image preprocessing pipeline
    models/           # ML model implementations
    training/         # Training scripts
    evaluation/       # Evaluation and metrics
    data/             # Dataset directory
    results/          # Evaluation results
  README.md
  .gitignore
```

## Installation

### Prerequisites

- Node.js 18 or later
- Python 3.9 or later
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the Repository

```powershell
git clone https://github.com/your-username/truelens.git
cd truelens
```

### 2. Frontend Setup

```powershell
cd frontend
npm install
copy .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Backend Setup

```powershell
cd backend
npm install
copy .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/truelens
JWT_SECRET=your-secret-key-change-this
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### 4. ML Service Setup

```powershell
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `ml-service/.env`:
```
HOST=0.0.0.0
PORT=8000
MODEL_DIR=models/saved
RESULTS_DIR=results
```

## Dataset Preparation

TrueLens requires a dataset of real photographs and AI-generated images for model training.

### Option A: Use the Synthetic Data Generator (for testing)

```powershell
cd ml-service
venv\Scripts\activate
python -m training.generate_synthetic_data
```

This creates a small synthetic dataset for development and testing. The synthetic dataset uses simple patterns and is not suitable for production evaluation.

### Option B: Use a Public Dataset

Recommended datasets (check licenses before use):

1. **CIFAKE** - Real and AI-generated images dataset
   - Source: Kaggle
   - License: Check dataset page
   
2. **AI-Generated Image Detection datasets** on Hugging Face

Organize images into:
```
ml-service/data/
  train/
    real/          # Real photographs
    ai_generated/  # AI-generated images
  val/
    real/
    ai_generated/
  test/
    real/
    ai_generated/
```

## Model Training

### Train Traditional ML Models

```powershell
cd ml-service
venv\Scripts\activate
python -m training.train_traditional
```

### Train Deep Learning Models (CNN and Vision Transformer)

```powershell
python -m training.train_deep
```

Note: Deep learning training is computationally intensive. A GPU is recommended but not required. CPU training will be slower.

### Evaluate All Models

```powershell
python -m evaluation.evaluate
```

Evaluation results are saved to `ml-service/results/` as JSON files.

## Running Locally

Start all three services:

### Terminal 1: ML Service
```powershell
cd ml-service
venv\Scripts\activate
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### Terminal 2: Backend
```powershell
cd backend
npm run dev
```

### Terminal 3: Frontend
```powershell
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

## Deployment

### Frontend (Netlify)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `frontend/dist`
4. Set base directory: `frontend`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

The `netlify.toml` file handles SPA routing.

### Backend (Render or similar)

1. Deploy the `backend/` directory
2. Set environment variables (PORT, MONGODB_URI, JWT_SECRET, ML_SERVICE_URL)
3. Start command: `node server.js`

### ML Service (Render or similar)

1. Deploy the `ml-service/` directory
2. Set environment variables
3. Start command: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. Upload trained model files to the deployment

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Get the connection string
3. Set MONGODB_URI in your backend environment

## API Endpoints

### Backend API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/profile | Get profile | Yes |
| POST | /api/analysis/predict | Analyze image | Optional |
| GET | /api/analysis/history | Get history | Yes |
| GET | /api/analysis/:id | Get result | No |
| DELETE | /api/analysis/:id | Delete result | Yes |
| DELETE | /api/analysis | Clear history | Yes |
| GET | /api/models/metrics | Get model metrics | No |
| GET | /api/models/comparison | Compare models | No |

### ML Service API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Service health and model status |
| GET | /models | List available models |
| POST | /predict | Analyze uploaded image |
| GET | /metrics | Get evaluation metrics |
| POST | /evaluate | Run model evaluation |

## Limitations

- Detection accuracy depends on training data quality and quantity
- Models may not generalize well to AI generators not represented in training data
- The synthetic test dataset produces unreliable evaluation metrics; use a proper dataset for meaningful results
- Deep learning models require significant training time on CPU
- Image metadata analysis is limited to basic EXIF data
- The system cannot detect all forms of image manipulation
- New AI generation techniques may evade detection
- Results should not be used as sole evidence in any formal proceeding

## Environment Variables

See `.env.example` files in each service directory for required configuration.

Never commit `.env` files to version control.

## License

This project is developed for academic purposes.

---

Built with care for a final-year computer science project.

