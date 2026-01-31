import request from "supertest";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables before importing routes
dotenv.config();

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

describe("API Endpoint Tests", () => {
  // Test 1: Health check
  it("should respond to GET /api/dilemmas", async () => {
    const response = await request(app).get("/api/dilemmas");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    console.log(`   📊 API returned ${response.body.length} dilemmas`);
  });

  // Test 2: Get specific dilemma (if exists)
  it("should get a specific dilemma by ID", async () => {
    // First get all dilemmas
    const allDilemmas = await request(app).get("/api/dilemmas");
    
    if (allDilemmas.body && allDilemmas.body.length > 0) {
      const firstDilemma = allDilemmas.body[0];
      
      // Get specific dilemma
      const response = await request(app).get(`/api/dilemmas/${firstDilemma.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(firstDilemma.id);
      console.log(`   ✓ Retrieved: "${response.body.title}"`);
    } else {
      console.log(`   ℹ️ No dilemmas to test (database empty)`);
    }
  });

  // Test 3: Test authentication requirement
  it("should reject creating dilemma without auth", async () => {
    const response = await request(app)
      .post("/api/dilemmas")
      .send({
        title: "Test Dilemma",
        description: "Should fail",
        options: ["Yes", "No"],
        category: "ETHICS",
      });

    expect(response.status).toBe(401);
    console.log(`   ✓ Auth protection working`);
  });

  // Test 4: Test invalid dilemma ID
  it("should return 404 for non-existent dilemma", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const response = await request(app).get(`/api/dilemmas/${fakeId}`);

    expect(response.status).toBe(404);
    console.log(`   ✓ 404 handling working`);
  });

  // Test 5: Test dilemma includes author info
  it("should include author info in dilemma response", async () => {
    const response = await request(app).get("/api/dilemmas");

    if (response.body && response.body.length > 0) {
      const dilemma = response.body[0];
      expect(dilemma).toHaveProperty("author");
      expect(dilemma.author).toHaveProperty("username");
      console.log(`   ✓ Author included: ${dilemma.author.username}`);
    }
  });

  // Test 6: Test search functionality (if exists)
  it("should search dilemmas", async () => {
    const response = await request(app).get("/api/dilemmas?search=test");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    console.log(`   📊 Search returned ${response.body.length} results`);
  });
});
