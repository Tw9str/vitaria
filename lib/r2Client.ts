import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config";

const { accountId, accessKeyId, secretAccessKey, bucket } = config.r2;

/** Singleton S3-compatible client pointed at Cloudflare R2. */
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

/** Target bucket name resolved from env at startup. */
export const R2_BUCKET = bucket;
