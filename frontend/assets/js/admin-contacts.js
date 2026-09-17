// ========================================
// Machpadaco Admin Contacts
// ========================================

const API_BASE_URL =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://localhost:5000"
        : "https://machpadacoglobalservices-api.onrender.com";


// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");

const userJson = localStorage.getItem("user");

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
// PAGE ELEMENTS
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

    if (!token || !user || user.role !== "admin") {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";

        return false;
    }

    return true;
}


// ========================================
// SHOW CONTACT MESSAGES
// ========================================

function showContacts() {

    if (contactsSection) {

        contactsSection.hidden = false;

    }

    if (enrollmentsSection) {

        enrollmentsSection.hidden = true;

    }

    if (contactsMessage) {

        contactsMessage.textContent = "";

    }

    if (enrollmentsMessage) {

        enrollmentsMessage.textContent = "";

    }

    loadContacts();

}


// ========================================
// SHOW PREMIUM ENROLLMENTS PAGE
// ========================================

function showEnrollmentsPage() {

    window.location.href =
        "/admin-enrollments.html";

}


// ========================================
// LOAD CONTACT MESSAGES
// ========================================

async function loadContacts() {

    if (!ensureAdmin()) {
        return;
    }

    if (!contactsTableBody) {
        return;
    }

    contactsTableBody.innerHTML = `
        <tr>
            <td colspan="6">
                Loading contact messages...
            </td>
        </tr>
    `;

    if (contactsMessage) {

        contactsMessage.textContent = "";

    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/contact/admin/contacts`,
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "admin-login.html";

            return;
        }

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load contact messages."
            );

        }

        const contacts =
            result.data || [];

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

        contactsTableBody.innerHTML =
            contacts.map(contact => {

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
                                contact.status || "new"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                createdAt
                            )}
                        </td>

                    </tr>
                `;

            }).join("");

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

        if (contactsMessage) {

            contactsMessage.textContent =
                error.message ||
                "Unable to load contact messages.";

        }

    }

}


// ========================================
// LOAD PREMIUM ENROLLMENTS
// ========================================

async function loadEnrollments() {

    if (!ensureAdmin()) {
        return;
    }

    if (!enrollmentsTableBody) {
        return;
    }

    enrollmentsTableBody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading premium enrollments...
            </td>
        </tr>
    `;

    if (enrollmentsMessage) {

        enrollmentsMessage.textContent = "";

    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/admin`,
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "admin-login.html";

            return;
        }

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load premium enrollments."
            );

        }

        const enrollments =
            result.data || [];

        if (!enrollments.length) {

            enrollmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        No premium enrollments found.
                    </td>
                </tr>
            `;

            return;
        }

        enrollmentsTableBody.innerHTML =
            enrollments.map(enrollment => {

                const createdAt =
                    enrollment.createdAt
                        ? new Date(
                            enrollment.createdAt
                        ).toLocaleString()
                        : "";

                const userName =
                    enrollment.user?.name ||
                    enrollment.user?.fullName ||
                    "";

                const userEmail =
                    enrollment.user?.email ||
                    "";

                const amount =
                    Number(
                        enrollment.amount || 0
                    ).toLocaleString(
                        "en-NG",
                        {
                            style: "currency",
                            currency: "NGN"
                        }
                    );

                return `
                    <tr>

                        <td>
                            ${escapeHtml(
                                userName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                userEmail
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                enrollment.courseName ||
                                enrollment.courseSlug ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                amount
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                enrollment.paymentReference ||
                                ""
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                enrollment.status ||
                                "pending"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                createdAt
                            )}
                        </td>

                        <td>

                            <div class="admin-action-buttons">

                                <button
                                    type="button"
                                    class="verify-enrollment-btn"
                                    data-id="${escapeHtml(
                                        enrollment._id
                                    )}"
                                    ${enrollment.status === "verified"
                                        ? "disabled"
                                        : ""}
                                >
                                    Verify
                                </button>

                                <button
                                    type="button"
                                    class="reject-enrollment-btn"
                                    data-id="${escapeHtml(
                                        enrollment._id
                                    )}"
                                    ${enrollment.status === "rejected"
                                        ? "disabled"
                                        : ""}
                                >
                                    Reject
                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }).join("");

        attachEnrollmentActions();

    } catch (error) {

        console.error(
            "Error loading enrollments:",
            error
        );

        enrollmentsTableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load premium enrollments.
                </td>
            </tr>
        `;

        if (enrollmentsMessage) {

            enrollmentsMessage.textContent =
                error.message ||
                "Unable to load premium enrollments.";

        }

    }

}


// ========================================
// UPDATE ENROLLMENT STATUS
// ========================================

async function updateEnrollment(
    enrollmentId,
    status
) {

    if (!ensureAdmin()) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/admin/${encodeURIComponent(
                enrollmentId
            )}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    status
                })
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href =
                "admin-login.html";

            return;
        }

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to update enrollment."
            );

        }

        await loadEnrollments();

    } catch (error) {

        console.error(
            "Error updating enrollment:",
            error
        );

        if (enrollmentsMessage) {

            enrollmentsMessage.textContent =
                error.message ||
                "Unable to update enrollment.";

        }

    }

}


// ========================================
// ATTACH ENROLLMENT ACTIONS
// ========================================

function attachEnrollmentActions() {

    const verifyButtons =
        document.querySelectorAll(
            ".verify-enrollment-btn"
        );

    verifyButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const enrollmentId =
                    button.dataset.id;

                if (!enrollmentId) {
                    return;
                }

                await updateEnrollment(
                    enrollmentId,
                    "verified"
                );

            }
        );

    });


    const rejectButtons =
        document.querySelectorAll(
            ".reject-enrollment-btn"
        );

    rejectButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const enrollmentId =
                    button.dataset.id;

                if (!enrollmentId) {
                    return;
                }

                await updateEnrollment(
                    enrollmentId,
                    "rejected"
                );

            }
        );

    });

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
        () => {

            loadContacts();

            if (
                enrollmentsSection &&
                !enrollmentsSection.hidden
            ) {

                loadEnrollments();

            }

        }
    );

}


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


// ========================================
// INITIAL LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (!ensureAdmin()) {
            return;
        }

        showContacts();

    }
);