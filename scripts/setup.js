// scripts/setup.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to run a command and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Check if .env file exists, create it if not
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
  console.log("Creating .env file...");
  const envContent = `DATABASE_URL="mongodb://localhost:27017/atlas-ai"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
GEMINI_API_KEY="your-gemini-api-key"
`;
  fs.writeFileSync(envPath, envContent);
  console.log(".env file created");
}

// Check if next.config.js exists, create it if not
const nextConfigPath = path.join(__dirname, "..", "next.config.js");
if (!fs.existsSync(nextConfigPath)) {
  console.log("Creating next.config.js file...");
  const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Only include the mongodb module on the server side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        url: false,
        querystring: false,
        buffer: false,
        assert: false,
      };
    }
    return config;
  },
  // Ensure MongoDB client-side encryption is only used on the server
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
};

module.exports = nextConfig;`;
  fs.writeFileSync(nextConfigPath, nextConfigContent);
  console.log("next.config.js file created");
}

// Install dependencies
console.log("Installing dependencies...");
runCommand("npm install bcryptjs @types/bcryptjs");

// Remove Prisma dependencies
console.log("Removing Prisma dependencies...");
runCommand("npm uninstall prisma @prisma/client @prisma/extension-accelerate");

// Initialize MongoDB
console.log("Initializing MongoDB...");
runCommand("node scripts/init-mongodb.js");

console.log("\nSetup completed successfully!");
console.log("\nYou can now start the application with:");
console.log("npm run dev");
