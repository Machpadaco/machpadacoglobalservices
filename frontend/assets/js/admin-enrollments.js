// ========================================
// MACHpadaco Global Services
// Admin Premium Enrollments
// ========================================

const token = localStorage.getItem("token");
const userJson = localStorage.getItem("user");

const tbody = document.getElementById("enrollments-table-body");
const messageBox = document.getElementById("enrollment-admin-message");
const refreshButton = document.getElementById("refresh-enrollments");
const logoutButton = document.getElementById("logout-enrollments");


// ========================================
// SECURITY
// ========================================

function ensureAdmin() {

    if (!token) {
        window.location.href = "admin-login.html";
        return false;
    }

    try {

        const user = JSON.parse(userJson || "null");

        if (!user || user.role !== "admin") {
            throw new Error("Not authorized");
        }

    } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "admin-login.html";

        return false;
    }

    return true;
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// MONEY FORMAT
// ========================================

function formatMoney(amount) {

    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0
    }).format(amount || 0);
}


// ========================================
// MESSAGE
// ========================================

function showMessage(text) {

    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.hidden = false;
}


// ========================================
// LOAD ENROLLMENTS
// ========================================

async function loadEnrollments() {

    if (!ensureAdmin()) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7">Loading enrollments...</td>
        </tr>
    `;

    try {

        const response = await fetch(
            "/api/enrollments/admin",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        // ========================================
        // SESSION EXPIRED / NOT AUTHORIZED
        // ========================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "admin-login.html";

            return;
        }


        const result = await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to load enrollments."
            );
        }


        // ========================================
        // NO ENROLLMENTS
        // ========================================

        if (!result.data || result.data.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No premium enrollments found.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // DISPLAY ENROLLMENTS
        // ========================================

        tbody.innerHTML = result.data.map(item => {

            const student =
                typeof item.user === "object" &&
                item.user
                    ? `
                        <strong>
                            ${escapeHTML(item.user.fullName)}
                        </strong>
                        <br>
                        <small>
                            ${escapeHTML(item.user.email)}
                            <br>
                            ${escapeHTML(item.user.phone)}
                        </small>
                    `
                    : "Student";


            // ========================================
            // ACTION BUTTONS
            // ========================================

            let actions = "—";


            if (item.status === "pending") {

                actions = `
                    <div class="enrollment-action-buttons">

                        <button
                            type="button"
                            class="enrollment-action verify"
                            data-id="${escapeHTML(item.id)}"
                            data-status="verified"
                        >
                            Verify
                        </button>

                        <button
                            type="button"
                            class="enrollment-action reject"
                            data-id="${escapeHTML(item.id)}"
                            data-status="rejected"
                        >
                            Reject
                        </button>

                    </div>
                `;
            }


            return `
                <tr>

                    <td>
                        ${escapeHTML(
                            new Date(item.createdAt)
                                .toLocaleString()
                        )}
                    </td>

                    <td>
                        ${student}
                    </td>

                    <td>
                        ${escapeHTML(item.courseName)}
                    </td>

                    <td>
                        ${formatMoney(item.amount)}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(item.paymentReference)}
                        </strong>
                    </td>

                    <td>
                        <span
                            class="enrollment-status-badge ${escapeHTML(item.status)}"
                        >
                            ${escapeHTML(item.status)}
                        </span>
                    </td>

                    <td class="enrollment-actions-cell">
                        ${actions}
                    </td>

                </tr>
            `;

        }).join("");


        // ========================================
        // BUTTON EVENTS
        // ========================================

        tbody
            .querySelectorAll(".enrollment-action")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateEnrollment(
                            button.dataset.id,
                            button.dataset.status
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Admin enrollment error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load enrollments."
        );
    }
}


// ========================================
// VERIFY / REJECT ENROLLMENT
// ========================================

async function updateEnrollment(
    id,
    status
) {

    let note = "";


    // ========================================
    // REJECTION REASON
    // ========================================

    if (status === "rejected") {

        note = window.prompt(
            "Optional reason for rejection:",
            ""
        );


        if (note === null) {
            return;
        }
    }


    try {

        const response = await fetch(
            `/api/enrollments/admin/${encodeURIComponent(id)}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    status,
                    adminNote: note || ""
                })
            }
        );


        // ========================================
        // SESSION EXPIRED
        // ========================================

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


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to update enrollment."
            );
        }


        showMessage(
            result.message
        );


        // Refresh table
        await loadEnrollments();


    } catch (error) {

        console.error(
            "Enrollment update error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to update enrollment."
        );
    }
}


// ========================================
// REFRESH
// ========================================

refreshButton?.addEventListener(
    "click",
    loadEnrollments
);


// ========================================
// LOGOUT
// ========================================

logoutButton?.addEventListener(
    "click",
    () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";
    }
);


// ========================================
// INITIAL LOAD
// ========================================

loadEnrollments();