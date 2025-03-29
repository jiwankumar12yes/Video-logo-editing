const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/upload-video", upload.single("video"), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

app.post("/upload-logo", upload.single("logo"), (req, res) => {
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

app.post("/process-video", (req, res) => {
  console.log("Received request body:", req.body);

  const { videoPath, logoPath, positionX, positionY, logoSize } = req.body;

  if (!videoPath || !logoPath) {
    console.error("Error: Missing videoPath or logoPath in request!");
    return res.status(400).json({ error: "Missing videoPath or logoPath" });
  }

  const absoluteVideoPath = videoPath.replace(
    "http://localhost:5000",
    __dirname
  );
  const absoluteLogoPath = logoPath.replace("http://localhost:5000", __dirname);

  console.log("Absolute Video Path:", absoluteVideoPath);
  console.log("Absolute Logo Path:", absoluteLogoPath);

  const outputFileName = `output-${Date.now()}.mp4`;
  const outputFilePath = path.join(__dirname, "uploads", outputFileName);
  const outputURL = `/uploads/${outputFileName}`;

  ffmpeg(absoluteVideoPath)
    .input(absoluteLogoPath)
    .complexFilter([
      `[1:v]scale=${logoSize}:-1[logo]`,
      `[0:v][logo]overlay=${positionX}:${positionY}`,
    ])
    .output(outputFilePath)
    .on("end", () => {
      console.log("Processing finished:", outputURL);
      res.json({ processedVideo: outputURL });
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).json({ error: err.message });
    })
    .run();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(5000, () => console.log("Server running on port 5000"));
