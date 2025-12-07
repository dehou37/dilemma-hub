import { testDb } from "./testUtils";
import request from "supertest";
import express from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth";
import dilemmaRoutes from "../src/routes/dilemmas";
import commentRoutes from "../src/routes/comments";
import voteRoutes from "../src/routes/votes";

// Create test app
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/dilemmas", dilemmaRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);

describe("Backend API Tests", () => {
  // Test 1: Register endpoint
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.username).toBe("testuser");
  });

  // Test 2: Login endpoint
  it("should login with correct credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  // Test 3: Login fails with wrong password
  it("should fail login with wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  // Test 4: Get all dilemmas
  it("should get all dilemmas", async () => {
    const response = await request(app).get("/api/dilemmas");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test 5: Create dilemma requires authentication
  it("should reject creating dilemma without auth", async () => {
    const response = await request(app)
      .post("/api/dilemmas")
      .send({
        title: "Test Dilemma",
        description: "Testing",
        options: ["Yes", "No"],
        category: "ETHICS",
      });

    expect(response.status).toBe(401);
  });

  // Test 6: Duplicate username registration
  it("should prevent duplicate username", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "different@example.com",
        password: "password123",
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("already exists");
  });

  // Test 7: Get dilemmas with author info
  it("should include author info in dilemmas", async () => {
    // Create a user and dilemma first
    const user = await testDb.createUser({
      username: "author1",
      email: "author1@example.com",
      password: "hashedpass",
    });

    await testDb.createDilemma({
      title: "Sample Dilemma",
      description: "Description",
      options: ["Option A", "Option B"],
      category: "PERSONAL",
      authorId: user.id,
    });

    const response = await request(app).get("/api/dilemmas");

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("author");
    expect(response.body[0].author).toHaveProperty("username");
  });

  // Test 8: Duplicate email registration
  it("should prevent duplicate email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "uniqueuser",
        email: "test@example.com", // Already exists
        password: "password123",
      });

    expect(response.status).toBe(409);
  });

  // Test 9: Missing required fields
  it("should reject registration without username", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "noname@example.com",
        password: "password123",
      });

    expect(response.status).toBe(400);
  });

  // Test 10: Get specific dilemma by ID
  it("should get a specific dilemma by ID", async () => {
    const user = await testDb.createUser({
      username: "specificuser",
      email: "specific@example.com",
      password: "pass",
    });

    const dilemma = await testDb.createDilemma({
      title: "Specific Dilemma",
      description: "Find me by ID",
      options: ["A", "B"],
      category: "TECHNOLOGY",
      authorId: user.id,
    });

    const response = await request(app).get(`/api/dilemmas/${dilemma.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Specific Dilemma");
    expect(response.body.id).toBe(dilemma.id);
  });
});
