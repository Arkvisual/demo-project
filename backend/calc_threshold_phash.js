import sharp from "sharp";
import { imageHash } from "image-hash";
import similarity from "compute-cosine-similarity";

// Helper: calculate pHash distance
function getPHashDistance(hash1, hash2) {
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

// Helper: normalize a feature vector
function normalizeVector(vec) {
  const mag = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
  return vec.map((v) => v / mag);
}

// 🧠 Main comparison function
export async function compareImages(originalPath, uploadedPath) {
  try {
    // 1️⃣ Generate perceptual hashes (pHash)
    const hashOriginal = await new Promise((resolve, reject) => {
      imageHash(originalPath, 16, true, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    const hashUploaded = await new Promise((resolve, reject) => {
      imageHash(uploadedPath, 16, true, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // 2️⃣ pHash distance
    const phashDistance = getPHashDistance(hashOriginal, hashUploaded);

    // 3️⃣ Extract low-dimension visual features (mean grayscale values)
    const getVector = async (filePath) => {
      const { data, info } = await sharp(filePath)
        .resize(32, 32)
        .raw()
        .toBuffer({ resolveWithObject: true });

      const vec = [];
      for (let i = 0; i < data.length; i += info.channels) {
        vec.push((data[i] + data[i + 1] + data[i + 2]) / 3);
      }
      return normalizeVector(vec);
    };

    const originalVec = await getVector(originalPath);
    const uploadedVec = await getVector(uploadedPath);

    // 4️⃣ Cosine similarity (0–100)
    const simScore = similarity(originalVec, uploadedVec) * 100;

    // 5️⃣ Weighted combination for improved accuracy
    const phashScore = Math.max(0, 100 - phashDistance * 2);
    const combinedScore = (0.6 * phashScore) + (0.4 * simScore);

    // 6️⃣ Classification
    let authenticity = "";
    if (combinedScore >= 80) authenticity = "Genuine";
    else if (combinedScore >= 60) authenticity = "Uncertain";
    else authenticity = "Counterfeit";

    const confidence = Math.min(100, Math.max(0, combinedScore));

    return {
      authenticity,
      confidence: confidence.toFixed(2),
      phash_distance: phashDistance,
      similarity_score: simScore.toFixed(2),
    };

  } catch (error) {
    console.error("Error comparing images:", error);
    return {
      authenticity: "Error",
      confidence: 0,
      error: error.message,
    };
  }
}


