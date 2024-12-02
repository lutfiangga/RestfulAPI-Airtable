import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // URL frontend Anda
  })
);
const PORT = 3000;

// Konfigurasi Airtable API
const airtableAPI = axios.create({
  baseURL: `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`,
  headers: {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
  },
});

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Fungsi untuk menghapus file lokal
const deleteLocalFiles = (filePaths) => {
  filePaths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};
app.get("/", (_, res) => {
  res.status(200).send("API OK");
});

// Get All Records
app.get("/api/products", async (req, res) => {
  try {
    const response = await airtableAPI.get(
      `/${process.env.AIRTABLE_TABLE_NAME}`
    );
    const records = response.data.records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Record by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await airtableAPI.get(
      `/${process.env.AIRTABLE_TABLE_NAME}/${id}`
    );
    res.json({ id: response.data.id, ...response.data.fields });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Record and Files
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch record details to get image URLs
    const record = await airtableAPI.get(
      `/${process.env.AIRTABLE_TABLE_NAME}/${id}`
    );

    const imagesText = record.data.fields.images || ""; // 'images' field is a comma-separated string
    const imageUrls = imagesText.split(", ").filter((url) => url); // Split into an array

    console.log("Images to delete:", imageUrls);

    // Extract local file paths from image URLs
    const filePaths = imageUrls
      .filter((url) => url.includes("localhost:3000/uploads")) // Ensure only local URLs are processed
      .map((url) => `uploads/${path.basename(url)}`);

    console.log("Local file paths to delete:", filePaths);

    // Delete files locally
    deleteLocalFiles(filePaths);

    // Delete record from Airtable
    await airtableAPI.delete(`/${process.env.AIRTABLE_TABLE_NAME}/${id}`);
    res.json({ message: "Record and associated files deleted successfully" });
  } catch (error) {
    console.error(
      "Error deleting record:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Add Record
app.post("/api/products", upload.array("images", 10), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const imageFiles = req.files;

    // Buat array URL gambar
    const images = imageFiles.map(
      (file) => `http://localhost:3000/uploads/${file.filename}`
    );

    // Kirim data ke Airtable
    const response = await airtableAPI.post(
      `/${process.env.AIRTABLE_TABLE_NAME}`,
      {
        fields: {
          name,
          price,
          description,
          images: images.join(", "), // Gabungkan URL menjadi string teks jika kolom tidak menerima array
        },
      }
    );

    res.status(201).json({ id: response.data.id, ...response.data.fields });
  } catch (error) {
    console.error(
      "Error uploading to Airtable:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});
// Update Record
app.put("/api/products/:id", upload.array("images", 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, removeImages } = req.body;
    const imageFiles = req.files;

    // Ambil data record dari Airtable
    const currentRecord = await airtableAPI.get(
      `/${process.env.AIRTABLE_TABLE_NAME}/${id}`
    );
    const currentImages = currentRecord.data.fields.images
      ? currentRecord.data.fields.images.split(", ") // Pecah string URL menjadi array
      : [];

    // Hapus gambar berdasarkan daftar URL
    let updatedImages = currentImages;
    if (removeImages) {
      const removeList = JSON.parse(removeImages);
      updatedImages = currentImages.filter(
        (image) => !removeList.includes(image)
      );

      // Hapus file lokal
      const localPaths = removeList
        .filter((url) => url.includes("localhost:3000/uploads"))
        .map((url) => `uploads/${path.basename(url)}`);
      deleteLocalFiles(localPaths);
    }

    // Tambahkan gambar baru
    if (imageFiles && imageFiles.length > 0) {
      const newImages = imageFiles.map(
        (file) => `http://localhost:3000/uploads/${file.filename}`
      );
      updatedImages = [...updatedImages, ...newImages];
    }

    // Gabungkan URL menjadi string teks untuk Airtable
    const imagesText = updatedImages.join(", ");

    // Update record di Airtable
    const response = await airtableAPI.patch(
      `/${process.env.AIRTABLE_TABLE_NAME}/${id}`,
      {
        fields: {
          name,
          price,
          description,
          images: imagesText,
        },
      }
    );

    res.json({ id: response.data.id, ...response.data.fields });
  } catch (error) {
    console.error(
      "Error updating record:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
