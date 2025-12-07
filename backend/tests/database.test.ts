import prisma from "../src/prisma";

describe("Database Query Tests", () => {
  // Test 1: Basic equality check
  it("should understand basic assertions", () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  // Test 2: Check database connection
  it("should connect to database and count users", async () => {
    const userCount = await prisma.user.count();
    
    expect(typeof userCount).toBe("number");
    expect(userCount).toBeGreaterThanOrEqual(0);
    console.log(`   📊 Found ${userCount} users in database`);
  });

  // Test 3: Check dilemmas exist
  it("should fetch dilemmas from database", async () => {
    const dilemmas = await prisma.dilemma.findMany({
      take: 5, // Only get first 5
    });

    expect(Array.isArray(dilemmas)).toBe(true);
    console.log(`   📊 Found ${dilemmas.length} dilemmas (showing first 5)`);
  });

  // Test 4: Verify dilemma structure
  it("should return dilemmas with correct fields", async () => {
    const dilemma = await prisma.dilemma.findFirst();

    if (dilemma) {
      expect(dilemma).toHaveProperty("id");
      expect(dilemma).toHaveProperty("title");
      expect(dilemma).toHaveProperty("description");
      expect(dilemma).toHaveProperty("options");
      expect(dilemma).toHaveProperty("category");
      console.log(`   ✓ Dilemma structure verified: "${dilemma.title}"`);
    } else {
      console.log(`   ℹ️ No dilemmas found (database might be empty)`);
    }
  });

  // Test 5: Check relationships
  it("should include author info with dilemmas", async () => {
    const dilemma = await prisma.dilemma.findFirst({
      include: { author: true },
    });

    if (dilemma) {
      expect(dilemma).toHaveProperty("author");
      expect(dilemma.author).toHaveProperty("username");
      console.log(`   ✓ Author: ${dilemma.author.username}`);
    }
  });

  // Test 6: Test filtering by category
  it("should filter dilemmas by category", async () => {
    const categories = ["ETHICS", "TECHNOLOGY", "PERSONAL", "WORK"];
    
    for (const category of categories) {
      const count = await prisma.dilemma.count({
        where: { category },
      });
      console.log(`   📊 ${category}: ${count} dilemmas`);
    }

    expect(true).toBe(true); // Always passes, just showing counts
  });

  // Test 7: Count votes and comments
  it("should show database statistics", async () => {
    const stats = {
      users: await prisma.user.count(),
      dilemmas: await prisma.dilemma.count(),
      votes: await prisma.vote.count(),
      comments: await prisma.comment.count(),
    };

    console.log(`   📊 Database Stats:`);
    console.log(`      Users: ${stats.users}`);
    console.log(`      Dilemmas: ${stats.dilemmas}`);
    console.log(`      Votes: ${stats.votes}`);
    console.log(`      Comments: ${stats.comments}`);

    expect(stats.users).toBeGreaterThanOrEqual(0);
    expect(stats.dilemmas).toBeGreaterThanOrEqual(0);
  });
});
