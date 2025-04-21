# RBAC-Tyre-Dealer-Metrics

A Role Based Access Control: Dealer Tyre Metrics Dashboard

## Features

- Role Base Access Control
- JWT for authentication and security
- Purchase history details
- Tyre and dealer rating possibility
- Graph / Analytics  based analysis and reward system

## Installation

- Clone the repository

```sh
git clone https://github.com/mihirvaidya1202/RBAC-Tyre-Dealer-Metrics.git
```

- Create .env file according in frontend and backend folder
```sh
# Generate JWT Token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Install dependencies and run
```sh
# In the project root
npm install

# Frontend terimanal:
cd frontend
npm install
npm run build
npm run dev

# Backend terminal:
cd backend
npm install
npm run dev
```
