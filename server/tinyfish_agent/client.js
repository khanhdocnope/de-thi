/**
 * TinyFish API Client
 * Wraps TinyFish Web Agent Automation API & Search API
 * 
 * Note on Billing:
 * - Search API (https://api.search.tinyfish.ai): Free / search tier.
 * - Agent Automation API (https://agent.tinyfish.ai/v1/automation/run):
 *   Launches a cloud browser agent, navigates to target URL, executes goal in steps.
 *   Charges approx $0.016 per step directly from your TinyFish wallet balance.
 */

const fs = require('fs');
const path = require('path');

function getApiKey() {
  if (process.env.TINYFISH_API_KEY) {
    return process.env.TINYFISH_API_KEY.trim();
  }
  // Load from root .env
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(rootEnvPath)) {
    const content = fs.readFileSync(rootEnvPath, 'utf8');
    const match = content.match(/TINYFISH_API_KEY=([^\r\n]+)/);
    if (match) return match[1].trim();
  }
  throw new Error('TINYFISH_API_KEY not found in environment or .env file');
}

/**
 * Run a TinyFish Browser Automation Agent
 * @param {Object} options
 * @param {string} options.url - The target URL to navigate to (e.g. Vietjack, Wikipedia, Hocmai)
 * @param {string} options.goal - The goal/prompt for the browser agent to execute
 * @returns {Promise<Object>} The agent execution result, steps count, and output
 */
async function runAutomation({ url, goal }) {
  const apiKey = getApiKey();
  const endpoint = 'https://agent.tinyfish.ai/v1/automation/run';

  if (!url || !goal) {
    throw new Error('Both "url" and "goal" are required for TinyFish Agent Automation');
  }

  const startTime = Date.now();
  console.log(`[TinyFish Agent] Launching automation agent...`);
  console.log(`[TinyFish Agent] Target URL: ${url}`);
  console.log(`[TinyFish Agent] Goal: ${goal.slice(0, 100)}...`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, goal })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TinyFish API error (${response.status} ${response.statusText}): ${errorText}`);
  }

  const data = await response.json();
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const steps = data.num_of_steps || 0;
  const estimatedCost = (steps * 0.016).toFixed(4);

  console.log(`[TinyFish Agent] Finished in ${durationSec}s | Steps: ${steps} | Est. Cost: ~$${estimatedCost}`);

  return {
    run_id: data.run_id,
    status: data.status,
    steps,
    estimatedCost: `$${estimatedCost}`,
    durationSeconds: durationSec,
    result: data.result ? (data.result.result || data.result) : null,
    raw: data
  };
}

/**
 * Run a TinyFish Web Search query (lightweight / zero agent steps)
 * @param {string} query
 */
async function searchWeb(query) {
  const apiKey = getApiKey();
  const url = `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&language=vi`;

  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
      'X-TF-Request-Origin': 'api'
    }
  });

  if (!response.ok) {
    throw new Error(`TinyFish Search error (${response.status}): ${await response.text()}`);
  }

  return await response.json();
}

module.exports = {
  getApiKey,
  runAutomation,
  searchWeb
};
