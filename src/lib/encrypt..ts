import { createCipheriv, createDecipheriv } from "crypto";

const secret: Buffer = Buffer.from(process.env.ENCRYPTION_SECRET, "hex");

export const encrypt = (data: any): string => {
  // convert data to string
  const dataString = JSON.stringify(data);
  // create cipher instance with our algorithh, secret and iv
  const cipher = createCipheriv("aes-256-ecb", secret, null);
  // update the cipher with the data to encrypt
  let encrypted = cipher.update(dataString, "utf8", "base64");
  // finalize the encryption process
  encrypted += cipher.final("base64");
  // return the iv and encrypted data
  return encrypted;
};

const decrypt = (iv: string, data: string): string => {
  // turn the iv back to buffer
  // create the decipher instance
  const decipher = createDecipheriv("aes-256-ecb", secret, null);
  // update the decipher with the encrypted data
  let decrypted = decipher.update(data, "base64", "utf8");
  // finalize the decryption process
  decrypted += decipher.final("utf8");
  // return the decrypted data
  return decrypted;
};
