const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- AWS S3 Setup ---
const s3Client = new S3Client({
  region: "ap-south-1",
  followRegionRedirects: true,
});
const upload = multer({ storage: multer.memoryStorage() });

// --- CREATE A ROUTER FOR THE /api PREFIX ---
const apiRouter = express.Router();

// --- ENDPOINT 1: CPU LOAD GENERATOR ---
// This will now respond to /api/load/:factor
apiRouter.get("/load/:factor", (req, res) => {
  const factor = parseInt(req.params.factor) || 10;
  const endFactor = factor * 10000000;

  console.log(`Generating CPU load for ${factor} factor...`);

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
// This will now respond to /api/upload
apiRouter.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  try {
    const params = {
      Bucket: "aws-ec2-vpc-exercise",
      Key: `uploads/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));
    res.json({ status: "success", message: "Image uploaded to S3!" });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ error: "Failed to upload to S3", message: error });
  }
});

// --- ENDPOINT 3: METADATA ---
// This will now respond to /api/metadata
apiRouter.get("/metadata", async (req, res) => {
  try {
    const tokenRes = await fetch("http://169.254.169.254/latest/api/token", {
      method: "PUT",
      headers: { "X-aws-ec2-metadata-token-ttl-seconds": "21600" },
    });
    const token = await tokenRes.text();

    const azRes = await fetch(
      "http://169.254.169.254/latest/meta-data/placement/availability-zone",
      { headers: { "X-aws-ec2-metadata-token": token } }
    );
    const az = await azRes.text();

    const idRes = await fetch(
      "http://169.254.169.254/latest/meta-data/instance-id",
      { headers: { "X-aws-ec2-metadata-token": token } }
    );
    const instanceId = await idRes.text();

    res.json({ az, instanceId });
  } catch (err) {
    console.error("Metadata fetch error:", err);
    res.json({ az: "error-zone", instanceId: "error-instance", message: err });
  }
});

// --- MOUNT THE ROUTER ---
// This ensures that all routes above are prefixed with /api
app.use("/api", apiRouter);

const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT} with /api prefix`);
});