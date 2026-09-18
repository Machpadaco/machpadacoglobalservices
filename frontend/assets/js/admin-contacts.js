// ========================================
// MACHpadaco Global Services
// Admin Contacts Dashboard
// ========================================


// ========================================
// API CONFIGURATION
// ========================================

const API_BASE_URL =
    (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
    )
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";


// ========================================
// AUTHENTICATION
// ========================================

const token =
    localStorage.getItem("token");

const userJson =
    localStorage.getItem("user");

let user = null;

try {

    user = userJson
        ? JSON.parse(userJson)
        : null;

} catch (error) {

    console.error(
        "Unable to read stored user data:",
        error
    );

}


// ========================================
// DOM ELEMENTS
// ========================================

const contactsSection =
    document.getElementById("contacts-section");

const enrollmentsSection =
    document.getElementById("enrollments-section");

const messagesViewBtn =
    document.getElementById("messages-view-btn");

const enrollmentsViewBtn =
    document.getElementById("enrollments-view-btn");

const refreshBtn =
    document.getElementById("refresh-btn");

const logoutBtn =
    document.getElementById("logout-btn");

const contactsTableBody =
    document.getElementById("contacts-table-body");

const enrollmentsTableBody =
    document.getElementById("enrollments-table-body");

const contactsMessage =
    document.getElementById("contacts-message");

const enrollmentsMessage =
    document.getElementById("enrollments-message");


// ========================================
// ENSURE ADMIN
// ========================================

function ensureAdmin() {

    if (!token) {

        window.location.href =
            "admin-login.html";

        return false;
    }


    if (!user || user.role !== "admin") {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}


// ========================================
// HANDLE UNAUTHORIZED RESPONSE
// ========================================

function handleUnauthorized(response) {

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";

        return true;
    }


    return false;
}


// ========================================
// SAFELY READ JSON RESPONSE
// ========================================

async function readResponseJson(response) {

    const contentType =
        response.headers.get("content-type") || "";


    if (
        !contentType.includes("application/json")
    ) {

        const text =
            await response.text();

        throw new Error(
            text ||
            `Server returned HTTP ${response.status}.`
        );
    }


    return await response.json();
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// SHOW MESSAGE
// ========================================

function showContactsMessage(message) {

    if (!contactsMessage) {
        return;
    }

    contactsMessage.textContent =
        message || "";

    contactsMessage.hidden =
        !message;
}


// ========================================
// CLEAR CONTACT MESSAGE
// ========================================

function clearContactsMessage() {

    if (!contactsMessage) {
        return;
    }

    contactsMessage.textContent = "";

    contactsMessage.hidden = true;
}


// ========================================
// SHOW CONTACTS SECTION
// ========================================

function showContacts() {

    if (contactsSection) {
        contactsSection.hidden = false;
    }


    if (enrollmentsSection) {
        enrollmentsSection.hidden = true;
    }


    clearContactsMessage();


    loadContacts();
}


// ========================================
// LOAD CONTACT MESSAGES
// ========================================

async function loadContacts() {

    if (!ensureAdmin()) {
        return;
    }


    if (!contactsTableBody) {
        console.error(
            "contacts-table-body was not found."
        );

        return;
    }


    contactsTableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading contact messages...
            </td>
        </tr>
    `;


    clearContactsMessage();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/contact/admin/contacts`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        // ========================================
        // AUTHORIZATION CHECK
        // ========================================

        if (
            handleUnauthorized(response)
        ) {
            return;
        }


        // ========================================
        // READ SERVER RESPONSE
        // ========================================

        const result =
            await readResponseJson(response);


        // ========================================
        // CHECK SERVER RESULT
        // ========================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load contact messages."
            );
        }


        // ========================================
        // GET CONTACTS
        // ========================================

        const contacts =
            Array.isArray(result.data)
                ? result.data
                : [];


        // ========================================
        // NO CONTACTS
        // ========================================

        if (!contacts.length) {

            contactsTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No contact messages found.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // DISPLAY CONTACTS
        // ========================================

        contactsTableBody.innerHTML =
            contacts
                .map(contact => {

                    const createdAt =
                        contact.createdAt
                            ? new Date(
                                contact.createdAt
                            ).toLocaleString()
                            : "";


                    return `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    contact.name || ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    contact.email || ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    contact.subject || ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    contact.message || ""
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    contact.status ||
                                    "pending"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    createdAt
                                )}
                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Error loading contacts:",
            error
        );


        contactsTableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load contact messages.
                </td>
            </tr>
        `;


        showContactsMessage(
            error.message ||
            "Unable to load contact messages."
        );
    }
}


// ========================================
// SHOW PREMIUM ENROLLMENTS PAGE
// ========================================

function showEnrollmentsPage() {

    window.location.href =
        "admin-enrollments.html";
}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "admin-login.html";
}


// ========================================
// EVENT LISTENERS
// ========================================

if (messagesViewBtn) {

    messagesViewBtn.addEventListener(
        "click",
        showContacts
    );
}


if (enrollmentsViewBtn) {

    enrollmentsViewBtn.addEventListener(
        "click",
        showEnrollmentsPage
    );
}


if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadContacts
    );
}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            logout();
        }
    );
}


// ========================================
// INITIAL LOAD
// IMPORTANT:
// This module is dynamically imported by
// main.js after DOMContentLoaded.
// Therefore we MUST NOT add another
// DOMContentLoaded listener here.
// ========================================

if (ensureAdmin()) {

    showContacts();
}