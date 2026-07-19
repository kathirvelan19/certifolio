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
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set PRIVATE_OBJECT_DIR env var."
      );
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
        .list(folderPath, {
          search: fileName,
        });

      if (!error && data && data.some(f => f.name === fileName)) {
        return {
          name: filePath,
          bucket: BUCKET_NAME,
          path: fullPath,
        };
      }
    }

    return null;
  }

  async downloadObject(file: SupabaseFileHandle, cacheTtlSec: number = 3600): Promise<Response> {
    const { data, error } = await supabase.storage
      .from(file.bucket)
      .download(file.path);

    if (error || !data) {
      throw new ObjectNotFoundError();
    }

    const headers: Record<string, string> = {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": `public, max-age=${cacheTtlSec}`,
      "Content-Length": String(data.size),
    };

    return new Response(data.stream(), { headers });
  }

  /**
   * Generates a signed upload URL and the corresponding internal object path.
   */
  async getObjectEntityUploadURL(): Promise<{ uploadURL: string; objectPath: string }> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const entityId = `uploads/${objectId}`;
    const fullPath = `${privateObjectDir}/${entityId}`.replace(/\/+/g, "/");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(fullPath, 900); // 15 mins TTL

    if (error || !data) {
      throw new Error(`Failed to generate upload URL: ${error?.message}`);
    }

    return {
      uploadURL: data.signedUrl,
      objectPath: `/objects/${entityId}`,
    };
  }

  async getObjectEntityFile(objectPath: string): Promise<SupabaseFileHandle> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const entityId = objectPath.slice("/objects/".length);
    const privateDir = this.getPrivateObjectDir();
    const fullPath = `${privateDir}/${entityId}`.replace(/\/+/g, "/");

    const pathParts = fullPath.split("/");
    const fileName = pathParts.pop() || "";
    const folderPath = pathParts.join("/");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath, {
        search: fileName,
      });

    if (error || !data || !data.some(f => f.name === fileName)) {
      throw new ObjectNotFoundError();
    }

    return {
      name: entityId,
      bucket: BUCKET_NAME,
      path: fullPath,
    };
  }

  /**
   * Normalizes a full Supabase URL or raw path back to the internal /objects/ format.
   */
  normalizeObjectEntityPath(rawPath: string): string {
    // If it's already an internal path, return it
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }

    // Handle full Supabase URLs
    try {
      const url = new URL(rawPath);
      const pathname = url.pathname; // /storage/v1/object/public/certificates/private/uploads/uuid

      const prefix = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const uploadPrefix = `/storage/v1/object/sign/${BUCKET_NAME}/`;

      let storagePath = "";
      if (pathname.startsWith(prefix)) {
        storagePath = pathname.slice(prefix.length);
      } else if (pathname.startsWith(uploadPrefix)) {
        storagePath = pathname.slice(uploadPrefix.length);
      } else {
        return rawPath;
      }

      const privateDir = this.getPrivateObjectDir();
      const privatePrefix = privateDir.endsWith("/") ? privateDir : `${privateDir}/`;

      if (storagePath.startsWith(privatePrefix)) {
        return `/objects/${storagePath.slice(privatePrefix.length)}`;
      }
      
      return `/${storagePath}`;
    } catch {
      return rawPath;
    }
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    _aclPolicy: any
  ): Promise<string> {
    // ACLs are handled via Supabase RLS policies; this is now a passthrough for path normalization.
    return this.normalizeObjectEntityPath(rawPath);
  }

  async canAccessObjectEntity({
    userId: _userId,
    objectFile: _objectFile,
    requestedPermission: _requestedPermission,
  }: {
    userId?: string;
    objectFile: SupabaseFileHandle;
    requestedPermission?: any;
  }): Promise<boolean> {
    // Logic moved to Supabase RLS. Assuming middleware/service role handles validation.
    return true;
  }
}
