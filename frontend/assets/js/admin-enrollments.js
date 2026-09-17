// ========================================
// MACHpadaco Global Services
// Admin Premium Enrollments
// ========================================


// ========================================
// API BASE URL
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


// ========================================
// ENROLLMENT ELEMENTS
// ========================================

const tbody =
    document.getElementById("enrollments-table-body");

const messageBox =
    document.getElementById("enrollment-admin-message");

const refreshButton =
    document.getElementById("refresh-enrollments");

const logoutButton =
    document.getElementById("logout-enrollments");


// ========================================
// COURSE PRICING ELEMENTS
// ========================================

const coursePricingBody =
    document.getElementById("course-pricing-table-body");

const coursePricingMessage =
    document.getElementById("course-pricing-message");


// ========================================
// SECURITY
// ========================================

function ensureAdmin() {

    if (!token) {

        window.location.href =
            "admin-login.html";

        return false;
    }


    try {

        const user =
            JSON.parse(userJson || "null");


        if (!user || user.role !== "admin") {

            throw new Error(
                "Not authorized"
            );
        }

    } catch (error) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}


// ========================================
// HANDLE AUTH FAILURE
// ========================================

function handleAuthFailure() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
        "admin-login.html";
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

    messageBox.textContent =
        text;

    messageBox.hidden = false;
}


// ========================================
// COURSE PRICING MESSAGE
// ========================================

function showCoursePricingMessage(text) {

    if (!coursePricingMessage) return;

    coursePricingMessage.textContent =
        text;

    coursePricingMessage.hidden = false;
}


// ========================================
// LOAD COURSE PRICING
// ========================================

async function loadCoursePricing() {

    if (!ensureAdmin()) return;


    if (!coursePricingBody) {
        return;
    }


    coursePricingBody.innerHTML = `
        <tr>
            <td colspan="4">
                Loading course pricing...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/admin/courses`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
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

            handleAuthFailure();

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
                "Unable to load course pricing."
            );
        }


        // ========================================
        // NO COURSES
        // ========================================

        if (
            !result.data ||
            result.data.length === 0
        ) {

            coursePricingBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No courses found.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // DISPLAY COURSES
        // ========================================

        coursePricingBody.innerHTML =
            result.data.map(course => {

                const slug =
                    escapeHTML(course.slug);

                const name =
                    escapeHTML(course.name);

                const description =
                    escapeHTML(course.description);

                const price =
                    Number(course.price) || 0;


                return `
                    <tr>

                        <td
                            class="course-pricing-course"
                        >

                            <strong>
                                ${name}
                            </strong>

                            <small>
                                ${description}
                            </small>

                        </td>


                        <td
                            class="course-pricing-current"
                        >
                            ${formatMoney(price)}
                        </td>


                        <td
                            class="course-pricing-new"
                        >

                            <input
                                type="number"
                                class="course-price-input"
                                data-slug="${slug}"
                                value="${price}"
                                min="1"
                                step="1"
                                inputmode="numeric"
                                aria-label="New price for ${name}"
                            >

                        </td>


                        <td
                            class="course-pricing-action"
                        >

                            <button
                                type="button"
                                class="course-price-update"
                                data-slug="${slug}"
                            >
                                Update Price
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");


        // ========================================
        // PRICE UPDATE BUTTONS
        // ========================================

        coursePricingBody
            .querySelectorAll(".course-price-update")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateCoursePrice(
                            button.dataset.slug,
                            button
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Course pricing error:",
            error
        );


        coursePricingBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Unable to load course pricing.
                </td>
            </tr>
        `;


        showCoursePricingMessage(
            error.message ||
            "Unable to load course pricing."
        );
    }
}


// ========================================
// UPDATE COURSE PRICE
// ========================================

async function updateCoursePrice(
    slug,
    button
) {

    if (!ensureAdmin()) return;


    const input =
        coursePricingBody?.querySelector(
            `.course-price-input[data-slug="${CSS.escape(slug)}"]`
        );


    if (!input) {

        showCoursePricingMessage(
            "Unable to find the course price field."
        );

        return;
    }


    const price =
        Number(input.value);


    // ========================================
    // VALIDATE PRICE
    // ========================================

    if (
        !Number.isFinite(price) ||
        !Number.isInteger(price) ||
        price <= 0
    ) {

        showCoursePricingMessage(
            "Please enter a valid whole-number course fee greater than ₦0."
        );

        input.focus();

        return;
    }


    // ========================================
    // CONFIRM CHANGE
    // ========================================

    const confirmed =
        window.confirm(
            `Update this course fee to ${formatMoney(price)}?`
        );


    if (!confirmed) {
        return;
    }


    // ========================================
    // DISABLE BUTTON
    // ========================================

    if (button) {

        button.disabled = true;

        button.textContent =
            "Updating...";
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/admin/courses/${encodeURIComponent(slug)}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
                },

                body: JSON.stringify({
                    price
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

            handleAuthFailure();

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
                "Unable to update course price."
            );
        }


        // ========================================
        // SUCCESS
        // ========================================

        showCoursePricingMessage(
            result.message ||
            "Course price updated successfully."
        );


        // Reload pricing so the current fee
        // immediately reflects MongoDB.
        await loadCoursePricing();


    } catch (error) {

        console.error(
            "Course price update error:",
            error
        );


        showCoursePricingMessage(
            error.message ||
            "Unable to update course price."
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Update Price";
        }
    }
}


