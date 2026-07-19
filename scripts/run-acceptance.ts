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
    runCmd('bb gherkin-parser ../../features/recipe_generator.feature ../../tmp/recipe_generator.json', 'build/aps');

    // 3. Generate test entry points
    console.log('--- Generating Acceptance Test Entrypoints ---');
    runCmd('npx ts-node --esm scripts/acceptance-generator.ts tmp/recipe_generator.json src/acceptance');

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
