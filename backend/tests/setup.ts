// Shared setup - runs once before all test files
// NO database cleanup - preserves existing data

beforeAll(async () => {
  console.log("🧪 Starting tests (database data preserved)");
});

afterAll(async () => {
  console.log("✅ Tests complete (database data preserved)");
});
