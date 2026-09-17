// ========================================
// MACHpadaco Global Services
// Admin Portal Controller
// Contact Messages + Premium Enrollments
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
        : "";


// ========================================
// DOM ELEMENTS
// ========================================

// Admin headings
const adminPageTitle =
    document.getElementById("admin-page-title");

const adminPageDescription =
    document.getElementById("admin-page-description");


// View buttons
const messagesViewBtn =
    document.getElementById("messages-view-btn");

const enrollmentsViewBtn =
    document.getElementById("enrollments-view-btn");


// Refresh + logout
const refreshBtn =
    document.getElementById("refresh-btn");

const logoutBtn =
    document.getElementById("logout-btn");


// Error
const adminError =
    document.getElementById("admin-error");


// Contact section
const contactsSection =
    document.getElementById("contacts-section");

const contactsTableBody =
    document.getElementById("contacts-table-body");


// Enrollment section
const enrollmentsSection =
    document.getElementById("enrollments-section");

const enrollmentsTableBody =
    document.getElementById("enrollments-table-body");


// ========================================
// GET AUTH TOKEN
// ========================================

const token =
    localStorage.getItem("token");


// ========================================
// CHECK LOGIN
// ========================================

if (!token) {

    window.location.href = "/admin-login";

}


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

    if (!adminError) {
        return;
    }

    adminError.textContent =
        message;

    adminError.hidden = false;

}


// ========================================
// CLEAR ERROR
// ========================================

function clearError() {

    if (!adminError) {
        return;
    }

    adminError.textContent = "";

    adminError.hidden = true;

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
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

    const value =
        Number(amount);

    if (
        Number.isNaN(value)
    ) {
        return "N/A";
    }

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(value);

}


// ========================================
// HANDLE AUTH ERRORS
// ========================================

function handleAuthError(response) {

    if (response.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "/admin-login";

        return true;

    }


    if (response.status === 403) {

        showError(
            "You do not have permission to access this admin section."
        );

        return true;

    }


    return false;

}


// ========================================
// CONTACT STATUS SELECT
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
                ${currentStatus === "pending" ? "selected" : ""}
            >
                Pending
            </option>

            <option
                value="reviewed"
                ${currentStatus === "reviewed" ? "selected" : ""}
            >
                Reviewed
            </option>

            <option
                value="contacted"
                ${currentStatus === "contacted" ? "selected" : ""}
            >
                Contacted
            </option>

        </select>
    `;

}


// ========================================
// LOAD CONTACTS
// ========================================

async function loadContacts() {

    clearError();


    if (!contactsTableBody) {
        return;
    }


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


        if (
            handleAuthError(response)
        ) {
            return;
        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to retrieve contact messages."
            );

        }


        const contacts =
            Array.isArray(result.data)
                ? result.data
                : [];


        if (
            contacts.length === 0
        ) {

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


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        contact.createdAt
                                    )
                                )}
                            </td>


                            <td>
                                <strong>
                                    ${escapeHTML(name)}
                                </strong>
                            </td>


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


                            <td>
                                ${escapeHTML(service)}
                            </td>


                            <td>
                                ${escapeHTML(message)}
                            </td>


                            <td>
                                ${createStatusSelect(contact)}
                            </td>

                        </tr>
                    `;

                })
                .join("");


        // Attach status events

        const statusSelects =
            document.querySelectorAll(
                ".contact-status-select"
            );


        statusSelects.forEach(
            select => {

                select.addEventListener(
                    "change",
                    handleStatusChange
                );

            }
        );


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


        if (
            handleAuthError(response)
        ) {

            select.value =
                previousStatus;

            return;

        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to update contact status."
            );

        }


        select.dataset.previousStatus =
            newStatus;


        clearError();


        select.classList.add(
            "status-updated"
        );


        setTimeout(() => {

            select.classList.remove(
                "status-updated"
            );

        }, 1200);


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

        select.disabled =
            false;

    }

}


// ========================================
// CREATE ENROLLMENT STATUS
// ========================================

function createEnrollmentStatus(status) {

    const safeStatus =
        String(status || "pending")
            .toLowerCase();


    if (safeStatus === "verified") {

        return `
            <strong
                style="color: green;"
            >
                ✓ Verified
            </strong>
        `;

    }


    if (safeStatus === "rejected") {

        return `
            <strong
                style="color: red;"
            >
                ✕ Rejected
            </strong>
        `;

    }


    return `
        <strong>
            Pending
        </strong>
    `;

}


// ========================================
// ENROLLMENT ACTION BUTTONS
// ========================================

function createEnrollmentActions(enrollment) {

    const status =
        enrollment.status || "pending";


    if (status === "verified") {

        return `
            <span>
                Access Granted
            </span>
        `;

    }


    if (status === "rejected") {

        return `
            <span>
                Rejected
            </span>
        `;

    }


    return `
        <button
            type="button"
            class="enrollment-verify-btn"
            data-enrollment-id="${escapeHTML(enrollment.id || enrollment._id)}"
            data-action="verify"
        >
            ✓ Verify
        </button>

        <button
            type="button"
            class="enrollment-reject-btn"
            data-enrollment-id="${escapeHTML(enrollment.id || enrollment._id)}"
            data-action="reject"
        >
            ✕ Reject
        </button>
    `;

}


// ========================================
// LOAD PREMIUM ENROLLMENTS
// ========================================

