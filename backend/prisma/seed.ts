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

const dilemmasByCategory: Record<string, { title: string; description: string }[]> = {
  ETHICS: [
    {
      title: "Is it ethical to lie to protect someone's feelings?",
      description: "Consider a situation where telling the truth might hurt someone emotionally.",
    },
    {
      title: "Is it ethical to manipulate someone for their own benefit?",
      description: "Manipulating someone could help them, but is it morally right?",
    },
    {
      title: "Is it wrong to keep a secret that could harm someone?",
      description: "Keeping a harmful secret: self-protection or unethical?",
    },
  ],
  TECHNOLOGY: [
    {
      title: "Is it okay to use AI-generated content without attribution?",
      description: "AI tools can generate content easily, but is it ethical to claim it as your own?",
    },
    {
      title: "Is it ethical to download paid content for free?",
      description: "Accessing paid content without paying could save money but is it ethical?",
    },
  ],
  PERSONAL: [
    {
      title: "Should I keep a found wallet with money inside?",
      description: "You found a wallet on the street. What should you do?",
    },
    {
      title: "Should I break a promise to avoid hurting someone?",
      description: "Breaking a promise might avoid emotional harm. Should you do it?",
    },
    {
      title: "Should I prioritize friends over strangers in emergencies?",
      description: "Prioritizing loved ones over strangers can save lives. Is it ethical?",
    },
  ],
  WORK: [
    {
      title: "Should I report a coworker who is taking credit for my work?",
      description: "You notice someone is taking credit for your efforts and it affects your career.",
    },
    {
      title: "Should I report a mistake I didn’t cause at work?",
      description: "Reporting a mistake not caused by you can affect workplace trust.",
    },
    {
      title: "Is it okay to secretly monitor employees at work?",
      description: "Monitoring employees without consent can prevent issues but violates privacy.",
    },
  ],
  POLITICS: [
    {
      title: "Should I share confidential information for a greater good?",
      description: "Sharing confidential info might help others. Is it worth it?",
    },
  ],
  LIFESTYLE: [
    {
      title: "Is it ethical to eat meat knowing the environmental impact?",
      description: "Eating meat impacts the environment. Should personal choice prevail?",
    },
    {
      title: "Should I donate less to charity to save for my family?",
      description: "Charity vs. family expenses: how should one decide?",
    },
  ],
  OTHER: [
    {
      title: "Should I intervene if I see bullying online?",
      description: "You witness cyberbullying. Should you step in?",
    },
    {
      title: "Is it okay to bend rules for someone in need?",
      description: "Bending rules for a good cause: justified or wrong?",
    },
    {
      title: "Should I confront someone about their offensive behavior?",
      description: "Confronting offensive behavior may hurt relationships. Should you do it?",
    },
  ],
};

// Flatten and use up to 20 dilemmas (preserving variety across categories)
const dilemmasData: { title: string; description: string; category: string }[] = [];
for (const cat of Object.keys(dilemmasByCategory)) {
  for (const item of dilemmasByCategory[cat]) {
    dilemmasData.push({ title: item.title, description: item.description, category: cat });
  }
}

// Ensure we have at least 20 items; if not, repeat from start
while (dilemmasData.length < 20) {
  dilemmasData.push(...dilemmasData.slice(0, 20 - dilemmasData.length));
}

const categories = [
  "ETHICS",
  "TECHNOLOGY",
  "PERSONAL",
  "WORK",
  "POLITICS",
  "LIFESTYLE",
  "OTHER",
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
  // Clear existing data to allow re-running seed without unique constraint errors
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.dilemma.deleteMany();
  await prisma.user.deleteMany();

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
  for (let i = 0; i < 20; i++) {
    const d = dilemmasData[i];
    const dilemma = await prisma.dilemma.create({
      data: {
        title: d.title,
        description: d.description,
        options: ["Option A", "Option B", "Option C"],
        category: d.category,
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
