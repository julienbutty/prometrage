-- CreateTable
CREATE TABLE "Projet" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientNom" TEXT NOT NULL,
    "clientAdresse" TEXT,
    "clientTel" TEXT,
    "clientEmail" TEXT,
    "pdfUrl" TEXT,
    "pdfOriginalNom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menuiserie" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "repere" TEXT,
    "intitule" TEXT NOT NULL,
    "donneesOriginales" JSONB NOT NULL,
    "donneesModifiees" JSONB,
    "ecarts" JSONB,
    "validee" BOOLEAN NOT NULL DEFAULT false,
    "dateValidation" TIMESTAMP(3),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menuiserie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Projet_reference_key" ON "Projet"("reference");

-- CreateIndex
CREATE INDEX "Projet_reference_idx" ON "Projet"("reference");

-- CreateIndex
CREATE INDEX "Projet_clientNom_idx" ON "Projet"("clientNom");

-- CreateIndex
CREATE INDEX "Projet_createdAt_idx" ON "Projet"("createdAt");

-- CreateIndex
CREATE INDEX "Menuiserie_projetId_idx" ON "Menuiserie"("projetId");

-- CreateIndex
CREATE INDEX "Menuiserie_validee_idx" ON "Menuiserie"("validee");

-- CreateIndex
CREATE INDEX "Menuiserie_ordre_idx" ON "Menuiserie"("ordre");

-- AddForeignKey
ALTER TABLE "Menuiserie" ADD CONSTRAINT "Menuiserie_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