// ========================================
// LOAD ENROLLMENTS
// ========================================

async function loadEnrollments() {

    if (!ensureAdmin()) return;


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td colspan="8">
                Loading enrollments...
            </td>
        </tr>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/enrollments/admin`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
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

            handleAuthFailure();

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
                "Unable to load enrollments."
            );
        }


        // ========================================
        // NO ENROLLMENTS
        // ========================================

        if (
            !result.data ||
            result.data.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        No premium enrollments found.
                    </td>
                </tr>
            `;

            return;
        }


        // ========================================
        // DISPLAY ENROLLMENTS
        // ========================================

        tbody.innerHTML =
            result.data.map(item => {


                // ========================================
                // STUDENT
                // ========================================

                const studentName =
                    typeof item.user === "object" &&
                    item.user
                        ? escapeHTML(
                            item.user.fullName
                        )
                        : "Student";


                // ========================================
                // EMAIL
                // ========================================

                const studentEmail =
                    typeof item.user === "object" &&
                    item.user
                        ? escapeHTML(
                            item.user.email
                        )
                        : "";


                // ========================================
                // ACTION BUTTONS
                // ========================================

                let actions = "—";


                if (
                    item.status === "pending"
                ) {

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


                // ========================================
                // ROW
                // ========================================

                return `
                    <tr>


                        <!-- DATE -->

                        <td>

                            ${escapeHTML(
                                new Date(
                                    item.createdAt
                                ).toLocaleString()
                            )}

                        </td>


                        <!-- STUDENT -->

                        <td>

                            <strong>
                                ${studentName}
                            </strong>

                        </td>


                        <!-- EMAIL -->

                        <td>

                            <a
                                href="mailto:${studentEmail}"
                            >
                                ${studentEmail}
                            </a>

                        </td>


                        <!-- COURSE -->

                        <td>

                            ${escapeHTML(
                                item.courseName
                            )}

                        </td>


                        <!-- AMOUNT -->

                        <td>

                            ${formatMoney(
                                item.amount
                            )}

                        </td>


                        <!-- PAYMENT REFERENCE -->

                        <td>

                            <strong>
                                ${escapeHTML(
                                    item.paymentReference
                                )}
                            </strong>

                        </td>


                        <!-- STATUS -->

                        <td>

                            <span
                                class="enrollment-status-badge ${escapeHTML(item.status)}"
                            >
                                ${escapeHTML(item.status)}
                            </span>

                        </td>


                        <!-- ACTION -->

                        <td
                            class="enrollment-actions-cell"
                        >

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

    if (
        status === "rejected"
    ) {

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
            `${API_BASE_URL}/api/enrollments/admin/${encodeURIComponent(id)}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`
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

            handleAuthFailure();

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


        // ========================================
        // REFRESH ENROLLMENTS
        // ========================================

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
    async () => {

        await loadCoursePricing();
        await loadEnrollments();

    }
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

if (ensureAdmin()) {

    loadCoursePricing();

    loadEnrollments();

}