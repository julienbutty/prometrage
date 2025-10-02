import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/**
 * Script de seed pour peupler la base de données de développement
 * Exécuter avec: npm run db:seed
 */

async function main() {
  console.log("🌱 Début du seed de la base de données...");

  // Nettoyer les données existantes
  console.log("🗑️  Nettoyage des données existantes...");
  await prisma.menuiserie.deleteMany();
  await prisma.projet.deleteMany();

  // Créer des projets de test
  console.log("📋 Création des projets de test...");

  const projet1 = await prisma.projet.create({
    data: {
      reference: "KOMP-2024-001",
      clientNom: "KOMPANIETZ",
      clientAdresse: "37 Chemin du Cuvier, 06800 Cagnes-sur-Mer",
      clientTel: "06 25 91 01 48",
      clientEmail: "paul.kompanietz@gmail.com",
      pdfUrl: "https://storage.example.com/komp-2024-001.pdf",
      pdfOriginalNom: "fiche-metreur-kompanietz.pdf",
      menuiseries: {
        create: [
          {
            ordre: 0,
            repere: "Salon",
            intitule: "Coulissant 2 vantaux",
            donneesOriginales: {
              largeur: 3000,
              hauteur: 2250,
              gamme: "PERFORMAX",
              pose: "tunnel",
              dormant: "sans aile",
              habillageInt: "Plat 30x2",
              habillageExt: "Cornière 20x20",
              intercalaire: "noir",
              ouvrantPrincipal: "droite",
              rails: "inox",
            },
            validee: false,
          },
          {
            ordre: 1,
            repere: "Chambre 1",
            intitule: "Fenêtre 2 vantaux oscillo-battant",
            donneesOriginales: {
              largeur: 1400,
              hauteur: 1350,
              gamme: "OPTIMAX",
              pose: "applique",
              dormant: "avec aile",
              habillageInt: "Sans habillage",
              habillageExt: "Sans habillage",
              intercalaire: "blanc",
              ouvrantPrincipal: "gauche",
            },
            validee: false,
          },
          {
            ordre: 2,
            intitule: "Châssis fixe",
            donneesOriginales: {
              largeur: 800,
              hauteur: 600,
              gamme: "OPTIMAX",
              pose: "tunnel",
              dormant: "sans aile",
            },
            validee: false,
          },
        ],
      },
    },
    include: {
      menuiseries: true,
    },
  });

  console.log(`✅ Projet créé: ${projet1.reference} (${projet1.menuiseries.length} menuiseries)`);

  const projet2 = await prisma.projet.create({
    data: {
      reference: "DURAND-2024-002",
      clientNom: "DURAND",
      clientAdresse: "15 Avenue de la République, 75011 Paris",
      clientTel: "01 42 38 76 54",
      clientEmail: "marie.durand@example.fr",
      menuiseries: {
        create: [
          {
            ordre: 0,
            repere: "Séjour",
            intitule: "Baie vitrée 3 vantaux",
            donneesOriginales: {
              largeur: 4200,
              hauteur: 2400,
              gamme: "INNOVAX",
              pose: "renovation",
              dormant: "avec aile",
              habillageInt: "Plat 40x3",
              habillageExt: "Plat 40x3",
              intercalaire: "noir",
              ouvrantPrincipal: "centre",
              rails: "inox brossé",
            },
            donneesModifiees: {
              largeur: 4250,
              hauteur: 2400,
              pose: "renovation",
            },
            ecarts: [
              {
                champ: "largeur",
                valeurOriginale: 4200,
                valeurModifiee: 4250,
                pourcentage: 1.19,
                niveau: "info",
              },
            ],
            validee: false,
          },
          {
            ordre: 1,
            repere: "Cuisine",
            intitule: "Fenêtre 1 vantail oscillo-battant",
            donneesOriginales: {
              largeur: 800,
              hauteur: 1200,
              gamme: "PERFORMAX",
              pose: "applique",
              dormant: "avec aile",
            },
            validee: true,
            dateValidation: new Date("2024-01-20T10:30:00Z"),
          },
        ],
      },
    },
    include: {
      menuiseries: true,
    },
  });

  console.log(`✅ Projet créé: ${projet2.reference} (${projet2.menuiseries.length} menuiseries)`);

  const projet3 = await prisma.projet.create({
    data: {
      reference: "MARTIN-2024-003",
      clientNom: "MARTIN",
      clientAdresse: "8 Rue des Lilas, 69006 Lyon",
      clientTel: "+33 4 72 83 45 67",
      menuiseries: {
        create: [
          {
            ordre: 0,
            repere: "Bureau",
            intitule: "Porte-fenêtre 1 vantail",
            donneesOriginales: {
              largeur: 900,
              hauteur: 2150,
              gamme: "OPTIMAX",
              pose: "tunnel",
            },
            donneesModifiees: {
              largeur: 920,
              hauteur: 2200,
              pose: "applique",
            },
            ecarts: [
              {
                champ: "largeur",
                valeurOriginale: 900,
                valeurModifiee: 920,
                pourcentage: 2.22,
                niveau: "info",
              },
              {
                champ: "hauteur",
                valeurOriginale: 2150,
                valeurModifiee: 2200,
                pourcentage: 2.33,
                niveau: "info",
              },
              {
                champ: "pose",
                valeurOriginale: "tunnel",
                valeurModifiee: "applique",
                niveau: "warning",
              },
            ],
            validee: false,
          },
        ],
      },
    },
    include: {
      menuiseries: true,
    },
  });

  console.log(`✅ Projet créé: ${projet3.reference} (${projet3.menuiseries.length} menuiseries)`);

  // Récapitulatif
  const totalProjets = await prisma.projet.count();
  const totalMenuiseries = await prisma.menuiserie.count();

  console.log("\n🎉 Seed terminé avec succès !");
  console.log(`📊 Total: ${totalProjets} projets, ${totalMenuiseries} menuiseries`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
