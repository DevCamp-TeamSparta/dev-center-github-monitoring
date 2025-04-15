# GitHub 저장소 모니터링 도구

이 프로젝트는 GitHub 저장소의 활동을 모니터링하기 위한 도구입니다. Octokit API를 사용하여 GitHub 저장소의 커밋 및 이슈와 같은 활동을 추적합니다.

## 요구사항

- Node.js 버전 20 이상
- GitHub 개인 액세스 토큰

## 설치 및 설정

1. 저장소를 클론합니다.
2. 의존성 패키지를 설치합니다:

```bash
npm install
```

3. 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=소유자명 또는 조직명
GITHUB_REPO=저장소명
START_DATE=2023-05-01
END_DATE=2023-06-01
```

4. 환경 변수 설명:

   - `GITHUB_TOKEN`: GitHub 개인 액세스 토큰
   - `GITHUB_OWNER`: 조회할 GitHub 저장소 소유자
   - `GITHUB_REPO`: 조회할 GitHub 저장소 이름
   - `START_DATE`: 조회 시작일 (yyyy-mm-dd 형식, 한국 시간 기준) - 필수 입력
   - `END_DATE`: 조회 종료일 (yyyy-mm-dd 형식, 한국 시간 기준) - 필수 입력

   ※ 모든 환경변수는 필수 입력 항목입니다. 설정되지 않은 경우 실행 시 오류가 발생합니다.

### 날짜 기준 상세 설명

- **시간 포함 범위**:

  - `START_DATE`는 해당 날짜의 00:00:00 KST(한국 시간)부터 시작합니다.
  - `END_DATE`는 해당 날짜의 23:59:59 KST(한국 시간)까지 포함합니다.
  - 예: `START_DATE=2023-05-01`, `END_DATE=2023-06-01`로 설정하면 2023년 5월 1일 00:00:00부터 2023년 6월 1일 23:59:59까지의 활동이 조회됩니다.

- **날짜 형식**:

  - 반드시 `yyyy-mm-dd` 형식이어야 합니다. (예: 2023-05-01)
  - 형식이 잘못된 경우 오류 메시지가 표시되고 프로그램이 종료됩니다.
  - 월과 일은 반드시 두 자리여야 합니다. (예: 05-01, 11-22)

- **시간대 처리**:
  - 모든 날짜는 한국 표준시(KST, UTC+9)를 기준으로 처리됩니다.
  - GitHub API에 전송될 때는 자동으로 ISO 형식으로 변환됩니다.

5. GitHub 토큰을 발급받아 위 파일에 입력합니다.

## 사용 방법

다음 명령어로 애플리케이션을 실행합니다:

```bash
npm start
```

### 실행 결과

프로그램 실행 시 다음과 같은 지표가 출력됩니다:

- **커밋 수**: 설정한 기간 동안의 총 커밋 수
- **PR 수**: 설정한 기간 동안의 총 PR(Pull Request) 수
- **평균 병합 시간**: PR이 생성된 시점부터 병합(또는 종료)까지 걸린 평균 시간(초 단위)

예시 출력:

```
조회 기간: 2023-04-01T00:00:00.000Z ~ 2023-06-01T23:59:59.000Z (한국 시간 기준)
조회 조건에 맞는 커밋 수: 56
조회 조건에 맞는 이슈 수: 23
평균 병합 시간: 86400초
커밋 수: 56
PR 수: 23
평균 병합 시간: 86400초
```

## 패키지 버전

| 패키지        | 버전    |
| ------------- | ------- |
| @octokit/rest | ^21.1.1 |
| dotenv        | ^16.5.0 |
| ts-node       | ^10.9.2 |
| typescript    | ^5.3.3  |

## 주요 기능

- GitHub 저장소의 커밋 내역 조회
- GitHub 저장소의 이슈 목록 및 상태 조회
- 이슈 생성부터 종료까지의 시간 계산
