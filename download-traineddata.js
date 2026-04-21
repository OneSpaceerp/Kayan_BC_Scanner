import fs from "fs";
import https from "https";
import path from "path";
import zlib from "zlib";

const TARGET_DIR = path.join(process.cwd(), "public", "traineddata");

const FILES = [
  {
    name: "eng.traineddata",
    url: "https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz",
    isGzipped: true,
  },
  {
    name: "ara.traineddata",
    url: "https://tessdata.projectnaptha.com/4.0.0/ara.traineddata.gz",
    isGzipped: true,
  },
];

async function downloadFile(url, dest, isGzipped) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
          return;
        }

        const fileStream = fs.createWriteStream(dest);

        if (isGzipped) {
          const unzip = zlib.createGunzip();
          response.pipe(unzip).pipe(fileStream);
          unzip.on("error", reject);
        } else {
          response.pipe(fileStream);
        }

        fileStream.on("finish", () => {
          fileStream.close();
          resolve();
        });
        fileStream.on("error", (err) => {
          fs.unlink(dest, () => reject(err));
        });
      })
      .on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  console.log("Downloading Tesseract traineddata for offline OCR...");
  for (const file of FILES) {
    const dest = path.join(TARGET_DIR, file.name);
    if (fs.existsSync(dest)) {
      console.log(`✅ ${file.name} already exists. Skipping.`);
      continue;
    }
    console.log(`⬇️  Downloading ${file.name}...`);
    try {
      await downloadFile(file.url, dest, file.isGzipped);
      console.log(`✅ Success: ${file.name}`);
    } catch (err) {
      console.error(`❌ Failed downloading ${file.name}:`, err.message);
    }
  }
  console.log("Download complete!");
}

main();
