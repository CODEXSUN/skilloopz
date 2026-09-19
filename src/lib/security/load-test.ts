import { prisma } from "@/lib/db";

export interface LoadTestResult {
  requestNumber: number;
  statusCode: number | null;
  responseTimeMs: number;
  success: boolean;
  error?: string;
}

export interface LoadTestSummary {
  totalRequests: number;
  successful: number;
  failed: number;
  avgResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  p50ResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  requestsPerSecond: number;
  statusCodes: Record<string, number>;
}

function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export async function runLoadTest(params: {
  targetUrl: string;
  method?: string;
  concurrency?: number;
  totalRequests?: number;
}): Promise<{ id: string; results: LoadTestResult[]; summary: LoadTestSummary }> {
  const { targetUrl, method = "GET", concurrency = 5, totalRequests = 20 } = params;

  const run = await prisma.loadTestRun.create({
    data: {
      status: "in_progress",
      targetUrl,
      method,
      concurrency,
      totalRequests,
    },
  });

  const results: LoadTestResult[] = [];
  let completed = 0;
  let active = 0;

  async function makeRequest(requestNumber: number): Promise<void> {
    active++;
    const start = performance.now();
    try {
      const response = await fetch(targetUrl, {
        method,
        signal: AbortSignal.timeout(30000),
      });
      const duration = performance.now() - start;
      results.push({
        requestNumber,
        statusCode: response.status,
        responseTimeMs: Math.round(duration),
        success: response.ok,
      });
    } catch (error) {
      const duration = performance.now() - start;
      results.push({
        requestNumber,
        statusCode: null,
        responseTimeMs: Math.round(duration),
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      active--;
      completed++;
    }
  }

  while (completed < totalRequests) {
    const batchSize = Math.min(concurrency - active, totalRequests - completed);
    const batch: Promise<void>[] = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(makeRequest(completed + 1));
    }
    await Promise.all(batch);
  }

  const times = results.map((r) => r.responseTimeMs).sort((a, b) => a - b);
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDurationMs = times.reduce((a, b) => a + b, 0);
  const totalWallTime = times.length > 0 ? times[times.length - 1] : 0;

  const statusCodes: Record<string, number> = {};
  for (const r of results) {
    const key = String(r.statusCode ?? "error");
    statusCodes[key] = (statusCodes[key] ?? 0) + 1;
  }

  const summary: LoadTestSummary = {
    totalRequests,
    successful,
    failed,
    avgResponseTimeMs: Math.round(totalDurationMs / results.length),
    minResponseTimeMs: times[0] ?? 0,
    maxResponseTimeMs: times[times.length - 1] ?? 0,
    p50ResponseTimeMs: calculatePercentile(times, 50),
    p95ResponseTimeMs: calculatePercentile(times, 95),
    p99ResponseTimeMs: calculatePercentile(times, 99),
    requestsPerSecond: totalWallTime > 0
      ? Math.round((totalRequests / totalWallTime) * 1000)
      : 0,
    statusCodes,
  };

  await prisma.loadTestRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      results: JSON.stringify(results),
      summary: JSON.stringify(summary),
      completedAt: new Date(),
    },
  });

  return { id: run.id, results, summary };
}

export async function getLoadTestRuns(limit = 10, offset = 0) {
  const [runs, total] = await Promise.all([
    prisma.loadTestRun.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.loadTestRun.count(),
  ]);

  return {
    runs: runs.map((r) => ({
      ...r,
      results: JSON.parse(r.results) as LoadTestResult[],
      summary: JSON.parse(r.summary) as LoadTestSummary,
    })),
    total,
  };
}

export async function getLoadTestRun(id: string) {
  const run = await prisma.loadTestRun.findUnique({ where: { id } });
  if (!run) return null;
  return {
    ...run,
    results: JSON.parse(run.results) as LoadTestResult[],
    summary: JSON.parse(run.summary) as LoadTestSummary,
  };
}
