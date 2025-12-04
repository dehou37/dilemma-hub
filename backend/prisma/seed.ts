import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

dotenv.config();

export const prisma = new PrismaClient();

const usernames = [
  "alice", "bob", "charlie", "dave", "eve",
  "frank", "grace", "heidi", "ivan", "judy",
  "karen", "leo", "mallory", "nancy", "oscar",
  "peggy", "quinn", "rudy", "sybil", "trent"
];

const dilemmaTitles = [
  "Is it ethical to lie to protect someone's feelings?",
  "Should I report a coworker who is taking credit for my work?",
  "Is it okay to use AI-generated content without attribution?",
  "Should I keep a found wallet with money inside?",
  "Is it wrong to cheat to get a scholarship?",
  "Should I intervene if I see bullying online?",
  "Is it okay to secretly monitor employees at work?",
  "Should I share confidential information for a greater good?",
  "Is it ethical to manipulate someone for their own benefit?",
  "Should I donate less to charity to save for my family?",
  "Is it okay to lie on a resume to get a job?",
  "Should I break a promise to avoid hurting someone?",
  "Is it ethical to download paid content for free?",
  "Should I accept a gift from a client at work?",
  "Is it wrong to keep a secret that could harm someone?",
  "Should I prioritize friends over strangers in emergencies?",
  "Is it ethical to eat meat knowing the environmental impact?",
  "Should I report a mistake I didn’t cause at work?",
  "Is it okay to bend rules for someone in need?",
  "Should I confront someone about their offensive behavior?"
];

const dilemmaDescriptions = [
  "Consider a situation where telling the truth might hurt someone emotionally.",
  "You notice someone is taking credit for your efforts and it affects your career.",
  "AI tools can generate content easily, but is it ethical to claim it as your own?",
  "You found a wallet on the street. What should you do?",
  "Cheating may help you get ahead academically, but is it justified?",
  "You witness cyberbullying. Should you step in?",
  "Monitoring employees without consent can prevent issues but violates privacy.",
  "Sharing confidential info might help others. Is it worth it?",
  "Manipulating someone could help them, but is it morally right?",
  "Charity vs. family expenses: how should one decide?",
  "Lying on a resume could land a job. Is it justifiable?",
  "Breaking a promise might avoid emotional harm. Should you do it?",
  "Accessing paid content without paying could save money but is it ethical?",
  "Accepting gifts can influence decisions. Is it appropriate?",
  "Keeping a harmful secret: self-protection or unethical?",
  "Prioritizing loved ones over strangers can save lives. Is it ethical?",
  "Eating meat impacts the environment. Should personal choice prevail?",
  "Reporting a mistake not caused by you can affect workplace trust.",
  "Bending rules for a good cause: justified or wrong?",
  "Confronting offensive behavior may hurt relationships. Should you do it?"
];

const commentContents = [
  "I would probably do this differently.",
  "Interesting perspective!",
  "I think honesty is the best approach.",
  "This is a tough decision.",
  "I’d consider the consequences carefully.",
  "Not sure I agree with that.",
  "This situation really makes you think.",
  "I would seek advice from someone I trust.",
  "It depends on the context.",
  "I’d prioritize empathy here.",
  "Actions have consequences; be mindful.",
  "I think transparency is key.",
  "I’d probably stay neutral.",
  "Sometimes rules need exceptions.",
  "This could be a slippery slope.",
  "I’d consider fairness for all involved.",
  "I think it’s justified in some cases.",
  "I’d avoid doing harm at all costs.",
  "This is morally ambiguous.",
  "I’d weigh pros and cons carefully."
];

async function main() {
  // ----------------------
  // 1️⃣ Users
  // ----------------------
  const users = [];
  for (let i = 0; i < usernames.length; i++) {
    const hashed = await argon2.hash("password123");
    const user = await prisma.user.create({
      data: {
        username: usernames[i],
        email: `${usernames[i]}@example.com`,
        password: hashed,
      },
    });
    users.push(user);
  }
  console.log("Inserted Users:", users.length);

  // ----------------------
  // 2️⃣ Dilemmas
  // ----------------------
  const dilemmas = [];
  for (let i = 0; i < dilemmaTitles.length; i++) {
    const dilemma = await prisma.dilemma.create({
      data: {
        title: dilemmaTitles[i],
        description: dilemmaDescriptions[i],
        options: ["Option A", "Option B", "Option C"],
        authorId: users[i % users.length].id,
      },
    });
    dilemmas.push(dilemma);
  }
  console.log("Inserted Dilemmas:", dilemmas.length);

  // ----------------------
  // 3️⃣ Votes
  // ----------------------
  const votes = [];
  for (let i = 0; i < 20; i++) {
    const vote = await prisma.vote.create({
      data: {
        userId: users[i % users.length].id,
        dilemmaId: dilemmas[i % dilemmas.length].id,
        option: Math.floor(Math.random() * 3),
      },
    });
    votes.push(vote);
  }
  console.log("Inserted Votes:", votes.length);

  // ----------------------
  // 4️⃣ Comments
  // ----------------------
  const comments = [];
  for (let i = 0; i < 20; i++) {
    const comment = await prisma.comment.create({
      data: {
        content: commentContents[i % commentContents.length],
        userId: users[i % users.length].id,
        dilemmaId: dilemmas[i % dilemmas.length].id,
      },
    });
    comments.push(comment);
  }
  console.log("Inserted Comments:", comments.length);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
