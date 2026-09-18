// ========================================
// MACHpadaco Global Services
// API Configuration
// ========================================

const API_BASE_URL =
    (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    )
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";


export default API_BASE_URL;