/*=========================================================
FILE: components.js

LOCATION:
assets/js/

PROJECT:
Machpadaco Global Services

DESCRIPTION:
Loads reusable HTML components into each page.

COMPONENTS:
✓ Header
✓ Footer
✓ Banner

EVENTS DISPATCHED:
✓ headerLoaded
✓ footerLoaded
✓ bannerLoaded

AUTHOR:
Engr. Ejike Njuwa

VERSION:
2.1

LAST UPDATED:
July 2026
=========================================================*/


/*=========================================================
COMPONENT DIRECTORY

If the component folder is ever moved,
only update this variable.
=========================================================*/

const COMPONENT_PATH = "components/";


/*=========================================================
GENERIC COMPONENT LOADER

PARAMETERS

placeholderId  → HTML placeholder ID

fileName       → Component filename

eventName      → Event fired after component loads
=========================================================*/

function loadComponent(placeholderId, fileName, eventName = null) {

    const placeholder = document.getElementById(placeholderId);

    // Exit if placeholder doesn't exist
    if (!placeholder) {
        return;
    }

    fetch(`${COMPONENT_PATH}${fileName}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(`Unable to load ${fileName}`);
            }

            return response.text();

        })

        .then(html => {

            // Insert component
            placeholder.innerHTML = html;

            // Notify other JavaScript files
            if (eventName) {

                document.dispatchEvent(
                    new CustomEvent(eventName)
                );

            }

        })

        .catch(error => {

            console.error(
                `Component Load Error (${fileName}):`,
                error
            );

        });

}


/*=========================================================
LOAD WEBSITE HEADER
=========================================================*/

loadComponent(

    "header-placeholder",

    "header.html",

    "headerLoaded"

);


/*=========================================================
LOAD WEBSITE FOOTER
=========================================================*/

loadComponent(

    "footer-placeholder",

    "footer.html",

    "footerLoaded"

);


/*=========================================================
LOAD WEBSITE BANNER

Only pages that contain:

<div id="banner-placeholder"></div>

will receive this component.
=========================================================*/

loadComponent(

    "banner-placeholder",

    "banner.html",

    "bannerLoaded"

);


/*=========================================================
END OF FILE
=========================================================*/