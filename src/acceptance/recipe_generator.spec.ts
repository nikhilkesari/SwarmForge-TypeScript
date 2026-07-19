// Generated entry point for Indian Recipe Generator
// DO NOT EDIT DIRECTLY. This file is generated from: ../../tmp/recipe_generator.json

import { describe, test } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AcceptanceRuntime } from './runtime';
import { registerSteps } from './steps';

describe('Indian Recipe Generator', () => {
  // Load IR dynamically to support mutation runs
  const irPath = process.env.ACCEPTANCE_IR_PATH || path.resolve(__dirname, "../../tmp/recipe_generator.json");
  const ir = JSON.parse(fs.readFileSync(irPath, 'utf8'));

  const runtime = new AcceptanceRuntime();
  registerSteps(runtime);

  const background = ir.background || [];

  ir.scenarios.forEach((scenario: any) => {
    if (scenario.examples && scenario.examples.length > 0) {
      scenario.examples.forEach((example: any, idx: number) => {
        test(`${scenario.name}/example_${idx + 1}`, async () => {
          await runtime.runScenario(background, scenario, example);
        });
      });
    } else {
      test(`${scenario.name}/example_1`, async () => {
        await runtime.runScenario(background, scenario, {});
      });
    }
  });
});
