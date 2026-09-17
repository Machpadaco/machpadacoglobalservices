/*=========================================================
FILE: header.js

LOCATION:
assets/js/

USED BY:
components/header.html

DESCRIPTION:
Controls all header functionality.

FEATURES
✓ Mobile Navigation
✓ Hamburger Menu
✓ Services Dropdown
✓ Profile Dropdown
✓ Active Navigation
✓ Sticky Header
✓ Accessibility
✓ Auto Close Navigation

PROJECT:
Machpadaco Global Services

AUTHOR:
Engr. Ejike Njuwa

VERSION:
2.0
=========================================================*/


/*=========================================================
INITIALIZE HEADER

This function is called AFTER header.html has been loaded
by components.js.
=========================================================*/

function initializeHeader() {

    const menuToggle = document.getElementById("menuToggle");

    const mainNav = document.getElementById("mainNav");

    const profileToggle = document.getElementById("profileToggle");

    const profileDropdown = document.getElementById("profileDropdown");

    const servicesButton = document.getElementById("servicesDropdownBtn");

    const dropdown = servicesButton ?
        servicesButton.nextElementSibling :
        null;

    if (!mainNav) return;



    /*=====================================================
      MOBILE MENU
    =====================================================*/

    if (menuToggle) {

        menuToggle.addEventListener("click", (e) => {

            e.stopPropagation();

            mainNav.classList.toggle("active");

            menuToggle.classList.toggle("active");

            const isExpanded =
                menuToggle.getAttribute("aria-expanded") === "true";

            menuToggle.setAttribute(
                "aria-expanded",
                !isExpanded
            );

        });

    }



    /*=====================================================
      SERVICES DROPDOWN
    =====================================================*/

    if (servicesButton && dropdown) {

        servicesButton.addEventListener("click", function (e) {

            e.preventDefault();

            e.stopPropagation();

            dropdown.classList.toggle("show");

        });

    }



    /*=====================================================
      PROFILE DROPDOWN
    =====================================================*/

    if (profileToggle && profileDropdown) {

        profileToggle.addEventListener("click", function (e) {

            e.stopPropagation();

            profileDropdown.classList.toggle("show");

        });

    }



    /*=====================================================
      CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
    =====================================================*/

    document.addEventListener("click", function () {

        /* Allow menuToggle click to control its own state without immediate closing */

        if (mainNav && mainNav.classList.contains("active")) {

            mainNav.classList.remove("active");

        }


        if (menuToggle && menuToggle.classList.contains("active")) {

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        if (profileDropdown) {

            profileDropdown.classList.remove("show");

        }


        if (dropdown) {

            dropdown.classList.remove("show");

        }

    });



    /*=====================================================
      PREVENT INSIDE CLICK FROM CLOSING
    =====================================================*/

    if (profileDropdown) {

        profileDropdown.addEventListener("click", function (e) {

            e.stopPropagation();

        });

    }


    if (dropdown) {

        dropdown.addEventListener("click", function (e) {

            e.stopPropagation();

        });

    }


    if (mainNav) {

        mainNav.addEventListener("click", function (e) {

            e.stopPropagation();

        });

    }



    /*=====================================================
      AUTO CLOSE MOBILE MENU
    =====================================================*/

    const navLinks =
        document.querySelectorAll("#mainNav a");

    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 768) {

                mainNav.classList.remove("active");

                if (menuToggle) {

                    menuToggle.classList.remove("active");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        });

    });



    /*=====================================================
      ACTIVE PAGE
    =====================================================*/

    const currentPage =
        window.location.pathname.split("/").pop();

    navLinks.forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        }

    });



    /*=====================================================
      HEADER SCROLL EFFECT
    =====================================================*/

    window.addEventListener("scroll", () => {

        const header =
            document.getElementById("header-container");

        if (!header) return;

        if (window.scrollY > 20) {

            header.classList.add("header-scrolled");

        } else {

            header.classList.remove("header-scrolled");

        }

    });

}



/*=========================================================
WAIT FOR COMPONENT TO LOAD

components.js will dispatch this event after loading
header.html.
=========================================================*/

document.addEventListener(
    "headerLoaded",
    initializeHeader
);