async function runTest() {
    console.log("Starting Rate Limit Test...");
    
    for (let i = 1; i <= 25; i++) {
      const response = await fetch('http://localhost:3000/health');
      const status = response.status;
      const remaining = response.headers.get('X-RateLimit-Remaining');
      
      console.log(`Request #${i} | Status: ${status} | Remaining: ${remaining}`);
      
      if (status === 429) {
        console.log(" Success: Gateway blocked the overflow!");
        break;
      }
    }
  }
  
  runTest();