const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({

    // ========================================
    // BASIC CONTACT INFORMATION
    // ========================================

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    phone: {
        type: String,
        trim: true,
        default: ''
    },


    // ========================================
    // SERVICE INFORMATION
    // ========================================

    service: {
        type: String,
        required: true,
        trim: true
    },


    // ========================================
    // ENQUIRY DETAILS
    // ========================================

    subject: {
        type: String,
        trim: true,
        default: ''
    },

    message: {
        type: String,
        required: true,
        trim: true
    },


    // ========================================
    // FORM SOURCE
    // ========================================

    formType: {
        type: String,
        enum: [
            'home-contact',
            'website-contact'
        ],
        default: 'home-contact'
    },


    // ========================================
    // ADMIN STATUS
    // ========================================

    status: {
        type: String,
        enum: [
            'pending',
            'reviewed',
            'contacted'
        ],
        default: 'pending'
    },


    // ========================================
    // TIMESTAMP
    // ========================================

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Contact', contactSchema);