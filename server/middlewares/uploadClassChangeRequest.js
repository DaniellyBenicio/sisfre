import multer from "multer";
import path from "path";
import fs from "fs";

const storageDir = "uploads/class_change_requests";

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${baseName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === "application/pdf";
  if (isPdf) {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos PDF são permitidos."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // limite de 5MB
  },
});

export default upload;
