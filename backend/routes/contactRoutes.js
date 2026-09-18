const express = require('express');
const path = require('path');
const router = express.Router();

// Import destructured Auth & Admin Middleware
const {
    authMiddleware,
    adminMiddleware
} = require('../middleware/authMiddleware');

// Resolve model path relative to current directory
const Contact = require(
    path.join(__dirname, '../models/Contact')
);


// ====================================================
// PUBLIC ROUTE: Submit Contact Form
// POST /api/contact
// ====================================================

router.post('/', async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            service,
            subject,
            message,
            formType
        } = req.body;


        // ====================================================
        // BASIC REQUIRED FIELDS
        // ====================================================

        if (!name || !email || !service || !message) {

            return res.status(400).json({
                success: false,
                message:
                    'Name, email, service and message are required.'
            });

        }


        // ====================================================
        // DETERMINE FORM TYPE
        // ====================================================

        const submissionType =
            formType === 'website-contact'
                ? 'website-contact'
                : 'home-contact';


        // ====================================================
        // CREATE CONTACT
        // ====================================================

        const newContact = new Contact({

            name: name.trim(),

            email: email.trim().toLowerCase(),

            phone: phone
                ? phone.trim()
                : '',

            service: service.trim(),

            subject: subject
                ? subject.trim()
                : '',

            message: message.trim(),

            formType: submissionType

        });


        // ====================================================
        // SAVE TO MONGODB
        // ====================================================

        await newContact.save();


        // ====================================================
        // SUCCESS RESPONSE
        // ====================================================

        res.status(201).json({

            success: true,

            message:
                'Your message has been submitted successfully.'

        });

    } catch (error) {

        console.error(
            'Contact Form Error:',
            error
        );

        res.status(500).json({

            success: false,

            message:
                'Server error. Please try again later.'

        });

    }

});


// ====================================================
// PROTECTED ADMIN ROUTE: Fetch All Messages
// GET /api/contact/admin/contacts
// ====================================================

router.get(
    '/admin/contacts',
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const contacts =
                await Contact
                    .find()
                    .sort({ createdAt: -1 });


            res.status(200).json({

                success: true,

                count: contacts.length,

                data: contacts

            });

        } catch (error) {

            console.error(
                'Fetch Contacts Error:',
                error
            );

            res.status(500).json({

                success: false,

                message:
                    'Failed to retrieve messages.'

            });

        }

    }
);


// ====================================================
// PROTECTED ADMIN ROUTE: Update Submission Status
// PATCH /api/contact/admin/contacts/:id
// ====================================================

router.patch(
    '/admin/contacts/:id',
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const { status } = req.body;


            const updatedContact =
                await Contact.findByIdAndUpdate(

                    req.params.id,

                    { status },

                    {
                        new: true,
                        runValidators: true
                    }

                );


            if (!updatedContact) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Contact not found.'

                });

            }


            res.status(200).json({

                success: true,

                data: updatedContact

            });

        } catch (error) {

            console.error(
                'Update Contact Error:',
                error
            );

            res.status(500).json({

                success: false,

                message:
                    'Failed to update status.'

            });

        }

    }
);


// ====================================================
// PROTECTED ADMIN ROUTE: Delete Contact Message
// DELETE /api/contact/admin/contacts/:id
// ====================================================

router.delete(
    '/admin/contacts/:id',
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const deletedContact =
                await Contact.findByIdAndDelete(
                    req.params.id
                );


            // ====================================================
            // CONTACT NOT FOUND
            // ====================================================

            if (!deletedContact) {

                return res.status(404).json({

                    success: false,

                    message:
                        'Contact message not found.'

                });

            }


            // ====================================================
            // SUCCESS RESPONSE
            // ====================================================

            res.status(200).json({

                success: true,

                message:
                    'Contact message deleted successfully.'

            });

        } catch (error) {

            console.error(
                'Delete Contact Error:',
                error
            );


            // ====================================================
            // INVALID MONGODB ID
            // ====================================================

            if (
                error.name === 'CastError'
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Invalid contact ID.'

                });

            }


            // ====================================================
            // SERVER ERROR
            // ====================================================

            res.status(500).json({

                success: false,

                message:
                    'Failed to delete contact message.'

            });

        }

    }
);


module.exports = router;