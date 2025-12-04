import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const addComment = async (req, res) => {
    const { userId, dilemmaId, content } = req.body;
    const comment = await prisma.comment.create({ data: { userId, dilemmaId, content } });
    res.json(comment);
};
//# sourceMappingURL=commentController.js.map