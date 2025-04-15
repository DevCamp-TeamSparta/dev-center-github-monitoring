import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get repository info from environment variables
const owner = process.env.GITHUB_OWNER || '';
const repo = process.env.GITHUB_REPO || '';

// 날짜 유효성 검사 함수 (yyyy-mm-dd 형식)
function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// 한국 시간 기준 시작일(00:00:00)을 생성하는 함수
function createKSTStartDate(dateString: string | undefined): Date {
  if (!dateString) {
    console.error('START_DATE가 .env 파일에 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!isValidDateFormat(dateString)) {
    console.error(
      `유효하지 않은 날짜 형식입니다: ${dateString} (yyyy-mm-dd 형식이어야 합니다)`
    );
    process.exit(1);
  }

  // 입력된 날짜 문자열을 한국 시간 기준으로 해석 (00:00:00)
  const date = new Date(`${dateString}T00:00:00+09:00`);
  return date;
}

// 한국 시간 기준 종료일(23:59:59)을 생성하는 함수
function createKSTEndDate(dateString: string | undefined): Date {
  if (!dateString) {
    console.error('END_DATE가 .env 파일에 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!isValidDateFormat(dateString)) {
    console.error(
      `유효하지 않은 날짜 형식입니다: ${dateString} (yyyy-mm-dd 형식이어야 합니다)`
    );
    process.exit(1);
  }

  // 입력된 날짜 문자열을 한국 시간 기준으로 해석 (23:59:59)
  const date = new Date(`${dateString}T23:59:59+09:00`);
  return date;
}

// 시작일 및 종료일 설정
const startDate = createKSTStartDate(process.env.START_DATE);
const endDate = createKSTEndDate(process.env.END_DATE);

// 환경 변수 유효성 검증
if (!owner || !repo) {
  console.error(
    'GITHUB_OWNER 또는 GITHUB_REPO가 .env 파일에 설정되지 않았습니다.'
  );
  process.exit(1);
}

console.log(
  `조회 기간: ${startDate.toISOString()} ~ ${endDate.toISOString()} (한국 시간 기준)`
);

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function getCommits() {
  // 조회 조건
  const param = {
    owner: owner,
    repo: repo,
    since: startDate.toISOString(),
    until: endDate.toISOString(),
  };

  // 커밋 조회
  const commits = await octokit.paginate(
    octokit.rest.repos.listActivities,
    param
  );
  const commitCount = commits.length;
  console.log(`조회 조건에 맞는 커밋 수: ${commitCount}`);
  return commitCount;
}
// getCommits();

// Issue(=PR) 조회
async function getIssues() {
  const param = {
    owner,
    repo,
    state: 'all', // open, closed, all
    since: startDate.toISOString(),
    until: endDate.toISOString(),
  };

  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, param);
  // console.log(issues);
  console.log(`조회 조건에 맞는 이슈 수: ${issues.length}`);

  let averageMergeTime = 0;

  for (const issue of issues) {
    const createdAt = new Date(issue.created_at);
    const closedAt = new Date(issue.closed_at);

    // I want to see time difference between createdAt and closedAt (seconds)
    const diffTime = Math.abs(closedAt.getTime() - createdAt.getTime());
    const diffSeconds = Math.ceil(diffTime / 1000);
    averageMergeTime += diffSeconds;
  }

  averageMergeTime = averageMergeTime / issues.length;
  console.log(`평균 병합 시간: ${averageMergeTime}초`);

  return { PRCount: issues.length, PRMergeTime: averageMergeTime };
}

async function main() {
  const commitCount = await getCommits();
  const prCount = await getIssues();

  console.log('-------------------------------------------------------------');
  console.log('GitHub 활동 지표');
  console.log(`커밋 수: ${commitCount}`);
  console.log(`PR 수: ${prCount.PRCount}`);
  console.log(`평균 병합 시간: ${prCount.PRMergeTime}초`);
  console.log('-------------------------------------------------------------');

  console.log('구글폼에 제출해주세요.');
}

main().catch(console.error);
