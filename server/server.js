const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize S3 Client
// Note: On EC2, you don't need credentials if you use an IAM Instance Profile
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
});
const upload = multer({ storage: multer.memoryStorage() });

// --- ENDPOINT 1: CPU LOAD GENERATOR ---
app.get("/load/:factor", (req, res) => {
    const factor = parseInt(req.params.factor) || 10;
    const endFactor = factor * 10000000;

    console.log(`Generating CPU load for ${factor} factor...`);

    // This blocks the event loop to spike CPU
    let counter = 0;
    while (counter < endFactor) {
        counter += 1;
    }

    res.json({
        status: "success",
        message: `CPU load generated for ${factor} factor.`,
    });
});

// --- ENDPOINT 2: S3 UPLOADER ---
app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    try {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `uploads/${Date.now()}-${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(params));
        res.json({ status: "success", message: "Image uploaded to S3!" });
    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ error: "Failed to upload to S3" });
    }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
