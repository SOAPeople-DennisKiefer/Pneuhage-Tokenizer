# 🛡️ API Reference

## 🔑 Generate API Key
**Endpoint:** `POST /api/generateAPIKey`  
**Description:** Generates a new API key and stores it in the database.  
**Request:**
```json
{
  "debitor": "Customer123",
  "textfield": "API Key for Customer123"
}
```
**Response:**
```json
{
  "message": "API Key generated successfully",
  "apiKey": "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
}
```

---

## ✅ Validate API Key
**Endpoint:** `GET /api/validateAPIKey`  
**Description:** Validates an API key provided in the request header.  
**Headers:**
```
x-api-key: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```
**Response:**
```json
{
  "valid": true,
  "debitor": "Customer123",
  "Textfield": "API Key for Customer123",
  "createdAt": "2025-01-28T12:34:56Z"
}
```
---

## 🛠️ Error Handling
- `401 Unauthorized` - Invalid or missing API key
- `500 Internal Server Error` - Unexpected backend issue

---