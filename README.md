# BeyondBMI Mobile App

## Quick Start

### 1. Prerequisites

- Node.js (LTS recommended)
- Docker Desktop
- Git

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/beyondbmi.git
cd beyondbmi
yarn install # Install frontend dependencies
cd backend
yarn install # Install backend dependencies
cd ..
```

### 3. Environment Variables (`.env`)

Create a `.env` file in the project's root directory and populate it with:

```
MONGODB_URI=mongodb://localhost:27017/beyondbmi_db
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

_Replace placeholders with your actual keys and desired configurations._

### 4. Run Backend (Docker)

From the project root, build and start the Dockerized backend:

```bash
docker-compose up --build -d
# Check logs: docker-compose logs backend
```

### 5. Run Frontend (Expo)

From the project root, start the Expo development server:

```bash
npx expo start
# Then, choose your platform (e.g., press 'a' for Android, 'i' for iOS, or 'w' for web)
# Or run directly:
# yarn run android
# yarn run ios
```

### 6. Linting

Run lint checks from the project root:

```bash
yarn run lint
```
