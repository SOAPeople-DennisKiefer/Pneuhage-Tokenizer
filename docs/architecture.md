# 🏢 Architecture Overview

The **API Tokenizer** consists of **two main components**:

## 🎡 Backend
- **Built with Node.js & SAP Cloud SDK**
- Uses `CAP (Cloud Application Programming Model)`
- Exposes API endpoints for:
  - Generating API keys (`generateAPIKey`)
  - Validating API keys (`validateAPIKey`)
- Stores API keys in **SQLite** (deployed with the app)
- Secured with **JWT authentication**

### 🔗 Backend Technologies
- **Node.js** (Express, CDS)
- **SAP Cloud SDK** (Destination handling)
- **SQLite** (Persistent storage)

---

## 🎨 Frontend (Fiori Elements UI)
- UI built using **SAP Fiori Elements**
- Directly connected to the backend via OData
- Allows users to:
  - View API keys
  - Create new API keys
  - Edit API key metadata

### 🏰 System Flow
```plaintext
User → Fiori UI → API Service (CDS) → SQLite DB
```

---