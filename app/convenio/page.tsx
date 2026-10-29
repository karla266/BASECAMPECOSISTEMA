import { readFile } from "fs/promises";
import path from "path";
import PrintConvenioButton from "./PrintConvenioButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LineNode =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "hr" }
  | { kind: "p"; text: string }
  | { kind: "spacer" };

function parseMarkdown(text: string): LineNode[] {
  const normalizeInline = (line: string) =>
    line
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .trimEnd();

  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line): LineNode => {
      const trimmed = normalizeInline(line.trim());
      if (!trimmed) return { kind: "spacer" };
      if (trimmed === "---") return { kind: "hr" };
      if (trimmed.startsWith("# ")) return { kind: "h1", text: trimmed.slice(2).trim() };
      if (trimmed.startsWith("## ")) return { kind: "h2", text: trimmed.slice(3).trim() };
      return { kind: "p", text: trimmed };
    });
}

export default async function ConvenioPage() {
  const filePath = path.join(
    process.cwd(),
    "docs",
    "CONVENIO_OPERATIVO_SALVADOR_LARA.md"
  );
  const raw = await readFile(filePath, "utf8");
  const nodes = parseMarkdown(raw);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-100 print:bg-white print:text-black">
      <PrintConvenioButton />
      <article className="mx-auto max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl print:rounded-none print:border-black print:bg-white print:shadow-none">
        {nodes.map((node, idx) => {
          if (node.kind === "spacer") {
            return <div key={`s-${idx}`} className="h-3" />;
          }
          if (node.kind === "hr") {
            return <hr key={`hr-${idx}`} className="my-4 border-neutral-700 print:border-black" />;
          }
          if (node.kind === "h1") {
            return (
              <h1 key={`h1-${idx}`} className="text-center text-2xl font-black tracking-tight text-white print:text-black">
                {node.text}
              </h1>
            );
          }
          if (node.kind === "h2") {
            return (
              <h2 key={`h2-${idx}`} className="mt-4 text-lg font-bold text-emerald-300 print:text-black">
                {node.text}
              </h2>
            );
          }
          const signatureLine =
            node.text.includes("Firma autógrafa") ||
            node.text.includes("BASECAMP 420") ||
            node.text.includes("SALVADOR LARA / ESCUELA PARAPENTITIS");
          return (
            <p
              key={`p-${idx}`}
              className={`text-sm leading-7 text-neutral-200 print:text-black ${
                signatureLine ? "break-inside-avoid" : ""
              }`}
            >
              {node.text}
            </p>
          );
        })}

        <p className="mt-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-semibold text-amber-200 print:border-black print:bg-white print:text-black">
          Instrucción operativa: firmar en tinta azul y escanear el convenio a 300 DPI.
        </p>
      </article>
    </main>
  );
}
