// Shared setup - runs once before test environment is initialized
// Load environment variables BEFORE any test modules are imported

import dotenv from 'dotenv';
dotenv.config();

console.log("🧪 Test environment initialized");
