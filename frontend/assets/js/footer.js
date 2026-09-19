/*=========================================================
FILE: footer.js

LOCATION:
assets/js/

PROJECT:
Machpadaco Global Services

DESCRIPTION:
Controls functionality added to the reusable website footer.

CURRENT FEATURES:
✓ Configures Admin Portal Access link
✓ Works with dynamically loaded footer.html
✓ Keeps Admin Portal on the frontend origin

EVENT:
✓ footerLoaded

AUTHOR:
Engr. Ejike Njuwa
=========================================================*/


/*=========================================================
CONFIGURE ADMIN PORTAL LINK
=========================================================*/

function configureAdminPortalLink() {

    const adminLink =
        document.querySelector(".admin-link");

    // Footer may not contain the link
    if (!adminLink) {
        return;
    }

    /*
        Keep the Admin Login page on the frontend.

        Local:
        http://127.0.0.1:5500/frontend/admin-login.html

        Live:
        https://machpadacoglobalservices.onrender.com/admin-login.html
    */

    adminLink.href =
        "admin-login.html";

}


/*=========================================================
FOOTER LOADED EVENT

components.js dispatches this event after
footer.html has been inserted into the page.
=========================================================*/

document.addEventListener(
    "footerLoaded",
    configureAdminPortalLink
);


/*=========================================================
INITIAL CHECK

Useful in case the footer has already been
inserted before this file finishes loading.
=========================================================*/

configureAdminPortalLink();


/*=========================================================
END OF FILE
=========================================================*/