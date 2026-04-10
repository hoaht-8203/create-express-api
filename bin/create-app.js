#!/usr/bin/env node

import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";
import pc from "picocolors";
import prompts from "prompts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, "../template");

function replaceText(content, replacements) {
  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(key, "g");
    result = result.replace(regex, value);
  }
  return result;
}

async function replacePlaceholdersRecursively(dir, replacements) {
  const items = await fs.readdir(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await replacePlaceholdersRecursively(fullPath, replacements);
      continue;
    }

    const fileName = path.basename(fullPath);
    const isTextFile =
      [
        ".js",
        ".cjs",
        ".mjs",
        ".ts",
        ".json",
        ".md",
        ".yml",
        ".yaml",
        ".txt",
        ".env",
        ".sh",
      ].some((ext) => fullPath.endsWith(ext)) ||
      fileName === "Dockerfile" ||
      fileName === ".env.example" ||
      fileName === ".env";

    if (!isTextFile) continue;

    const content = await fs.readFile(fullPath, "utf8");
    const updated = replaceText(content, replacements);
    await fs.writeFile(fullPath, updated, "utf8");
  }
}

function generateSecret(length = 48) {
  return crypto.randomBytes(length).toString("base64url");
}

function upsertEnvValue(content, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escapedKey}=.*$`, "m");
  const line = `${key}=${value}`;

  if (regex.test(content)) {
    return content.replace(regex, line);
  }

  const normalized = content.endsWith("\n") ? content : `${content}\n`;
  return `${normalized}${line}\n`;
}

async function writeEnvFile(envPath, values) {
  let envContent = "";

  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, "utf8");
  }

  for (const [key, value] of Object.entries(values)) {
    envContent = upsertEnvValue(envContent, key, value);
  }

  await fs.writeFile(envPath, envContent, "utf8");
}

async function main() {
  const argProjectName = process.argv[2];

  const baseProjectName = argProjectName || "my-app";
  const defaultDbName = argProjectName ? `${argProjectName}_db` : "my_app_db";

  const firstResponse = await prompts(
    [
      {
        type: argProjectName ? null : "text",
        name: "projectName",
        message: "Tên project mới là gì?",
      },
      {
        type: "text",
        name: "port",
        message: "Port mặc định?",
        initial: "3000",
      },
      {
        type: "text",
        name: "dbName",
        message: "Tên database?",
        initial: defaultDbName,
      },
      {
        type: (prev) => (prev ? "text" : null),
        name: "databaseUrl",
        message: "DATABASE_URL?",
        initial: (prev) =>
          `"postgresql://postgres:postgres@localhost:5432/${prev}?schema=public"`,
      },
      {
        type: "text",
        name: "accessSecret",
        message: "ACCESS_SECRET? (để trống sẽ tự generate)",
        initial: "",
      },
      {
        type: "text",
        name: "refreshSecret",
        message: "REFRESH_SECRET? (để trống sẽ tự generate)",
        initial: "",
      },
      {
        type: "text",
        name: "accessTokenExpiresIn",
        message: "ACCESS_TOKEN_EXPIRES_IN?",
        initial: "1m",
      },
      {
        type: "text",
        name: "refreshTokenExpiresIn",
        message: "REFRESH_TOKEN_EXPIRES_IN?",
        initial: "7d",
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Cài dependencies luôn không?",
        initial: true,
      },
      {
        type: "confirm",
        name: "initGit",
        message: "Khởi tạo git luôn không?",
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log(pc.yellow("\nĐã huỷ tạo project."));
        process.exit(0);
      },
    },
  );

  const projectName = argProjectName || firstResponse.projectName;

  if (!projectName) {
    console.log(pc.red("Thiếu tên project."));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    console.log(pc.red(`Thư mục "${projectName}" đã tồn tại.`));
    process.exit(1);
  }

  const dbName = (firstResponse.dbName || defaultDbName).trim();
  const databaseUrl =
    (firstResponse.databaseUrl || "").trim() ||
    `"postgresql://postgres:postgres@localhost:5432/${dbName}?schema=public"`;

  const accessSecret =
    (firstResponse.accessSecret || "").trim() || generateSecret();
  const refreshSecret =
    (firstResponse.refreshSecret || "").trim() || generateSecret();

  const accessTokenExpiresIn =
    (firstResponse.accessTokenExpiresIn || "").trim() || "1m";
  const refreshTokenExpiresIn =
    (firstResponse.refreshTokenExpiresIn || "").trim() || "7d";

  console.log(pc.cyan("Đang copy template..."));
  await fs.copy(TEMPLATE_DIR, targetDir);

  const replacements = {
    __PROJECT_NAME__: projectName,
    __APP_NAME__: projectName,
    __DB_NAME__: dbName,
    __PORT__: firstResponse.port || "3000",
  };

  console.log(pc.cyan("Đang thay placeholder..."));
  await replacePlaceholdersRecursively(targetDir, replacements);

  const envExamplePath = path.join(targetDir, ".env.example");
  const envPath = path.join(targetDir, ".env");

  if (
    (await fs.pathExists(envExamplePath)) &&
    !(await fs.pathExists(envPath))
  ) {
    await fs.copy(envExamplePath, envPath);
  }

  await writeEnvFile(envPath, {
    DATABASE_URL: databaseUrl,
    PORT: firstResponse.port || "3000",
    ACCESS_SECRET: `"${accessSecret}"`,
    REFRESH_SECRET: `"${refreshSecret}"`,
    ACCESS_TOKEN_EXPIRES_IN: `"${accessTokenExpiresIn}"`,
    REFRESH_TOKEN_EXPIRES_IN: `"${refreshTokenExpiresIn}"`,
  });

  if (firstResponse.installDeps) {
    console.log(pc.yellow("Đang cài dependencies..."));
    execSync("npm install", {
      cwd: targetDir,
      stdio: "inherit",
    });
  }

  if (firstResponse.initGit) {
    console.log(pc.yellow("Đang khởi tạo git..."));
    execSync("git init", {
      cwd: targetDir,
      stdio: "inherit",
    });
  }

  console.log(pc.green(`Tạo project "${projectName}" thành công.`));
  console.log("");
  console.log(`cd ${projectName}`);
  console.log("npm run dev");
}

main().catch((error) => {
  console.error(pc.red("Có lỗi xảy ra:"), error);
  process.exit(1);
});
