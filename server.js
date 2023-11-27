// server.js
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { log } = require("console");
const app = express();
const port = 3001;

// Use the cors middleware to enable CORS
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const endapendentesStorage = multer.diskStorage({
  destination: "./endapendentes",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const endapendentesUpload = multer({ storage: endapendentesStorage });

// Serve static files from the "uploads" directory
app.use("/endapendentes", express.static("endapendentes"));

// Handle file upload
app.post(
  "/uploadEndapendentes",
  endapendentesUpload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.json({ filename: req.file.filename });
  }
);

// List all files in the "uploads" directory
app.get("/listEndapendentes", (req, res) => {
  fs.readdir("./endapendentes", (err, files) => {
    if (err) {
      return res.status(500).send("Error listing files.");
    }

    const fileDetails = files.map((file) => {
      const filePath = path.join(__dirname, "endapendentes", file);
      return {
        filename: file,
        // You can add more metadata here if needed
      };
    });

    res.json(fileDetails);
  });
});

// Configure multer for file uploads
const plenariosStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const plenarioKey = req.body.plenarioKey; // Assuming the plenarioKey is sent in the request body
    const plenarioPath = `./plenarios/${plenarioKey}`;

    cb(null, plenarioPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const mocoesUpload = multer({ storage: plenariosStorage });

// Serve static files from the "uploads" directory
app.use("/plenarios", express.static("plenarios"));

// Handle file upload
app.post("/uploadMocoes", mocoesUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.json({ filename: req.file.filename });
});

// List all files for all plenarios
app.get('/listAllFiles', (req, res) => {
  const plenariosDirectory = path.join(__dirname, 'plenarios');

  // Read all plenario directories
  fs.readdir(plenariosDirectory, (err, plenarioKeys) => {
    if (err) {
      return res.status(500).send('Error listing plenarios.');
    }

    const allFiles = [];

    // Iterate over each plenario and list its files
    plenarioKeys.forEach((plenarioKey) => {
      const plenarioDirectory = path.join(plenariosDirectory, plenarioKey);

      const files = fs.readdirSync(plenarioDirectory).map((file) => ({
        filename: file,
        plenarioKey, // Include plenarioKey in file details
      }));

      allFiles.push(...files);
    });

    res.json(allFiles);
  });
});

// Define a sample route
app.get("/", (req, res) => {
  res.send("Hello from your Node.js server!");
});

// Example: Adding an API route
app.get("/api/data", (req, res) => {
  // Your logic to fetch and return data
  res.json({ message: "Data from the server!" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
