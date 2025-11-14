const MAX_TITLE_LENGTH = 80;
const DEFAULT_PREFIX = 'Bug';

function getEnvVar(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function clip(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

function extractFirstSentence(text: string) {
  const sentenceMatch = text.match(/^.*?[.!?](?:\s|$)/);
  return sentenceMatch ? sentenceMatch[0].trim() : text;
}

function buildIssueTitle(summary: string, prefix = DEFAULT_PREFIX) {
  const normalized = collapseWhitespace(summary || '');
  if (!normalized) {
    return `${prefix}: Support form submission`;
  }
  const firstSentence = extractFirstSentence(normalized);
  const availableLength = Math.max(10, MAX_TITLE_LENGTH - (prefix.length + 2));
  return `${prefix}: ${clip(firstSentence, availableLength)}`;
}

type IssueOptions = {
  labels?: string[];
  titlePrefix?: string;
};

export async function createGithubIssue(
  summary: string,
  body: string,
  options: IssueOptions = {}
) {
  const token = getEnvVar('GITHUB_PAT');
  const repoOwner = getEnvVar('GITHUB_REPO_OWNER');
  const repoName = getEnvVar('GITHUB_REPO_NAME');

  const labels = options.labels ?? ['support-form', 'bug'];
  const title = buildIssueTitle(summary, options.titlePrefix);
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
        'User-Agent': 'whatcha-bringin-api',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title,
        body,
        labels,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `GitHub issue creation failed (${response.status}): ${errorBody}`
    );
  }

  return response.json();
}

export function _test_only_buildIssueTitle(summary: string, prefix?: string) {
  return buildIssueTitle(summary, prefix);
}
