
export interface Step {
  keyword: string;
  text: string;
  parameters?: string[];
}

export interface Scenario {
  name: string;
  steps: Step[];
  examples: Record<string, string>[];
}

export interface FeatureIR {
  name: string;
  background?: Step[];
  scenarios: Scenario[];
}

export type StepHandlerFn = (world: any, example: Record<string, string>, ...args: string[]) => void | Promise<void>;

export interface StepDefinition {
  pattern: RegExp | string;
  handler: StepHandlerFn;
}

export class AcceptanceRuntime {
  private stepDefinitions: StepDefinition[] = [];

  defineStep(pattern: RegExp | string, handler: StepHandlerFn) {
    this.stepDefinitions.push({ pattern, handler });
  }

  async runScenario(
    background: Step[],
    scenario: Scenario,
    example: Record<string, string>
  ) {
    const world: any = {};
    const stepsToRun = [...background, ...scenario.steps];

    for (const step of stepsToRun) {
      await this.runStep(step, example, world);
    }
  }

  private async runStep(step: Step, example: Record<string, string>, world: any) {
    // Check all step definitions for a match
    for (const def of this.stepDefinitions) {
      if (typeof def.pattern === 'string') {
        if (def.pattern === step.text) {
          await def.handler(world, example);
          return;
        }
      } else {
        const match = def.pattern.exec(step.text);
        if (match) {
          // The matches are captured groups (e.g. placeholder names)
          const args = match.slice(1);
          await def.handler(world, example, ...args);
          return;
        }
      }
    }
    throw new Error(`Step did not match any registered handler: "${step.keyword} ${step.text}"`);
  }
}
