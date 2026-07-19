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

  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`.replace(/\/+/g, "/");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(fullPath);

    if (error || !data) {
      throw new Error(`Failed to generate upload URL: ${error?.message}`);
    }

    return data.signedUrl;
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

  normalizeObjectEntityPath(rawPath: string): string {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const storagePrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;

    if (!rawPath.startsWith(storagePrefix)) {
      return rawPath;
    }

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    const rawObjectPath = rawPath.replace(storagePrefix, "");

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return `/${rawObjectPath}`;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    _aclPolicy: any
  ): Promise<string> {
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
    return true;
  }
}
