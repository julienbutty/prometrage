/*
  Warnings:

  - You are about to drop the column `clientAdresse` on the `Projet` table. All the data in the column will be lost.
  - You are about to drop the column `clientEmail` on the `Projet` table. All the data in the column will be lost.
  - You are about to drop the column `clientNom` on the `Projet` table. All the data in the column will be lost.
  - You are about to drop the column `clientTel` on the `Projet` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Projet` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Projet_clientNom_idx";

-- AlterTable
ALTER TABLE "Menuiserie" ADD COLUMN     "imageBase64" TEXT;

-- AlterTable
ALTER TABLE "Projet" DROP COLUMN "clientAdresse",
DROP COLUMN "clientEmail",
DROP COLUMN "clientNom",
DROP COLUMN "clientTel",
ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "clientId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "tel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_nom_idx" ON "Client"("nom");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Projet_clientId_idx" ON "Projet"("clientId");

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
