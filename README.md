노드 버전

- v >= 20
-

개요
작업자들의 개발 작업 현황을 모니터링 하한 위한 목적으로 아래와 같은 항목들을 Daily로 측정하기 위한 script 레포지토리 입니다.

- PR 커밋 수
- PR 생성 수
- PR 사이클

특징

1. github에서 제공하는 Octokit 패키지를 이용합니다. (Restful API와 큰 차이 X)
2. 자동화되어 있지 않으며 ts-node 명령어를 이용해 script를 실행하고 이를 공유해줍니다.
