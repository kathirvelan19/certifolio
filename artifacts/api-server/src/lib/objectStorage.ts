import { randomUUID } from "crypto";
import { supabase } from "./supabase";

const BUCKET_NAME = "certificates";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export interface SupabaseFileHandle {
  name: string;
  bucket: string;
  path: string;
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    return Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error("PRIVATE_OBJECT_DIR not set.");
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<SupabaseFileHandle | null> {
    const searchPaths = this.getPublicObjectSearchPaths();
    for (const searchPath of searchPaths) {
      const fullPath = `${searchPath}/${filePath}`.replace(/\/+/g, "/");
      const pathParts = fullPath.split("/");
      const fileName = pathParts.pop() || "";
      const folderPath = pathParts.join("/");

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath, { search: fileName });

      if (!error && data && data.some((f) => f.name === fileName)) {
        return { name: filePath, bucket: BUCKET_NAME, path: fullPath };
      }
    }
    return null;
  }

  async downloadObject(file: SupabaseFileHandle, cacheTtlSec: number = 3600): Promise<Response> {
    const { data, error } = await supabase.storage.from(file.bucket).download(file.path);
    if (error || !data) throw new ObjectNotFoundError();

    return new Response(data.stream(), {
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
        "Content-Length": String(data.size),
      },
    });
  }

  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; objectPath: string }> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const entityId = `uploads/${objectId}`;
    const fullPath = `${privateObjectDir}/${entityId}`.replace(/\/+/g, "/");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(fullPath, 900);

    if (error || !data) throw new Error(`Upload URL error: ${error?.message}`);

    return {
      uploadURL: data.signedUrl,
      objectPath: `/objects/${entityId}`,
    };
  }

  async getObjectEntityFile(objectPath: string): Promise<SupabaseFileHandle> {
    if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
    const entityId = objectPath.slice("/objects/".length);
    const fullPath = `${this.getPrivateObjectDir()}/${entityId}`.replace(/\/+/g, "/");
    const pathParts = fullPath.split("/");
    const fileName = pathParts.pop() || "";
    const folderPath = pathParts.join("/");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath, { search: fileName });

    if (error || !data || !data.some((f) => f.name === fileName)) throw new ObjectNotFoundError();

    return { name: entityId, bucket: BUCKET_NAME, path: fullPath };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) return rawPath;
    try {
      const url = new URL(rawPath);
      const prefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const signPrefix = `/storage/v1/ob
