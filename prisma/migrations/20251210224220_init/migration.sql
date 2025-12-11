-- CreateTable
CREATE TABLE "Api" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,
    "https" BOOLEAN NOT NULL DEFAULT false,
    "cors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Api_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Throttling" (
    "id" SERIAL NOT NULL,
    "apiId" INTEGER NOT NULL,
    "limit" TEXT,
    "window" TEXT,

    CONSTRAINT "Throttling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReliabilityStats" (
    "id" SERIAL NOT NULL,
    "apiId" INTEGER NOT NULL,
    "uptime" DOUBLE PRECISION,
    "latency" DOUBLE PRECISION,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "ReliabilityStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" JSONB NOT NULL,

    CONSTRAINT "StackTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApiToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApiToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApiToAuth" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ApiToAuth_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_name_key" ON "Auth"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Throttling_apiId_key" ON "Throttling"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "ReliabilityStats_apiId_key" ON "ReliabilityStats"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "StackTemplate_name_key" ON "StackTemplate"("name");

-- CreateIndex
CREATE INDEX "_ApiToCategory_B_index" ON "_ApiToCategory"("B");

-- CreateIndex
CREATE INDEX "_ApiToAuth_B_index" ON "_ApiToAuth"("B");

-- AddForeignKey
ALTER TABLE "Throttling" ADD CONSTRAINT "Throttling_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReliabilityStats" ADD CONSTRAINT "ReliabilityStats_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiToCategory" ADD CONSTRAINT "_ApiToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Api"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiToCategory" ADD CONSTRAINT "_ApiToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiToAuth" ADD CONSTRAINT "_ApiToAuth_A_fkey" FOREIGN KEY ("A") REFERENCES "Api"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApiToAuth" ADD CONSTRAINT "_ApiToAuth_B_fkey" FOREIGN KEY ("B") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
