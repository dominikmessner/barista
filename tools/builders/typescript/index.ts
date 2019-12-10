/**
 * @license
 * Copyright 2019 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { ExecOptions, exec } from 'child_process';
import { join } from 'path';
import { statSync } from 'fs';

/**
 * Spawns a shell then executes the command within that shell
 * @param command
 */
export async function executeCommand(
  command: string,
  cwd?: string,
): Promise<string> {
  const maxBuffer = 1024 * 1024 * 10;

  const options: ExecOptions = {
    cwd: cwd || process.cwd(),
    maxBuffer,
  };

  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout, stderr) => {
      if (err !== null) {
        reject(stdout);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function run(
  options: { tsConfig: string },
  context: BuilderContext,
): Promise<BuilderOutput> {
  const systemRoot = context.workspaceRoot;
  const configFile = join(systemRoot, options.tsConfig);

  if (!statSync(configFile).isFile()) {
    context.logger.error(
      'No tsconfig.json file found for compiling. Pls provide it via the tsConfig option.',
    );
    return {
      success: false,
    };
  }
  try {
    const logOutput = await executeCommand(
      `node_modules/.bin/tsc -p ${configFile}`,
    );
    if (logOutput) {
      context.logger.info(logOutput);
    }
  } catch (error) {
    context.logger.error(error);
    return {
      success: false,
    };
  }
  return {
    success: true,
  };
}
export default createBuilder<{ tsConfig: string }>(run);
