# 🛠️ How to Use the Application

## 1️⃣ Access the UI
- Open the **Fiori Elements UI**.
- Navigate to the **API Keys Management** screen.

## 2️⃣ Create a New API Key
1. Click **"New Entry"** ➕
2. Fill in the **debitor** & **description**.
3. Click **"Save"** ✅
4. The API key is generated **automatically** 🔑

## 3️⃣ Validate an API Key
- Call the **`/api/validateAPIKey`** endpoint with a key in the header. The token must be in the header field "x-api-key"
- If valid, the API returns `{ valid: true }`

## 4️⃣ Debugging & Logs
- API logs can be viewed via:
  - **Console logs (`console.log`)**
  - **SAP Cloud Foundry logs (`cf logs <app-name> --recent`)**

## 📢 Troubleshooting
- **Missing API key?** Ensure database persistence.
- **Validation failure?** Check header format.

---