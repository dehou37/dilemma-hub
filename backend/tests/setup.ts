import { testDb } from "./testUtils";

// Global setup: runs once before all test files
beforeAll(async () => {
  console.log("🧹 Cleaning test database...");
  await testDb.cleanAll();
});

// Global cleanup: runs once after all test files
afterAll(async () => {
  console.log("🔌 Disconnecting from database...");
  await testDb.cleanAll();
  await testDb.disconnect();
});
