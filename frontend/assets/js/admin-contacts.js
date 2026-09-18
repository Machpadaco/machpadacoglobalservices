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
// CHECK LOGIN / ADMIN
// ========================================

function ensureAdmin() {

    if (!token) {

        window.location.href =
            "/admin-login";

        return false;
    }


    if (!user || user.role !== "admin") {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "/admin-login";

        return false;
    }


    return true;
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

const contactsMessage =
    document.getElementById("contacts-message");

const adminError =
    document.getElementById("admin-error");


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// SHOW ERROR
// ========================================

function showError(message) {

    if (adminError) {

        adminError.textContent =
            message || "";

        adminError.hidden =
            !message;
    }


    if (contactsMessage) {

        contactsMessage.textContent =
            message || "";

        contactsMessage.hidden =
            !message;
    }
}


// ========================================
// CLEAR ERROR
// ========================================

function clearError() {

    if (adminError) {

        adminError.textContent = "";

        adminError.hidden = true;
    }


    if (contactsMessage) {

        contactsMessage.textContent = "";

        contactsMessage.hidden = true;
    }
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "N/A";
    }


    return date.toLocaleString();
}


// ========================================
// STATUS SELECT
// ========================================

function createStatusSelect(contact) {

    const currentStatus =
        contact.status || "pending";


    return `
        <select
            class="contact-status-select"
            data-contact-id="${escapeHTML(contact._id)}"
            data-previous-status="${escapeHTML(currentStatus)}"
            aria-label="Change contact status"
        >

            <option
                value="pending"
                ${
                    currentStatus === "pending"
                        ? "selected"
                        : ""
                }
            >
                Pending
            </option>

            <option
                value="reviewed"
                ${
                    currentStatus === "reviewed"
                        ? "selected"
                        : ""
                }
            >
                Reviewed
            </option>

            <option
                value="contacted"
                ${
                    currentStatus === "contacted"
                        ? "selected"
                        : ""
                }
            >
                Contacted
            </option>

        </select>
    `;
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
            "/admin-login";

        return true;
    }


    return false;
}


// ========================================
// LOAD CONTACT MESSAGES
// ========================================

async function loadContacts() {

    if (!ensureAdmin()) {
        return;
    }


    clearError();


    if (!contactsTableBody) {

        console.error(
            "contacts-table-body was not found."
        );

        return;
    }


    // ========================================
    // LOADING MESSAGE
    // ========================================

    contactsTableBody.innerHTML = `
        <tr>
            <td
                colspan="6"
                style="text-align: center;"
            >
                Loading messages...
            </td>
        </tr>
    `;


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
            await response.json();


        // ========================================
        // CHECK SERVER RESULT
        // ========================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to retrieve contact messages."
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

        if (contacts.length === 0) {

            contactsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        style="text-align: center;"
                    >
                        No contact messages found.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // DISPLAY CONTACTS
        //
        // COLUMN ORDER:
        // DATE
        // NAME
        // EMAIL
        // SERVICE
        // MESSAGE
        // STATUS
        // ========================================

        contactsTableBody.innerHTML =
            contacts
                .map(contact => {

                    const name =
                        contact.name ||
                        contact.fullName ||
                        "N/A";


                    const email =
                        contact.email ||
                        "N/A";


                    const service =
                        contact.service ||
                        "N/A";


                    const message =
                        contact.message ||
                        "";


                    const date =
                        formatDate(
                            contact.createdAt
                        );


                    return `
                        <tr>

                            <!-- DATE -->
                            <td>
                                ${escapeHTML(date)}
                            </td>


                            <!-- NAME -->
                            <td>
                                <strong>
                                    ${escapeHTML(name)}
                                </strong>
                            </td>


                            <!-- EMAIL -->
                            <td>
                                ${
                                    email !== "N/A"
                                        ? `
                                            <a
                                                href="mailto:${escapeHTML(email)}"
                                            >
                                                ${escapeHTML(email)}
                                            </a>
                                          `
                                        : "N/A"
                                }
                            </td>


                            <!-- SERVICE -->
                            <td>
                                ${escapeHTML(service)}
                            </td>


                            <!-- MESSAGE -->
                            <td>
                                ${escapeHTML(message)}
                            </td>


                            <!-- STATUS -->
                            <td>
                                ${createStatusSelect(contact)}
                            </td>

                        </tr>
                    `;

                })
                .join("");


        // ========================================
        // ATTACH STATUS EVENTS
        // ========================================

        const statusSelects =
            document.querySelectorAll(
                ".contact-status-select"
            );


        statusSelects.forEach(select => {

            select.addEventListener(
                "change",
                handleStatusChange
            );

        });


    } catch (error) {

        console.error(
            "Admin contacts error:",
            error
        );


        contactsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align: center;"
                >
                    Unable to load contact messages.
                </td>
            </tr>
        `;


        showError(
            error.message ||
            "Failed to load contact messages."
        );
    }
}


// ========================================
// UPDATE CONTACT STATUS
// ========================================

async function handleStatusChange(event) {

    const select =
        event.target;


    const contactId =
        select.dataset.contactId;


    const newStatus =
        select.value;


    const previousStatus =
        select.dataset.previousStatus ||
        "pending";


    if (!contactId) {

        console.error(
            "Contact ID is missing."
        );

        return;
    }


    select.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/contact/admin/contacts/${contactId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
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
        // READ RESPONSE
        // ========================================

        const result =
            await response.json();


        // ========================================
        // CHECK RESULT
        // ========================================

        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to update contact status."
            );
        }


        // ========================================
        // SAVE SUCCESSFUL STATUS
        // ========================================

        select.dataset.previousStatus =
            newStatus;


        clearError();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        select.value =
            previousStatus;


        showError(
            error.message ||
            "Unable to update contact status."
        );


    } finally {

        select.disabled = false;
    }
}


// ========================================
// SHOW CONTACTS
// ========================================

function showContacts() {

    if (contactsSection) {

        contactsSection.hidden =
            false;
    }


    if (enrollmentsSection) {

        enrollmentsSection.hidden =
            true;
    }


    loadContacts();
}


// ========================================
// PREMIUM ENROLLMENTS
// ========================================

function showEnrollmentsPage() {

    window.location.href =
        "/admin-enrollments.html";
}


// ========================================
// REFRESH BUTTON
// ========================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        loadContacts
    );
}


// ========================================
// CONTACT MESSAGES BUTTON
// ========================================

if (messagesViewBtn) {

    messagesViewBtn.addEventListener(
        "click",
        showContacts
    );
}


// ========================================
// PREMIUM ENROLLMENTS BUTTON
// ========================================

if (enrollmentsViewBtn) {

    enrollmentsViewBtn.addEventListener(
        "click",
        showEnrollmentsPage
    );
}


// ========================================
// LOGOUT
// ========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();


            localStorage.removeItem("token");

            localStorage.removeItem("user");


            window.location.href =
                "/admin-login";
        }
    );
}


// ========================================
// INITIAL LOAD
//
// IMPORTANT:
// main.js dynamically imports this
// module after DOMContentLoaded.
//
// Therefore we initialize immediately.
// DO NOT wrap this in another
// DOMContentLoaded listener.
// ========================================

if (ensureAdmin()) {

    showContacts();
}