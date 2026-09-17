// ========================================
// Machpadaco Premium Course Catalog
// ========================================
// Course names and descriptions are defined here.
// Course prices are used as initial/default values
// when a course is first created in MongoDB.
//
// After the course has been created in MongoDB,
// the Admin Panel controls the live course price.

const courses = {
    "software-development-premium": {
        name: "Software & Web Development",
        price: Number(process.env.COURSE_PRICE_SOFTWARE || 0),
        description:
            "Structured software and web development training with practical assignments and real-world projects."
    },

    "phone-engineering-premium": {
        name: "Phone Engineering & Repairs",
        price: Number(process.env.COURSE_PRICE_PHONE || 0),
        description:
            "Practical phone diagnostics, troubleshooting, repair workflow and workshop skills."
    },

    "digital-marketing-premium": {
        name: "Digital Marketing",
        price: Number(process.env.COURSE_PRICE_MARKETING || 0),
        description:
            "Practical digital marketing, content planning, social media promotion, campaigns and lead generation."
    },

    "property-management-virtual-assistance-premium": {
        name: "Property Management Virtual Assistance",
        price: Number(process.env.COURSE_PRICE_PROPERTY_VA || 0),
        description:
            "Practical virtual-assistance skills for property listings, tenant communication, scheduling and administration."
    }
};

function getCourse(courseSlug) {
    return courses[courseSlug] || null;
}

module.exports = {
    courses,
    getCourse
};