async function loadEnrollments() {

    clearError();


    if (!enrollmentsTableBody) {
        return;
    }


    enrollmentsTableBody.innerHTML = `
        <tr>
            <td
                colspan="8"
                style="text-align: center;"
            >
                Loading enrollments...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/enrollments/admin`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            handleAuthError(response)
        ) {
            return;
        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to retrieve enrollments."
            );

        }


        const enrollments =
            Array.isArray(result.data)
                ? result.data
                : [];


        if (
            enrollments.length === 0
        ) {

            enrollmentsTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        style="text-align: center;"
                    >
                        No premium enrollment requests found.
                    </td>
                </tr>
            `;

            return;

        }


        enrollmentsTableBody.innerHTML =
            enrollments
                .map(enrollment => {

                    const student =
                        enrollment.user || {};


                    const studentName =
                        student.fullName ||
                        "N/A";


                    const studentEmail =
                        student.email ||
                        "N/A";


                    const enrollmentId =
                        enrollment.id ||
                        enrollment._id;


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    formatDate(
                                        enrollment.createdAt
                                    )
                                )}
                            </td>


                            <td>
                                <strong>
                                    ${escapeHTML(
                                        studentName
                                    )}
                                </strong>
                            </td>


                            <td>

                                ${
                                    studentEmail !== "N/A"
                                        ? `
                                            <a
                                                href="mailto:${escapeHTML(studentEmail)}"
                                            >
                                                ${escapeHTML(studentEmail)}
                                            </a>
                                          `
                                        : "N/A"
                                }

                            </td>


                            <td>
                                ${escapeHTML(
                                    enrollment.courseName ||
                                    "N/A"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    formatMoney(
                                        enrollment.amount
                                    )
                                )}
                            </td>


                            <td>
                                <strong>
                                    ${escapeHTML(
                                        enrollment.paymentReference ||
                                        "N/A"
                                    )}
                                </strong>
                            </td>


                            <td>
                                ${createEnrollmentStatus(
                                    enrollment.status
                                )}
                            </td>


                            <td>
                                ${createEnrollmentActions(
                                    enrollment
                                )}
                            </td>

                        </tr>
                    `;

                })
                .join("");


        // Attach enrollment action events

        const actionButtons =
            document.querySelectorAll(
                "[data-action][data-enrollment-id]"
            );


        actionButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    handleEnrollmentAction
                );

            }
        );


    } catch (error) {

        console.error(
            "Admin enrollments error:",
            error
        );


        enrollmentsTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="text-align: center;"
                >
                    Unable to load premium enrollments.
                </td>
            </tr>
        `;


        showError(
            error.message ||
            "Failed to load premium enrollments."
        );

    }

}


// ========================================
// VERIFY / REJECT ENROLLMENT
// ========================================

async function handleEnrollmentAction(event) {

    const button =
        event.currentTarget;


    const enrollmentId =
        button.dataset.enrollmentId;


    const action =
        button.dataset.action;


    if (
        !enrollmentId ||
        !action
    ) {
        return;
    }


    let status;


    if (action === "verify") {

        const confirmed =
            window.confirm(
                "Confirm that you have checked the bank payment and want to grant this student course access?"
            );


        if (!confirmed) {
            return;
        }


        status = "verified";

    }


    if (action === "reject") {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this enrollment?"
            );


        if (!confirmed) {
            return;
        }


        status = "rejected";

    }


    if (!status) {
        return;
    }


    button.disabled = true;


    const originalText =
        button.textContent;


    button.textContent =
        "Processing...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/enrollments/admin/${enrollmentId}`,
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
            handleAuthError(response)
        ) {
            return;
        }


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to update enrollment."
            );

        }


        clearError();


        alert(
            status === "verified"
                ? "Payment verified. Course access has been granted."
                : "Enrollment rejected."
        );


        await loadEnrollments();


    } catch (error) {

        console.error(
            "Enrollment update error:",
            error
        );


        showError(
            error.message ||
            "Unable to update enrollment."
        );


        button.disabled =
            false;


        button.textContent =
            originalText;

    }

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


    if (adminPageTitle) {

        adminPageTitle.textContent =
            "Contact Form Submissions";

    }


    if (adminPageDescription) {

        adminPageDescription.textContent =
            "Review and manage messages submitted through the website contact forms.";

    }


    loadContacts();

}


// ========================================
// SHOW PREMIUM ENROLLMENTS
// ========================================

function showEnrollments() {

    if (contactsSection) {
        contactsSection.hidden = true;
    }


    if (enrollmentsSection) {
        enrollmentsSection.hidden = false;
    }


    if (adminPageTitle) {

        adminPageTitle.textContent =
            "Premium Enrollments";

    }


    if (adminPageDescription) {

        adminPageDescription.textContent =
            "Review student payment references and approve or reject premium course enrollment requests.";

    }


    loadEnrollments();

}


// ========================================
// VIEW BUTTONS
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
        showEnrollments
    );

}


// ========================================
// REFRESH BUTTON
// ========================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        () => {

            const showingEnrollments =
                enrollmentsSection &&
                !enrollmentsSection.hidden;


            if (showingEnrollments) {

                loadEnrollments();

            } else {

                loadContacts();

            }

        }
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


            localStorage.removeItem(
                "token"
            );


            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "/admin-login";

        }
    );

}


// ========================================
// INITIAL LOAD
// ========================================

loadContacts();