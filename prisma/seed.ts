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
  await prisma.client.deleteMany();

  // Créer des clients de test
  console.log("👤 Création des clients de test...");

  const client1 = await prisma.client.create({
    data: {
      nom: "DUPONT",
      email: "jean.dupont@example.com",
      tel: "06 12 34 56 78",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      nom: "MARTIN",
      email: "marie.martin@example.com",
      tel: "06 98 76 54 32",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      nom: "DURAND",
      email: "paul.durand@example.com",
      tel: "01 42 38 76 54",
    },
  });

  console.log("✅ Clients créés:", client1.nom, client2.nom, client3.nom);

  // Créer des projets de test
  console.log("📋 Création des projets de test...");

  // Projet 1 : DUPONT à Paris
  const projet1 = await prisma.projet.create({
    data: {
      reference: "DUPO-2024-001",
      clientId: client1.id,
      adresse: "15 Rue des Lilas, 75018 Paris",
      pdfUrl: "https://storage.example.com/dupo-2024-001.pdf",
      pdfOriginalNom: "fiche-metreur-dupont.pdf",
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
      client: true,
    },
  });

  console.log(
    `✅ Projet créé: ${projet1.reference} - Client: ${projet1.client.nom} (${projet1.menuiseries.length} menuiseries)`
  );

  // Projet 2 : DUPONT à Lyon (deuxième domicile)
  const projet2 = await prisma.projet.create({
    data: {
      reference: "DUPO-2024-002",
      clientId: client1.id,
      adresse: "42 Avenue des Fleurs, 69001 Lyon",
      pdfUrl: "https://storage.example.com/dupo-2024-002.pdf",
      pdfOriginalNom: "fiche-metreur-dupont-2.pdf",
      menuiseries: {
        create: [
          {
            ordre: 0,
            repere: "Cuisine",
            intitule: "Fenêtre fixe",
            donneesOriginales: {
              largeur: 1200,
              hauteur: 1500,
              gamme: "OPTIMAX",
              pose: "renovation",
              dormant: "sans aile",
              intercalaire: "blanc",
            },
            validee: false,
          },
        ],
      },
    },
    include: {
      menuiseries: true,
      client: true,
    },
  });

  console.log(
    `✅ Projet créé: ${projet2.reference} - Client: ${projet2.client.nom} (${projet2.menuiseries.length} menuiseries)`
  );

  // Projet 3 : MARTIN à Marseille
  const projet3 = await prisma.projet.create({
    data: {
      reference: "MART-2024-001",
      clientId: client2.id,
      adresse: "8 Rue du Commerce, 13001 Marseille",
      pdfUrl: "https://storage.example.com/mart-2024-001.pdf",
      pdfOriginalNom: "fiche-metreur-martin.pdf",
      menuiseries: {
        create: [
          {
            ordre: 0,
            intitule: "Porte-fenêtre coulissante",
            donneesOriginales: {
              largeur: 2400,
              hauteur: 2150,
              gamme: "PERFORMAX",
              pose: "tunnel",
              dormant: "avec aile",
              intercalaire: "noir",
            },
            validee: false,
          },
        ],
      },
    },
    include: {
      menuiseries: true,
      client: true,
    },
  });

  console.log(
    `✅ Projet créé: ${projet3.reference} - Client: ${projet3.client.nom} (${projet3.menuiseries.length} menuiseries)`
  );

  // Projet 4 : DURAND à Paris (avec menuiserie validée)
  const projet4 = await prisma.projet.create({
    data: {
      reference: "DURA-2024-001",
      clientId: client3.id,
      adresse: "15 Avenue de la République, 75011 Paris",
      pdfUrl: "https://storage.example.com/dura-2024-001.pdf",
      pdfOriginalNom: "fiche-metreur-durand.pdf",
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
                niveau: "faible",
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
      client: true,
    },
  });

  console.log(
    `✅ Projet créé: ${projet4.reference} - Client: ${projet4.client.nom} (${projet4.menuiseries.length} menuiseries)`
  );

  // Récapitulatif
  const totalClients = await prisma.client.count();
  const totalProjets = await prisma.projet.count();
  const totalMenuiseries = await prisma.menuiserie.count();

  console.log("\n🎉 Seed terminé avec succès !");
  console.log(
    `📊 Total: ${totalClients} clients, ${totalProjets} projets, ${totalMenuiseries} menuiseries`
  );
  console.log(
    `\n💡 Exemple : Le client "${client1.nom}" a ${projet1.menuiseries.length + projet2.menuiseries.length} menuiseries réparties sur 2 projets (adresses différentes)`
  );
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
