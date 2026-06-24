현재 git staged 변경사항(`git diff --staged`)을 분석 후 아래 지침 적용
이후 만들어진 메시지를 아래 commit message에 작성해줘(line 23).

형식:
type: 제목 (50자 이내)

변경 내용 요약 1
변경 내용 요약 2

type 규칙:
- feat: 새 기능
- fix: 버그 수정
- refactor: 리팩토링
- chore: 설정, 패키지 등 기타
- docs: 문서

규칙:
- 제목은 한글로 작성
- staged 변경사항이 없으면 `git diff HEAD`로 대신 분석
- 커밋 메시지만 출력 (설명 없이)


## **commit message**

chore: 커밋 커스텀 커맨드 파일 추가
