import { execSync } from 'child_process';
import * as fs from 'fs';

function runCmd(cmd: string, cwd?: string) {
  console.log(`Running: ${cmd} (in ${cwd || '.'})`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

function main() {
  try {
    // 1. Ensure directories exist
    fs.mkdirSync('tmp', { recursive: true });
    fs.mkdirSync('src/acceptance', { recursive: true });

    // 2. Parse feature files using Babashka gherkin-parser task
    console.log('--- Parsing Gherkin Features ---');
    const features = fs.readdirSync('features').filter(f => f.endsWith('.feature'));
    for (const feature of features) {
      const baseName = feature.replace(/\.feature$/, '');
      runCmd(`bb gherkin-parser ../../features/${feature} ../../tmp/${baseName}.json`, 'build/aps');

      // 3. Generate test entry points
      console.log(`--- Generating Acceptance Test Entrypoint for ${feature} ---`);
      runCmd(`npx ts-node --esm scripts/acceptance-generator.ts tmp/${baseName}.json src/acceptance`);
    }

    // 4. Run the generated tests using Vitest
    console.log('--- Running Vitest Acceptance Tests ---');
    runCmd('npx vitest run -c vite.config.acceptance.ts');

    console.log('Acceptance tests passed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Acceptance test execution failed:', err);
    process.exit(1);
  }
}

main();
