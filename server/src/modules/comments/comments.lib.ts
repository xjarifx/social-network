import { prisma } from "../../lib/prisma";

export const countCommentSubtree = async (
  commentId: string,
): Promise<number> => {
  const visited = new Set<string>();
  let queue = [commentId];

  while (queue.length > 0) {
    const batch = queue;
    queue = [];

    const children = await prisma.comment.findMany({
      where: { parentId: { in: batch } },
      select: { id: true },
    });

    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        queue.push(child.id);
      }
    }
  }

  return 1 + visited.size;
};
