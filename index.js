const core = require('@actions/core');
const eventPayload = require(process.env.GITHUB_EVENT_PATH);

/**
 * 
 * @param {import('./types').Config} config 
 * @returns {import('./types').Config<string, true>[]}
 */
function compileRegularExpressions(config) {
  if (typeof config.regex === 'string') {
    return [{
      ...config,
      compiled: new RegExp(config.regex, config.flags)
    }];
  }
  return config.regex.map((x, i) => ({
    regex: x,
    flags: config.flags,
    compiled: new RegExp(x, config.flags[i] ?? ''),
    errorMessage: config.errorMessage[i] ?? ''
  }));
}

/**
 * @type {import('./types').Config}
 */
const titleCfg = {
  regex: core.getMultilineInput('title-regex') ?? '',
  flags: core.getMultilineInput('title-flags') ?? '',
  errorMessage: core.getMultilineInput('title-error-message') ?? 'The pull request title must match the following regex pattern to be valid:'
};

/**
 * @type {import('./types').Config}
 */
const bodyCfg = {
  regex: core.getMultilineInput('body-regex') ?? '',
  flags: core.getMultilineInput('body-flags') ?? '',
  errorMessage: core.getMultilineInput('body-error-message') ?? 'The pull request body must match the following regex pattern to be valid:'
};


const titleOutputs = compileRegularExpressions(titleCfg);
const bodyOutputs = compileRegularExpressions(bodyCfg);

(async () => {
  try {
    const title = eventPayload.pull_request.title;
    const body = eventPayload.pull_request.body;

    for (const tOutput of titleOutputs) {
      if (tOutput.compiled.test(title)) continue;
      core.setFailed(`${tOutput.errorMessage} regex: ${tOutput.regex} flags: ${titleCfg.flags}`);
      return;
    }
    for (const bOutput of bodyOutputs) {
      if (bOutput.compiled.test(body)) continue;
      core.setFailed(`${bOutput.errorMessage} regex: ${bOutput.regex} flags: ${titleCfg.flags}`);
      return
    }
  } catch (error) {
    core.setFailed(error.message)
  }
})();
