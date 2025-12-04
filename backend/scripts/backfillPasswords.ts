import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
import argon2 from "argon2";
import prisma from "../src/prisma.ts";

dotenv.config();

async function main() {
  const users = await prisma.user.findMany({ where: { password: null } });
  if (users.length === 0) {
    console.log("No users without password found.");
    return;
  }

  const outLines: string[] = ["email,token"];

  for (const u of users) {
    const token = crypto.randomBytes(16).toString("hex");
    const hashed = await argon2.hash(token);
    await prisma.user.update({ where: { id: u.id }, data: { password: hashed } });
    outLines.push(`${u.email},${token}`);
    console.log(`Backfilled password for ${u.email}`);
  }

  const outPath = "backfilled-passwords.csv";
  fs.writeFileSync(outPath, outLines.join("\n"), { encoding: "utf8" });
  console.log(`Wrote plaintext tokens to ${outPath}. Delete this file after use.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
