import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, certificatesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetPortfolioParams } from "@workspace/api-zod";

const router = Router();

// GET /portfolio/:username - public portfolio
router.get("/portfolio/:username", async (req, res): Promise<void> => {
  const parsed = GetPortfolioParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid username" });
    return;
  }
  const { username } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const certificates = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.uploadedByClerkId, user.clerkId))
    .orderBy(desc(certificatesTable.createdAt));

  res.json({ user, certificates });
});

export default router;
