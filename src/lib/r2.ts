import CryptoJS from "crypto-js";
import { getServerEnv } from "./env";

function sha256Hex(message: string) {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

function hmacSha256Hex(key: string, message: string) {
  return CryptoJS.HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
}

function buildSignature(secret: string, date: string, canonicalRequest: string) {
  const dateKey = hmacSha256Hex(secret, date);
  const regionKey = hmacSha256Hex(dateKey, "auto");
  const serviceKey = hmacSha256Hex(regionKey, "s3");
  const signingKey = hmacSha256Hex(serviceKey, "aws4_request");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    `${date}/auto/s3/aws4_request`,
    sha256Hex(canonicalRequest),
  ].join("\n");
  return hmacSha256Hex(signingKey, stringToSign);
}

export async function putObject(key: string, body: ArrayBuffer, contentType: string) {
  const env = getServerEnv();
  const date = new Date().toUTCString();
  const dateStr = date.slice(0, 8);
  const payloadHash = sha256Hex(bodyToUtf8(body));
  const canonicalHeaders = `content-type:${contentType}\nhost:${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com\nx-amz-date:${date}\n`;
  const signedHeaders = "content-type;host;x-amz-date";

  const canonicalRequest = [
    "PUT",
    `/${key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const signature = buildSignature(env.R2_SECRET_ACCESS_KEY, dateStr, canonicalRequest);
  const authorization = `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${dateStr}/auto/s3/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "X-Amz-Date": date,
        Authorization: authorization,
      },
      body: new Uint8Array(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`R2 upload failed: ${res.status} ${text}`);
  }

  return { key, url: `https://pub-${env.R2_ACCOUNT_ID}.r2.dev/${key}` };
}

function bodyToUtf8(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}
