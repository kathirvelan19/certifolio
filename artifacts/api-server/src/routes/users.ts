import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateMyProfileBody } from "@workspace/api-zod";

const router = Router();

// GET /users/profile - get authenticated user's profile (JIT provision if needed)
router.get("/users/profile", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));

  if (!user) {
    // JIT provision user
    const username = `user_${userId.substring(0, 8)}`;
    const [created] = await db
      .insert(usersTable)
      .values({ clerkId: userId, username })
      .returning();
    user = created;
  }

  res.json(user);
});

// PUT /users/profile - update authenticated user's profile
router.put("/users/profile", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  const data = parsed.data;

  if (data.username !== undefined) updates.username = data.username;
  if (data.name !== undefined) updates.name = data.name;
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.profileImageUrl !== undefined) updates.profileImageUrl = data.profileImageUrl;
  if (data.github !== undefined) updates.github = data.github;
  if (data.linkedin !== undefined) updates.linkedin = data.linkedin;
  if (data.leetcode !== undefined) updates.leetcode = data.leetcode;
  if (data.resumeUrl !== undefined) updates.resumeUrl = data.resumeUrl;

  // Upsert
  let [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, userId));
  if (!user) {
    const username = updates.username ?? `user_${userId.substring(0, 8)}`;
    const [created] = await db
      .insert(usersTable)
      .values({ clerkId: userId, username, ...updates })
      .returning();
    user = created;
  } else {
    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.clerkId, userId))
      .returning();
    user = updated;
  }

  res.json(user);
});

export default router;
