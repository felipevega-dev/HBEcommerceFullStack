-- AlterTable
ALTER TABLE "products" ADD COLUMN     "mercadoLibreAvailable" BOOLEAN,
ADD COLUMN     "mercadoLibreSyncError" TEXT,
ADD COLUMN     "mercadoLibreSyncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "mercado_libre_connections" (
    "id" TEXT NOT NULL,
    "mlUserId" TEXT NOT NULL,
    "nickname" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "connectedById" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mercado_libre_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mercado_libre_connections_mlUserId_key" ON "mercado_libre_connections"("mlUserId");

