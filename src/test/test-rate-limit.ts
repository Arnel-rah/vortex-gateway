async function runSecurityTest() {
  const target = 'http://localhost:3000/health';
  console.log("Lancement du test de sécurité Vortex...");

  let violationsDetected = 0;
  let isBlacklisted = false;

  for (let i = 1; i <= 150; i++) {
    const response = await fetch(target);
    const status = response.status;

    if (status === 200) {
    } else if (status === 429) {
      violationsDetected++;
      console.log(`[429] Requête #${i}: Limite atteinte.`);
    } else if (status === 403) {
      console.log(`[403] Requête #${i}: BANNISSEMENT DÉTECTÉ !`);
      isBlacklisted = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  console.log("\n--- Rapport de Test ---");
  console.log(isBlacklisted 
    ? "Résultat : Le système de Blacklist fonctionne." 
    : " Résultat : L'IP n'a pas été bannie (vérifie tes réglages).");
}

runSecurityTest();