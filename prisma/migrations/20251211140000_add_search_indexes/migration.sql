-- Create indexes to accelerate search queries
CREATE INDEX IF NOT EXISTS "Api_name_idx" ON "Api" ("name");
CREATE INDEX IF NOT EXISTS "Api_updatedAt_idx" ON "Api" ("updatedAt");
CREATE INDEX IF NOT EXISTS "Api_https_idx" ON "Api" ("https");
CREATE INDEX IF NOT EXISTS "Api_cors_idx" ON "Api" ("cors");

CREATE INDEX IF NOT EXISTS "ReliabilityStats_latency_idx" ON "ReliabilityStats" ("latency");
CREATE INDEX IF NOT EXISTS "ReliabilityStats_uptime_idx" ON "ReliabilityStats" ("uptime");
