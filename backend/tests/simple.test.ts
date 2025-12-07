import prisma from "../src/prisma";
import { testDb } from "./testUtils";

describe("Simple Jest Concepts", () => {
  // Test 1: Basic assertion
  it("should understand basic equality", () => {
    const result = 2 + 2;
    expect(result).toBe(4); // toBe checks exact equality
  });

  // Test 2: Array checks
  it("should work with arrays", () => {
    const fruits = ["apple", "banana", "orange"];
    
    expect(Array.isArray(fruits)).toBe(true);
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain("banana");
  });

  // Test 3: Object properties
  it("should check object properties", () => {
    const user = {
      name: "John",
      age: 30,
      email: "john@example.com",
    };

    expect(user).toHaveProperty("name");
    expect(user.name).toBe("John");
    expect(user.age).toBeGreaterThan(18);
  });

  // Test 4: Async operation (database query)
  it("should query the database", async () => {
    const dilemmas = await prisma.dilemma.findMany();
    
    // Check that it returns an array
    expect(Array.isArray(dilemmas)).toBe(true);
  });

  // Test 5: Create data
  it("should create a user in database", async () => {
    const user = await testDb.createUser({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    // Verify the user was created
    expect(user).toHaveProperty("id");
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@example.com");
  });

  // Test 6: Create related data
  it("should create a dilemma with a user", async () => {
    // First create a user
    const user = await testDb.createUser({
      username: "author",
      email: "author@example.com",
      password: "pass",
    });

    // Then create a dilemma by that user
    const dilemma = await testDb.createDilemma({
      title: "My First Dilemma",
      description: "Should I learn testing?",
      options: ["Yes", "Definitely Yes"],
      category: "PERSONAL",
      authorId: user.id,
    });

    // Check the relationship
    expect(dilemma.authorId).toBe(user.id);
    expect(dilemma.title).toBe("My First Dilemma");
  });

  // Test 7: Query with filter
  it("should filter dilemmas by category", async () => {
    const user = await testDb.createUser({
      username: "techuser",
      email: "tech@example.com",
      password: "pass",
    });

    // Create a tech dilemma
    await testDb.createDilemma({
      title: "Tech Question",
      description: "About technology",
      options: ["A", "B"],
      category: "TECHNOLOGY",
      authorId: user.id,
    });

    // Query for TECHNOLOGY category
    const techDilemmas = await prisma.dilemma.findMany({
      where: { category: "TECHNOLOGY" },
    });

    expect(techDilemmas.length).toBeGreaterThan(0);
    expect(techDilemmas[0].category).toBe("TECHNOLOGY");
  });

  // Test 8: Update data
  it("should update a dilemma", async () => {
    const user = await testDb.createUser({
      username: "updater",
      email: "update@example.com",
      password: "pass",
    });

    const dilemma = await testDb.createDilemma({
      title: "Original",
      description: "Before update",
      options: ["X", "Y"],
      category: "WORK",
      authorId: user.id,
    });

    // Update it
    const updated = await prisma.dilemma.update({
      where: { id: dilemma.id },
      data: { title: "Updated Title" },
    });

    expect(updated.title).toBe("Updated Title");
  });

  // Test 9: Delete data
  it("should delete a dilemma", async () => {
    const user = await testDb.createUser({
      username: "deleter",
      email: "delete@example.com",
      password: "pass",
    });

    const dilemma = await testDb.createDilemma({
      title: "To Delete",
      description: "Will be removed",
      options: ["1", "2"],
      category: "OTHER",
      authorId: user.id,
    });

    // Delete it
    await prisma.dilemma.delete({
      where: { id: dilemma.id },
    });

    // Try to find it (should be null)
    const found = await prisma.dilemma.findUnique({
      where: { id: dilemma.id },
    });

    expect(found).toBeNull();
  });

  // Test 10: Count records
  it("should count total dilemmas", async () => {
    const count = await prisma.dilemma.count();
    
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
