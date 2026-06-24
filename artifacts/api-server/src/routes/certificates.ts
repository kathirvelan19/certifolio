import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { certificatesTable } from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { CreateCertificateBody, ListCertificatesQueryParams, GetCertificateParams, DeleteCertificateParams } from "@workspace/api-zod";

const router = Router();

// GET /certificates - list authenticated user's certificates
router.get("/certificates", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = ListCertificatesQueryParams.safeParse(req.query);
  const category = parsed.success ? parsed.data.category : undefined;
  const search = parsed.success ? parsed.data.search : undefined;

  let conditions = [eq(certificatesTable.uploadedByClerkId, userId)];

  if (category) {
    conditions.push(eq(certificatesTable.category, category));
  }

  const certs = await db
    .select()
    .from(certificatesTable)
    .where(and(...conditions))
    .orderBy(desc(certificatesTable.createdAt));

  let result = certs;
  if (search) {
    const q = search.toLowerCase();
    result = certs.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q),
    );
  }

  res.json(result);
});

// POST /certificates - create a certificate
router.post("/certificates", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { title, issuer, fileUrl, fileType, category } = parsed.data;

  const shareToken = Math.random().toString(36).substring(2, 15);

  const [cert] = await db
    .insert(certificatesTable)
    .values({
      title,
      issuer,
      fileUrl,
      fileType: fileType ?? null,
      category: category ?? "Course",
      uploadedByClerkId: userId,
      shareToken,
    })
    .returning();

  res.status(201).json(cert);
});

// GET /certificates/stats
router.get("/certificates/stats", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const certs = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.uploadedByClerkId, userId))
    .orderBy(desc(certificatesTable.viewCount));

  const total = certs.length;
  const totalViews = certs.reduce((sum, c) => sum + c.viewCount, 0);

  const categoryMap: Record<string, number> = {};
  for (const cert of certs) {
    categoryMap[cert.category] = (categoryMap[cert.category] ?? 0) + 1;
  }
  const byCategory = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));
  const mostViewed = certs.slice(0, 5);

  res.json({ total, totalViews, byCategory, mostViewed });
});

// GET /certificates/:id - public, increments view count
router.get("/certificates/:id", async (req, res): Promise<void> => {
  const parsed = GetCertificateParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parsed.data.id;

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.id, id));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  // Increment view count
  await db
    .update(certificatesTable)
    .set({ viewCount: cert.viewCount + 1 })
    .where(eq(certificatesTable.id, id));

  res.json({ ...cert, viewCount: cert.viewCount + 1 });
});

// DELETE /certificates/:id
router.delete("/certificates/:id", requireAuth(), async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeleteCertificateParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const id = parsed.data.id;

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(and(eq(certificatesTable.id, id), eq(certificatesTable.uploadedByClerkId, userId)));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  await db.delete(certificatesTable).where(eq(certificatesTable.id, id));
  res.status(204).send();
});

export default router;
