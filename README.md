# Second Brain — Hanna's 12WY OS

## Vercel 배포 방법

### 1단계: GitHub에 올리기
1. [github.com](https://github.com) 로그인
2. 우측 상단 **+** → **New repository**
3. Repository name: `second-brain`
4. **Create repository** 클릭
5. 이 폴더 전체를 업로드 (또는 git push)

### 2단계: Vercel 배포
1. [vercel.com](https://vercel.com) 로그인 (GitHub 계정으로 로그인 가능)
2. **Add New Project** 클릭
3. GitHub에서 `second-brain` repo 선택
4. **Import** 클릭

### 3단계: API 키 설정 (중요!)
Vercel 배포 화면에서:
1. **Environment Variables** 섹션 펼치기
2. 아래 값 추가:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (본인 API 키)
3. **Deploy** 클릭

### Anthropic API 키 발급
1. [console.anthropic.com](https://console.anthropic.com) 접속
2. 로그인 후 **API Keys** 메뉴
3. **Create Key** → 복사

### 완료!
배포 완료 후 `https://second-brain-xxx.vercel.app` 형태의 URL이 생성됩니다.
이 URL을 북마크하면 언제든지 접속 가능합니다.

## 데이터 저장
모든 데이터는 브라우저의 localStorage에 저장됩니다.
같은 브라우저에서 접속하면 데이터가 유지됩니다.
