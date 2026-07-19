import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

function generateHash(content: string): string {
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: acceptance-entrypoint-generator <json-ir> <generated-test-output>');
    process.exit(2);
  }

  const jsonIrPath = path.resolve(args[0]);
  const generatedOutputPath = path.resolve(args[1]);

  if (!fs.existsSync(jsonIrPath)) {
    console.error(`Error: JSON IR file does not exist: ${jsonIrPath}`);
    process.exit(1);
  }

  let irData: any;
  try {
    irData = JSON.parse(fs.readFileSync(jsonIrPath, 'utf8'));
  } catch (err) {
    console.error(`Error parsing JSON IR file: ${err}`);
    process.exit(1);
  }

  // Derive feature_path from json-ir path
  const irBasename = path.basename(jsonIrPath, '.json');
  const featurePath = `features/${irBasename}.feature`;

  // Determine actual generated test file path
  let generatedTestFile: string;
  let generatedDir: string;
  if (fs.existsSync(generatedOutputPath) && fs.statSync(generatedOutputPath).isDirectory()) {
    generatedDir = generatedOutputPath;
    generatedTestFile = path.join(generatedOutputPath, `${irBasename}.spec.ts`);
  } else {
    generatedDir = path.dirname(generatedOutputPath);
    generatedTestFile = generatedOutputPath;
  }

  // Ensure directories exist
  fs.mkdirSync(generatedDir, { recursive: true });

  // Generate the Vitest test file code
  // The test dynamically reads the JSON IR path from process.env.ACCEPTANCE_IR_PATH or falls back to the generated path
  const relativeIrPath = path.relative(generatedDir, jsonIrPath);

  const testContent = `// Generated entry point for ${irData.name || 'Feature'}
// DO NOT EDIT DIRECTLY. This file is generated from: ${relativeIrPath}

import { describe, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AcceptanceRuntime } from './runtime';
import { registerSteps } from './steps';

describe('${irData.name || 'Acceptance Tests'}', () => {
  // Load IR dynamically to support mutation runs
  const irPath = process.env.ACCEPTANCE_IR_PATH || path.resolve(__dirname, ${JSON.stringify(relativeIrPath)});
  const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));

  const runtime = new AcceptanceRuntime();
  registerSteps(runtime);

  const background = ir.background || [];

  ir.scenarios.forEach((scenario: any) => {
    if (scenario.examples && scenario.examples.length > 0) {
      scenario.examples.forEach((example: any, idx: number) => {
        test(\`\${scenario.name}/example_\${idx + 1}\`, async () => {
          await runtime.runScenario(background, scenario, example);
        });
      });
    } else {
      test(\`\${scenario.name}/example_1\`, async () => {
        await runtime.runScenario(background, scenario, {});
      });
    }
  });
});
`;

  try {
    fs.writeFileSync(generatedTestFile, testContent, 'utf8');
  } catch (err) {
    console.error(`Error writing generated test file: ${err}`);
    process.exit(1);
  }

  // Calculate implementation_hash
  const implHash = generateHash(testContent);

  // Write metadata
  // Derive metadata filename: lowercase, non-alphanumeric replaced with hyphen
  const featureNormalized = featurePath
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const metadataFilename = `${featureNormalized}.json`;
  const metadataDir = path.join(generatedDir, 'metadata');
  fs.mkdirSync(metadataDir, { recursive: true });
  const metadataFilePath = path.join(metadataDir, metadataFilename);

  const relativeGeneratedTestFile = path.relative(process.cwd(), generatedTestFile);
  const relativeIrPathForMetadata = path.relative(process.cwd(), jsonIrPath);

  const metadata = {
    schema_version: 1,
    feature_path: featurePath,
    ir_path: relativeIrPathForMetadata,
    implementation_hash: implHash,
    hash_scope: 'generated_files',
    generated_files: [relativeGeneratedTestFile],
  };

  try {
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing metadata file: ${err}`);
    process.exit(1);
  }

  console.log(`Successfully generated tests: ${relativeGeneratedTestFile}`);
  console.log(`Successfully generated metadata: ${metadataFilePath}`);
  process.exit(0);
}

main();
