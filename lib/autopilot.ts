import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { getTenantConfig, getTenantSiteBaseUrl, getTenantWhatsAppPhoneIntl } from "@/lib/tenant";

export type PipelineStatus = "PENDIENTE_REVISION" | "APROBADO" | "PUBLICADO" | "DESCARTADO" | "ERROR";

export interface PipelineQueueItem {
  id: string;
  sourceVideoId: string;
  sourceTitle: string;
  proposedTitle: string;
  proposedDescription: string;
  tags: string[];
  pinnedComment: string;
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  error?: string;
}

type PipelineQueueFile = {
  items: PipelineQueueItem[];
};

const PIPELINE_QUEUE_FILE = path.join(process.cwd(), "data", "pipeline_queue.json");

function defaultQueue(): PipelineQueueFile {
  return { items: [] };
}

function sanitizeQueueItems(input: unknown): PipelineQueueItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Record<string, unknown>)
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.sourceVideoId === "string" &&
        typeof item.sourceTitle === "string" &&
        typeof item.proposedTitle === "string" &&
        typeof item.proposedDescription === "string" &&
        Array.isArray(item.tags) &&
        typeof item.pinnedComment === "string" &&
        typeof item.status === "string" &&
        typeof item.createdAt === "string" &&
        typeof item.updatedAt === "string"
    )
    .map((item) => ({
      id: item.id as string,
      sourceVideoId: item.sourceVideoId as string,
      sourceTitle: item.sourceTitle as string,
      proposedTitle: item.proposedTitle as string,
      proposedDescription: item.proposedDescription as string,
      tags: (item.tags as unknown[]).filter((tag) => typeof tag === "string") as string[],
      pinnedComment: item.pinnedComment as string,
      status: item.status as PipelineStatus,
      createdAt: item.createdAt as string,
      updatedAt: item.updatedAt as string,
      approvedAt: typeof item.approvedAt === "string" ? item.approvedAt : undefined,
      publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : undefined,
      error: typeof item.error === "string" ? item.error : undefined,
    }));
}

export async function readPipelineQueue(): Promise<PipelineQueueItem[]> {
  try {
    const content = await readFile(PIPELINE_QUEUE_FILE, "utf8");
    const parsed = JSON.parse(content) as { items?: unknown };
    return sanitizeQueueItems(parsed.items);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return [];
    if (error instanceof SyntaxError) return [];
    throw error;
  }
}

async function writePipelineQueue(items: PipelineQueueItem[]): Promise<void> {
  await mkdir(path.dirname(PIPELINE_QUEUE_FILE), { recursive: true });
  const body = JSON.stringify({ items }, null, 2);
  await writeFile(PIPELINE_QUEUE_FILE, `${body}\n`, "utf8");
}

function buildConversionAssets() {
  const tenant = getTenantConfig();
  const reserveUrl = `${getTenantSiteBaseUrl()}/reservar?utm_source=youtube&utm_medium=organic&utm_campaign=foreign_tourists`;
  const whatsappUrl = `https://wa.me/${getTenantWhatsAppPhoneIntl()}?text=${encodeURIComponent(
    `Hi ${tenant.brandName}, I want to book a tandem paragliding flight in Fortin.`
  )}`;
  return { tenant, reserveUrl, whatsappUrl };
}

export function generateBatchTemplate(): PipelineQueueItem[] {
  const now = new Date().toISOString();
  const { tenant, reserveUrl, whatsappUrl } = buildConversionAssets();

  const templates = [
    { sourceVideoId: "bc420-aerial-01", sourceTitle: "Fly over Orizaba Valley" },
    { sourceVideoId: "bc420-takeoff-02", sourceTitle: "Fortin mountain takeoff POV" },
    { sourceVideoId: "bc420-sunset-03", sourceTitle: "Sunset tandem glide in Mexico" },
  ];

  return templates.map((template, index) => {
    const itemId = `auto-${Date.now()}-${index + 1}`;
    const proposedTitle = `Paragliding in Mexico | Book your tandem flight with ${tenant.brandName}`;
    const proposedDescription = [
      `Experience a certified tandem paragliding adventure in Fortin de las Flores, Mexico.`,
      `Book now: ${reserveUrl}`,
      `WhatsApp direct: ${whatsappUrl}`,
      `USD/MXN secure checkout available.`,
    ].join("\n");
    const pinnedComment = `Book now in USD/MXN 👉 ${reserveUrl}\nWhatsApp direct support: ${whatsappUrl}`;
    return {
      id: itemId,
      sourceVideoId: template.sourceVideoId,
      sourceTitle: template.sourceTitle,
      proposedTitle,
      proposedDescription,
      tags: [
        "paragliding mexico",
        "tandem flight",
        "fortin de las flores",
        "oriza adventure",
        "travel mexico",
      ],
      pinnedComment,
      status: "PENDIENTE_REVISION",
      createdAt: now,
      updatedAt: now,
    };
  });
}

