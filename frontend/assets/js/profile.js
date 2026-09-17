// ========================================
// MACHpadaco Global Services
// Profile Page
// ========================================

// ========================================
// IMPORT SHARED AUTH FUNCTIONS
// ========================================

import {
    updateNavbar,
    logoutUser
} from "./auth.js";


// ========================================
// API
// ========================================

const USER_API_URL =
    "http://localhost:5000/api/user";


// ========================================
// PROFILE INITIALIZATION
// ========================================
//
// IMPORTANT:
// This file is dynamically imported by main.js.
// Therefore, do NOT wrap the code in
// DOMContentLoaded.
// ========================================

const userJson =
    localStorage.getItem("user");


// ========================================
// CHECK LOGIN
// ========================================

if (!userJson) {

    window.location.href =
        "login.html";

} else {

    let user;


    // ========================================
    // LOAD USER
    // ========================================

    try {

        user =
            JSON.parse(userJson);

    } catch (err) {

        console.error(
            "User Data Error:",
            err
        );

        localStorage.removeItem(
            "user"
        );

        localStorage.removeItem(
            "token"
        );

        window.location.href =
            "login.html";

    }


    // ========================================
    // CONTINUE ONLY IF USER DATA IS VALID
    // ========================================

    if (user) {


        // ========================================
        // ELEMENTS
        // ========================================

        const editName =
            document.getElementById(
                "editName"
            );

        const editPhone =
            document.getElementById(
                "editPhone"
            );

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileEmail =
            document.getElementById(
                "profileEmail"
            );

        const profilePhone =
            document.getElementById(
                "profilePhone"
            );

        const saveBtn =
            document.getElementById(
                "saveProfileBtn"
            );

        const imageUpload =
            document.getElementById(
                "imageUpload"
            );

        const profileImage =
            document.getElementById(
                "profileImage"
            );

        const changePhotoBtn =
            document.getElementById(
                "changePhotoBtn"
            );


        // ========================================
        // LOAD USER INFORMATION
        // ========================================

        if (profileName) {

            profileName.textContent =
                user.fullName ||
                "N/A";

        }


        if (profileEmail) {

            profileEmail.textContent =
                user.email ||
                "N/A";

        }


        if (profilePhone) {

            profilePhone.textContent =
                user.phone ||
                "N/A";

        }


        // ========================================
        // LOAD EDIT FIELDS
        // ========================================

        if (editName) {

            editName.value =
                user.fullName ||
                "";

        }


        if (editPhone) {

            editPhone.value =
                user.phone ||
                "";

        }


        // ========================================
        // LOAD PROFILE IMAGE
        // ========================================

        if (profileImage) {

            if (
                user.profileImage &&
                user.profileImage !== "undefined" &&
                user.profileImage !== "null"
            ) {

                profileImage.src =
                    user.profileImage;

            } else {

                profileImage.src =
                    "assets/img/default-user.png";

            }

        }


        // ========================================
        // SAVE PROFILE
        // ========================================

        if (saveBtn) {

            saveBtn.addEventListener(
                "click",
                async () => {


                    // ========================================
                    // VALIDATE FIELDS
                    // ========================================

                    if (
                        !editName ||
                        !editPhone
                    ) {

                        return;

                    }


                    const fullName =
                        editName.value.trim();

                    const phone =
                        editPhone.value.trim();


                    if (!fullName || !phone) {

                        alert(
                            "Please fill in your name and phone number."
                        );

                        return;

                    }


                    // ========================================
                    // DISABLE BUTTON
                    // ========================================

                    saveBtn.disabled =
                        true;

                    saveBtn.textContent =
                        "Saving...";


                    try {


                        // ========================================
                        // UPDATE PROFILE
                        // ========================================

                        const res =
                            await fetch(
                                `${USER_API_URL}/update-profile`,
                                {
                                    method: "PUT",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            userId:
                                                user.id ||
                                                user._id,

                                            fullName,

                                            phone
                                        })
                                }
                            );


                        // ========================================
                        // READ RESPONSE
                        // ========================================

                        const data =
                            await res.json();


                        // ========================================
                        // SUCCESS
                        // ========================================

                        if (res.ok) {


                            const updatedUser = {
                                ...user,
                                ...(data.user || {}),
                                fullName,
                                phone
                            };


                            // ========================================
                            // SAVE UPDATED USER
                            // ========================================

                            localStorage.setItem(
                                "user",
                                JSON.stringify(
                                    updatedUser
                                )
                            );


                            user =
                                updatedUser;


                            // ========================================
                            // UPDATE PROFILE DISPLAY
                            // ========================================

                            if (profileName) {

                                profileName.textContent =
                                    user.fullName;

                            }


                            if (profilePhone) {

                                profilePhone.textContent =
                                    user.phone;

                            }


                            // ========================================
                            // UPDATE NAVBAR
                            // ========================================

                            updateNavbar();


                            alert(
                                "Profile updated successfully!"
                            );


                        } else {

                            alert(
                                data.message ||
                                "Profile update failed."
                            );

                        }


                    } catch (err) {

                        console.error(
                            "Update Error:",
                            err
                        );


                        alert(
                            "Unable to connect to the server."
                        );

                    } finally {

                        // ========================================
                        // RESTORE BUTTON
                        // ========================================

                        saveBtn.disabled =
                            false;

                        saveBtn.textContent =
                            "Save Changes";

                    }

                }
            );

        }


        // ========================================
        // CHANGE PROFILE PHOTO
        // ========================================

        if (
            changePhotoBtn &&
            imageUpload
        ) {


            // ========================================
            // OPEN FILE SELECTOR
            // ========================================

            changePhotoBtn.addEventListener(
                "click",
                () => {

                    imageUpload.click();

                }
            );


            // ========================================
            // FILE SELECTED
            // ========================================

            imageUpload.addEventListener(
                "change",
                async () => {


                    const file =
                        imageUpload.files[0];


                    if (!file) {

                        return;

                    }


                    // ========================================
                    // BASIC FILE VALIDATION
                    // ========================================

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        alert(
                            "Please select an image file."
                        );

                        imageUpload.value =
                            "";

                        return;

                    }


                    // ========================================
                    // CREATE FORM DATA
                    // ========================================

                    const formData =
                        new FormData();


                    formData.append(
                        "image",
                        file
                    );


                    formData.append(
                        "userId",
                        user.id ||
                        user._id
                    );


                    // ========================================
                    // DISABLE BUTTON
                    // ========================================

                    changePhotoBtn.disabled =
                        true;

                    changePhotoBtn.textContent =
                        "Uploading...";


                    try {


                        // ========================================
                        // UPLOAD IMAGE
                        // ========================================

                        const res =
                            await fetch(
                                `${USER_API_URL}/upload-profile`,
                                {
                                    method: "POST",
                                    body: formData
                                }
                            );


                        // ========================================
                        // READ RESPONSE
                        // ========================================

                        const data =
                            await res.json();


                        // ========================================
                        // SUCCESS
                        // ========================================

                        if (res.ok) {


                            const updatedUser = {
                                ...user,
                                ...(data.user || {})
                            };


                            // ========================================
                            // USE RETURNED IMAGE URL
                            // ========================================

                            if (
                                data.imageUrl
                            ) {

                                updatedUser.profileImage =
                                    data.imageUrl;

                            }


                            // ========================================
                            // SAVE USER
                            // ========================================

                            localStorage.setItem(
                                "user",
                                JSON.stringify(
                                    updatedUser
                                )
                            );


                            user =
                                updatedUser;


                            // ========================================
                            // UPDATE PROFILE IMAGE
                            // ========================================

                            if (
                                profileImage &&
                                user.profileImage
                            ) {

                                profileImage.src =
                                    user.profileImage;

                            }


                            // ========================================
                            // UPDATE NAVBAR
                            // ========================================

                            updateNavbar();


                            alert(
                                "Profile image uploaded successfully!"
                            );


                        } else {

                            alert(
                                data.message ||
                                "Image upload failed."
                            );

                        }


                    } catch (err) {

                        console.error(
                            "Upload Error:",
                            err
                        );


                        alert(
                            "Unable to connect to the server."
                        );


                    } finally {

                        // ========================================
                        // RESTORE BUTTON
                        // ========================================

                        changePhotoBtn.disabled =
                            false;

                        changePhotoBtn.textContent =
                            "Change Photo";


                        // ========================================
                        // CLEAR FILE INPUT
                        // ========================================

                        imageUpload.value =
                            "";

                    }

                }
            );

        }


        // ========================================
        // UPDATE NAVBAR
        // ========================================

        updateNavbar();


        // ========================================
        // NOTE ABOUT LOGOUT
        // ========================================
        //
        // Logout is handled centrally by auth.js.
        // We intentionally do NOT attach another
        // logout listener here.
        //
        // This prevents duplicate logout handlers.
        // ========================================

    }

}