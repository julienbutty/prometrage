/**
 * Test script with mocked AI response (no API credits needed)
 * Simulates the full workflow without calling Anthropic API
 */

import fs from "fs";
import path from "path";

const PDF_PATH = path.join(__dirname, "../docs/fm.pdf");

// Mock AI response (based on expected structure from fm.pdf)
const mockAIResponse = {
  menuiseries: [
    {
      repere: "Salon",
      intitule: "Coulissant 2 vantaux 2 rails",
      largeur: 3000,
      hauteur: 2250,
      gamme: "PERFORMAX",
      couleurInt: "RAL 9016",
      couleurExt: "RAL 7016",
      pose: "tunnel",
      dimensions: "clair de bois",
      dormant: "avec aile",
      habillageInt: "Plat 30x2",
      habillageExt: "Cornière 20x20",
      doubleVitrage: "44.2.16w Argon.4 PTR+",
      intercalaire: "blanc",
      ouvrantPrincipal: "droite",
      rails: "inox",
    },
    {
      repere: "Cuisine",
      intitule: "Fenêtre fixe",
      largeur: 1200,
      hauteur: 1500,
      gamme: "OPTIMAX",
      couleurInt: "RAL 9016",
      couleurExt: "RAL 7016",
      pose: "renovation",
      dimensions: "execution",
      dormant: "sans aile",
      doubleVitrage: "44.2.16w Argon.4 PTR+",
      intercalaire: "noir",
    },
  ],
  metadata: {
    confidence: 0.92,
    warnings: [],
    clientInfo: {
      nom: "DUPONT",
      adresse: "15 Rue des Lilas",
      tel: "06 12 34 56 78",
    },
  },
};

async function testWithMock() {
  console.log("🧪 Testing PDF Upload with MOCKED AI Response\n");
  console.log("⚠️  This test simulates AI parsing without calling Anthropic API");
  console.log("   (Useful when you don't have API credits)\n");

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF not found at: ${PDF_PATH}`);
    process.exit(1);
  }

  console.log(`📄 PDF: ${PDF_PATH}`);
  console.log(`📊 Size: ${(fs.statSync(PDF_PATH).size / 1024).toFixed(2)} KB\n`);

  console.log("🤖 Simulating AI Parsing...\n");

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("✅ Mock Response Generated!\n");

  console.log("📋 Extracted Data:");
  console.log("─".repeat(50));
  console.log(`Client: ${mockAIResponse.metadata.clientInfo?.nom}`);
  console.log(`Address: ${mockAIResponse.metadata.clientInfo?.adresse}`);
  console.log(`Phone: ${mockAIResponse.metadata.clientInfo?.tel}`);
  console.log();

  console.log("🔍 AI Metadata (Simulated):");
  console.log("─".repeat(50));
  console.log(`Confidence: ${(mockAIResponse.metadata.confidence * 100).toFixed(1)}%`);
  console.log(`Warnings: ${mockAIResponse.metadata.warnings.length > 0 ? mockAIResponse.metadata.warnings.join(", ") : "None"}`);
  console.log();

  console.log("🏗️  Menuiseries Extracted:");
  console.log("─".repeat(50));
  console.log(`Total: ${mockAIResponse.menuiseries.length}\n`);

  mockAIResponse.menuiseries.forEach((m, i) => {
    console.log(`${i + 1}. ${m.repere} - ${m.intitule}`);
    console.log(`   📐 Dimensions: ${m.largeur}mm x ${m.hauteur}mm`);
    if (m.gamme) console.log(`   🎨 Gamme: ${m.gamme}`);
    if (m.pose) console.log(`   🔧 Pose: ${m.pose}`);
    if (m.couleurInt) console.log(`   🎨 Couleur int: ${m.couleurInt}`);
    if (m.couleurExt) console.log(`   🎨 Couleur ext: ${m.couleurExt}`);
    console.log();
  });

  console.log("✅ Mock test completed successfully!");
  console.log();
  console.log("💡 Next steps:");
  console.log("   1. Add credits to your Anthropic account");
  console.log("   2. Run: npx tsx scripts/test-pdf-upload.ts");
  console.log("   3. Test with real AI parsing!");
}

testWithMock();
