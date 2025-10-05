/**
 * Test script for PDF upload and AI parsing
 * Usage: npx tsx scripts/test-pdf-upload.ts
 */

import fs from "fs";
import path from "path";

const PDF_PATH = path.join(__dirname, "../docs/fm.pdf");
const API_URL = "http://localhost:3000/api/upload/pdf";

async function testPDFUpload() {
  console.log("🚀 Testing PDF Upload with AI Parsing\n");

  // Check if PDF exists
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`❌ PDF not found at: ${PDF_PATH}`);
    process.exit(1);
  }

  console.log(`📄 PDF found: ${PDF_PATH}`);
  const fileStats = fs.statSync(PDF_PATH);
  console.log(`📊 File size: ${(fileStats.size / 1024).toFixed(2)} KB\n`);

  // Read PDF file
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const blob = new Blob([pdfBuffer], { type: "application/pdf" });

  // Create FormData
  const formData = new FormData();
  formData.append("file", blob, "fm.pdf");

  console.log("📤 Uploading to API...");
  console.log(`🌐 URL: ${API_URL}\n`);

  const startTime = Date.now();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️  Request completed in ${(duration / 1000).toFixed(2)}s\n`);

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:");
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log("✅ Success!\n");

    // Display results
    console.log("📋 Results:");
    console.log("─".repeat(50));
    console.log(`Project ID: ${data.data.projetId}`);
    console.log(`Reference: ${data.data.reference}`);
    console.log(`PDF URL: ${data.data.pdfUrl}`);
    console.log();

    console.log("🔍 AI Metadata:");
    console.log("─".repeat(50));
    const ai = data.data.parseStatus.aiMetadata;
    console.log(`Model: ${ai.model}`);
    console.log(`Confidence: ${(ai.confidence * 100).toFixed(1)}%`);
    console.log(`Tokens Used: ${ai.tokensUsed}`);
    console.log(`Retry Count: ${ai.retryCount}`);
    console.log(`Warnings: ${ai.warnings.length > 0 ? ai.warnings.join(", ") : "None"}`);
    console.log();

    console.log("🏗️  Menuiseries Extracted:");
    console.log("─".repeat(50));
    console.log(`Total: ${data.data.parseStatus.total}`);
    console.log();

    data.data.menuiseries.forEach((m: any, i: number) => {
      console.log(`${i + 1}. ${m.repere || "No repere"} - ${m.intitule}`);
      const donnees = m.donneesOriginales;
      console.log(`   Dimensions: ${donnees.largeur}mm x ${donnees.hauteur}mm`);
      if (donnees.gamme) console.log(`   Gamme: ${donnees.gamme}`);
      if (donnees.pose) console.log(`   Pose: ${donnees.pose}`);
      console.log();
    });

    console.log("🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Request failed:");
    console.error(error);
    process.exit(1);
  }
}

testPDFUpload();
