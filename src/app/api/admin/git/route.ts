import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();

async function git(args: string[], opts?: { timeout?: number }) {
  const { stdout, stderr } = await execFileAsync("git", args, {
    cwd: ROOT,
    timeout: opts?.timeout ?? 120_000,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      // Never open interactive editors / prompts from the API
      GIT_TERMINAL_PROMPT: "0",
      GIT_EDITOR: "true",
    },
  });
  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [branch, status, remote, ahead] = await Promise.all([
      git(["rev-parse", "--abbrev-ref", "HEAD"]),
      git(["status", "--porcelain"]),
      git(["remote", "get-url", "origin"]).catch(() => ({
        stdout: "",
        stderr: "",
      })),
      git(["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]).catch(
        () => ({ stdout: "0\t0", stderr: "" }),
      ),
    ]);

    const [aheadCount, behindCount] = ahead.stdout.split(/\s+/).map(Number);
    const dirtyFiles = status.stdout
      ? status.stdout.split("\n").filter(Boolean)
      : [];

    return NextResponse.json({
      ok: true,
      branch: branch.stdout,
      remote: remote.stdout,
      dirty: dirtyFiles.length > 0,
      dirtyCount: dirtyFiles.length,
      ahead: aheadCount || 0,
      behind: behindCount || 0,
      repoName: remote.stdout
        ? path.basename(remote.stdout.replace(/\.git$/, ""))
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nu pot citi statusul git (rulează doar local).",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Push from admin is intended for local/dev machines with git credentials.
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Push pe GitHub din admin funcționează doar pe mediul local (nu pe Vercel).",
      },
      { status: 400 },
    );
  }

  let body: { message?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const message =
    (typeof body.message === "string" && body.message.trim()) ||
    `Admin push ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;

  try {
    const status = await git(["status", "--porcelain"]);
    const hasChanges = Boolean(status.stdout);

    if (hasChanges) {
      await git(["add", "-A"]);
      // Commit via -m; if nothing staged (e.g. only ignored), continue to push
      try {
        await git(["commit", "-m", message]);
      } catch (commitErr) {
        const msg =
          commitErr instanceof Error ? commitErr.message : String(commitErr);
        if (!/nothing to commit/i.test(msg)) {
          throw commitErr;
        }
      }
    }

    const push = await git(["push", "-u", "origin", "HEAD"], {
      timeout: 180_000,
    });

    const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
    const remote = await git(["remote", "get-url", "origin"]);

    return NextResponse.json({
      ok: true,
      committed: hasChanges,
      branch: branch.stdout,
      remote: remote.stdout,
      message: hasChanges
        ? `Commit + push pe ${branch.stdout}`
        : `Push pe ${branch.stdout} (fără modificări noi)`,
      stdout: push.stdout || push.stderr,
    });
  } catch (error) {
    const raw =
      error instanceof Error
        ? `${error.message}${"stderr" in error && typeof (error as { stderr?: string }).stderr === "string" ? `\n${(error as { stderr: string }).stderr}` : ""}`
        : "Push eșuat";
    return NextResponse.json(
      {
        error: raw.slice(0, 800),
      },
      { status: 500 },
    );
  }
}
