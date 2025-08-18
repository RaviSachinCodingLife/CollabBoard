const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadBufferToS3(
  key,
  buffer,
  contentType = "application/octet-stream"
) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  };

  if (process.env.S3_PUBLIC === "true") {
    params.ACL = "public-read";
  }

  const cmd = new PutObjectCommand(params);
  await s3.send(cmd);
  return `${process.env.CLOUDFRONT_URL}/${key}`;
}

module.exports = { uploadBufferToS3 };
