import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import dotenv from 'dotenv';

// 모킹
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => {
      return {
        paginate: jest.fn().mockImplementation((api, params) => {
          if (api === 'repos.listActivities') {
            return Promise.resolve([
              { id: 1, created_at: '2023-04-01T10:00:00Z' },
              { id: 2, created_at: '2023-04-15T10:00:00Z' },
              { id: 3, created_at: '2023-05-01T10:00:00Z' },
            ]);
          } else if (api === 'issues.listForRepo') {
            return Promise.resolve([
              {
                id: 1,
                created_at: '2023-04-05T10:00:00Z',
                closed_at: '2023-04-10T10:00:00Z',
              },
              {
                id: 2,
                created_at: '2023-04-15T10:00:00Z',
                closed_at: '2023-04-20T10:00:00Z',
              },
            ]);
          }
          return Promise.resolve([]);
        }),
        rest: {
          repos: {
            listActivities: 'repos.listActivities',
          },
          issues: {
            listForRepo: 'issues.listForRepo',
          },
        },
      };
    }),
  };
});

jest.mock('dotenv', () => {
  return {
    config: jest.fn(),
  };
});

// 테스트하기 전 환경변수 설정
const originalEnv = process.env;

describe('날짜 유효성 검사', () => {
  // main.ts에 있는 함수들을 테스트하기 위해 여기서 재정의
  function isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  beforeEach(() => {
    // 각 테스트 전에 환경변수 초기화
    process.env = { ...originalEnv };
    jest.resetAllMocks();
    jest.restoreAllMocks();

    // process.exit 모킹 (테스트 중 종료 방지)
    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process.exit called with code: ${code}`);
    });

    // 콘솔 에러 모킹 (테스트 출력 정리)
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // 각 테스트 후 환경변수 복원
    process.env = originalEnv;
  });

  test('유효한 날짜 형식인 경우 true 반환', () => {
    expect(isValidDateFormat('2023-05-01')).toBe(true);
    expect(isValidDateFormat('2022-12-31')).toBe(true);
    expect(isValidDateFormat('2024-02-29')).toBe(true); // 윤년
  });

  test('잘못된 날짜 형식인 경우 false 반환', () => {
    expect(isValidDateFormat('2023-5-1')).toBe(false); // 월,일이 한 자리
    expect(isValidDateFormat('2023/05/01')).toBe(false); // 슬래시 사용
    expect(isValidDateFormat('05-01-2023')).toBe(false); // 순서 잘못됨
    expect(isValidDateFormat('abcd-ef-gh')).toBe(false); // 숫자가 아님
    expect(isValidDateFormat('')).toBe(false); // 빈 문자열
  });

  test('유효하지 않은 날짜인 경우 false 반환', () => {
    expect(isValidDateFormat('2023-13-01')).toBe(false); // 13월은 없음
    expect(isValidDateFormat('2023-02-30')).toBe(false); // 2월 30일은 없음
    expect(isValidDateFormat('2023-04-31')).toBe(false); // 4월 31일은 없음
  });
});

describe('환경변수 테스트', () => {
  beforeEach(() => {
    process.env = {
      GITHUB_TOKEN: 'test_token',
      GITHUB_OWNER: 'test_owner',
      GITHUB_REPO: 'test_repo',
      START_DATE: '2023-04-01',
      END_DATE: '2023-06-01',
    };

    jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process.exit called with code: ${code}`);
    });

    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('필수 환경변수가 모두 있는 경우', async () => {
    // main 모듈을 동적으로 가져오기 위해 임시 함수 정의
    const importMain = async () => {
      try {
        const module = await import('./main.js');
        return module;
      } catch (error) {
        throw error;
      }
    };

    await expect(importMain()).resolves.not.toThrow();
  });

  test('GITHUB_OWNER가 없는 경우 에러 발생', () => {
    delete process.env.GITHUB_OWNER;

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'GITHUB_OWNER 또는 GITHUB_REPO가 .env 파일에 설정되지 않았습니다.'
      )
    );
  });

  test('GITHUB_REPO가 없는 경우 에러 발생', () => {
    delete process.env.GITHUB_REPO;

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'GITHUB_OWNER 또는 GITHUB_REPO가 .env 파일에 설정되지 않았습니다.'
      )
    );
  });

  test('START_DATE가 없는 경우 에러 발생', () => {
    delete process.env.START_DATE;

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('START_DATE가 .env 파일에 설정되지 않았습니다.')
    );
  });

  test('END_DATE가 없는 경우 에러 발생', () => {
    delete process.env.END_DATE;

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('END_DATE가 .env 파일에 설정되지 않았습니다.')
    );
  });

  test('START_DATE 형식이 잘못된 경우 에러 발생', () => {
    process.env.START_DATE = '2023/04/01';

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('유효하지 않은 날짜 형식입니다')
    );
  });

  test('END_DATE 형식이 잘못된 경우 에러 발생', () => {
    process.env.END_DATE = '2023-6-1';

    expect(() => require('./main')).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('유효하지 않은 날짜 형식입니다')
    );
  });
});

// 통합 테스트: API 호출 및 결과 처리
describe('GitHub API 호출 테스트', () => {
  beforeEach(() => {
    process.env = {
      GITHUB_TOKEN: 'test_token',
      GITHUB_OWNER: 'test_owner',
      GITHUB_REPO: 'test_repo',
      START_DATE: '2023-04-01',
      END_DATE: '2023-06-01',
    };

    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('getIssues 함수 호출 시 결과 반환', async () => {
    // main.ts에서 getIssues 함수 동작 테스트
    // 모듈을 임포트하기 전에 필요한 모킹을 설정
    const mainModule = require('./main');

    // API 호출 결과를 확인
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('조회 조건에 맞는 이슈 수: 2')
    );
  });
});
