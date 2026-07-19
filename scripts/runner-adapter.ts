import * as readline from 'readline';
import { exec } from 'child_process';
import * as path from 'path';

interface JobRequest {
  id: string;
  feature_json: string;
  generated_dir: string;
  work_dir: string;
  timeout: string;
}

interface JobResponse {
  id: string;
  outcome: 'test_success' | 'test_failure' | 'infrastructure_error';
  output: string;
  error: string;
  duration: number; // in nanoseconds
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;

  let request: JobRequest;
  try {
    request = JSON.parse(line);
  } catch (err: any) {
    console.error(`[Adapter] Failed to parse input JSON: ${err.message}`);
    return;
  }

  const startTime = process.hrtime.bigint();

  // Run the Vitest command for acceptance tests with the custom IR path env var
  const env = {
    ...process.env,
    ACCEPTANCE_IR_PATH: path.resolve(request.feature_json)
  };

  const cmd = 'npx vitest run -c vite.config.acceptance.ts';

  exec(cmd, { env }, (error, stdout, stderr) => {
    const endTime = process.hrtime.bigint();
    const durationNs = Number(endTime - startTime);

    let outcome: JobResponse['outcome'] = 'test_success';
    let errorMsg = '';

    if (error) {
      // Vitest exits with non-zero when tests fail.
      // We can distinguish test failure from infrastructure errors.
      if (stdout.includes('FAIL') || stderr.includes('FAIL') || stdout.includes('failed') || stderr.includes('failed')) {
        outcome = 'test_failure';
      } else {
        outcome = 'infrastructure_error';
        errorMsg = error.message;
      }
    }

    const response: JobResponse = {
      id: request.id,
      outcome,
      output: stdout + '\n' + stderr,
      error: errorMsg,
      duration: durationNs
    };

    console.log(JSON.stringify(response));
  });
});
