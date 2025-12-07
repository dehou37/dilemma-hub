import { PrismaClient } from "@prisma/client";
import { jest } from "@jest/globals";

const prisma = new PrismaClient();

export const testDb = {
  // Clean up database
  async cleanAll() {
    await prisma.comment.deleteMany();
    await prisma.vote.deleteMany();
    await prisma.dilemma.deleteMany();
    await prisma.user.deleteMany();
  },

  // Create test user
  async createUser(data: { username: string; email: string; password: string }) {
    return prisma.user.create({ data });
  },

  // Create test dilemma
  async createDilemma(data: {
    title: string;
    description: string;
    options: string[];
    category: string;
    authorId: string;
  }) {
    return prisma.dilemma.create({ data });
  },

  // Create test vote
  async createVote(data: { userId: string; dilemmaId: string; option: number }) {
    return prisma.vote.create({ data });
  },

  // Create test comment
  async createComment(data: { userId: string; dilemmaId: string; content: string }) {
    return prisma.comment.create({ data });
  },

  // Disconnect
  async disconnect() {
    await prisma.$disconnect();
  },
};

// Mock request object
export const mockRequest = (data: any = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  user: data.user || null,
  ...data,
});

// Mock response object
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};
