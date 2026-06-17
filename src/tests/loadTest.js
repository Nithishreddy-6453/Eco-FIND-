/**
 * Lightweight, zero-dependency parallel load test tool.
 * Evaluates performance limits of deterministic mathematical models and API routing.
 */
import http from 'http';

const targetUrl = 'http://localhost:3000/api/coach/generate';
const concurrency = 20;
const totalRequests = 100;

const mockLifestyle = {
  transportMethod: 'gasolineCar',
  commuteKmPerWeek: 350,
  flightsPerYear: 3,
  dietType: 'heavyMeat',
  foodWastePerWeekKg: 5,
  electricityKwhPerMonth: 450,
  heatingFuel: 'naturalGas',
  shoppingIntensity: 'high'
};

let completed = 0;
let failed = 0;
const startTime = Date.now();

function sendRequest() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ lifestyle: mockLifestyle });

    const req = http.request(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          completed++;
        } else {
          failed++;
        }
        resolve();
      });
    });

    req.on('error', () => {
      failed++;
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log(`🚀 Starting Load Test on ${targetUrl}...`);
  console.log(`Concurrency: ${concurrency} parallel streams | Total: ${totalRequests}`);

  const queue = Array(totalRequests).fill(null);
  
  const workers = Array(concurrency).fill(null).map(async () => {
    while (queue.length > 0) {
      queue.shift();
      await sendRequest();
    }
  });

  await Promise.all(workers);

  const duration = (Date.now() - startTime) / 1000;
  console.log('\n=======================================');
  console.log('📊 LOAD TESTING REPORT');
  console.log('=======================================');
  console.log(`Total Requests Sent : ${totalRequests}`);
  console.log(`Successful Resolves : ${completed}`);
  console.log(`Failed Resolves     : ${failed}`);
  console.log(`Total Duration      : ${duration.toFixed(2)} seconds`);
  console.log(`Throughput Rate     : ${(completed / duration).toFixed(1)} req/sec`);
  console.log('=======================================\n');
}

// Only run immediately if executed directly via node CLI
if (process.argv[1].endsWith('loadTest.js')) {
  run();
}
