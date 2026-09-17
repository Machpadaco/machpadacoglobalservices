const multer = require("multer");
const cloudinary = require("./cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "machpadaco_profiles",
            format: file.mimetype.split("/")[1],
            public_id: Date.now() + "-" + file.originalname,
        };
    },
});

const upload = multer({ storage });

module.exports = upload;