export async function appendGeneratedBatch(): Promise<PipelineQueueItem[]> {
  const current = await readPipelineQueue();
  const generated = generateBatchTemplate();
  const merged = [...generated, ...current];
  await writePipelineQueue(merged);
  return generated;
}

export async function updateQueueItem(
  id: string,
  updates: Partial<Pick<PipelineQueueItem, "proposedTitle" | "proposedDescription" | "pinnedComment" | "tags">>
): Promise<PipelineQueueItem | null> {
  const queue = await readPipelineQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const now = new Date().toISOString();
  queue[index] = {
    ...queue[index],
    ...updates,
    updatedAt: now,
  };
  await writePipelineQueue(queue);
  return queue[index];
}

async function runYouTubePublishScript(item: PipelineQueueItem): Promise<void> {
  const scriptPath = path.join(process.cwd(), "scripts", "youtube_suite.py");
  await new Promise<void>((resolve, reject) => {
    const processHandle = spawn("python", [scriptPath, "upload", "--video-id", item.sourceVideoId, "--title", item.proposedTitle, "--description", item.proposedDescription, "--pinned-comment", item.pinnedComment], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe",
    });
    let stderr = "";
    processHandle.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    processHandle.on("error", (error) => reject(error));
    processHandle.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `youtube_suite.py failed with exit code ${code}.`));
      }
    });
  });
}

export async function approveQueueItem(
  id: string,
  input?: Partial<Pick<PipelineQueueItem, "proposedTitle" | "proposedDescription" | "pinnedComment" | "tags">> & {
    action?: "APROBAR" | "DESCARTAR";
  }
): Promise<PipelineQueueItem | null> {
  const queue = await readPipelineQueue();
  const index = queue.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const action = input?.action || "APROBAR";
  const now = new Date().toISOString();
  let updated: PipelineQueueItem = {
    ...queue[index],
    ...(typeof input?.proposedTitle === "string" ? { proposedTitle: input.proposedTitle } : {}),
    ...(typeof input?.proposedDescription === "string" ? { proposedDescription: input.proposedDescription } : {}),
    ...(typeof input?.pinnedComment === "string" ? { pinnedComment: input.pinnedComment } : {}),
    ...(Array.isArray(input?.tags) ? { tags: input.tags } : {}),
    updatedAt: now,
  };

  if (action === "DESCARTAR") {
    updated = { ...updated, status: "DESCARTADO" };
    queue[index] = updated;
    await writePipelineQueue(queue);
    return updated;
  }

  updated = { ...updated, status: "APROBADO", approvedAt: now, error: undefined };
  queue[index] = updated;
  await writePipelineQueue(queue);

  try {
    await runYouTubePublishScript(updated);
    const refreshed = await readPipelineQueue();
    const publishIndex = refreshed.findIndex((item) => item.id === id);
    if (publishIndex < 0) return updated;
    const published: PipelineQueueItem = {
      ...refreshed[publishIndex],
      status: "PUBLICADO",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    refreshed[publishIndex] = published;
    await writePipelineQueue(refreshed);
    return published;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo ejecutar youtube_suite.py.";
    const refreshed = await readPipelineQueue();
    const failIndex = refreshed.findIndex((item) => item.id === id);
    if (failIndex >= 0) {
      refreshed[failIndex] = {
        ...refreshed[failIndex],
        status: "ERROR",
        error: message,
        updatedAt: new Date().toISOString(),
      };
      await writePipelineQueue(refreshed);
      return refreshed[failIndex];
    }
    throw error;
  }
}
