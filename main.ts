import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = today.getUTCDate().toString().padStart(2, '0');
  const todayDateString = `${year}-${month}-${day}`;

  const owner = `DevCamp-TeamSparta`;
  const repo = 'effic-frontend-v2';

  const commitSearchQuery = `repo:${owner}/${repo} committer-date:${todayDateString}`;
  const commitResult = await octokit.rest.search.commits({
    q: commitSearchQuery,
    per_page: 1,
  });
  const commitCount = commitResult.data.total_count;

  console.log(commitCount);

  console.log('Hello World');
  // Now you can use the octokit instance for GitHub API calls
}

main().catch((error) => {
  console.error('Error in main function:', error);
  process.exit(1);
});

// node --loader ts-node/esm main.ts
