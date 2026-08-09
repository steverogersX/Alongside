import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import { env } from "@/config/env.ts";

const key = Buffer.from(env.CREDENTIALS_KEY, "hex");

/**
 * Stored as one string so a credential can never be half-written: iv, auth tag
 * and ciphertext travel together or not at all.
 */
export function seal(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function open(sealed: string) {
  const [iv, tag, payload] = sealed.split(".");
  if (!iv || !tag || !payload) throw new Error("Malformed credential");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(payload, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export const last4 = (value: string) => value.slice(-4);
