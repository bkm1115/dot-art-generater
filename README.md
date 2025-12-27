# Dotart Comment Studio

브라우저에서 이미지를 점자(브라유) 텍스트로 변환해서 인스타/카톡 댓글에 붙여넣을 수 있는 도구입니다. 모든 처리는 로컬 캔버스에서만 진행됩니다.

## Features

- JPG/PNG 업로드 + 즉시 미리보기
- 점자(Braille) 2x4 매핑으로 텍스트 변환
- 기본 출력 크기(20열 x 12줄)로 시작하고 row/column 조절 가능
- 밝기/선명도 조절 + Floyd-Steinberg 디더링
- Copy to Clipboard

## Local Development

```bash
npm install
npm run dev
```

## 출력 크기

- 기본값은 가로 20글자, 세로 12줄입니다
- row/column 슬라이더로 크기를 조절할 수 있습니다
- 줄바꿈(`\n`)도 1글자로 계산됩니다

## 점자(Braille) 매핑 규칙

- 2x4 픽셀을 1개의 점자 문자로 변환
- 좌표별 dot 번호
  - (0,0)=dot1, (0,1)=dot2, (0,2)=dot3, (0,3)=dot7
  - (1,0)=dot4, (1,1)=dot5, (1,2)=dot6, (1,3)=dot8
- 코드포인트: `0x2800 + bitmask`

## Extensibility

- `src/utils/formatters.ts`의 formatter 인터페이스를 확장해 ASCII 모드를 추가할 수 있습니다.

## 정렬이 깨질 수 있는 이유

인스타 댓글 폰트는 고정폭이 아니어서, 동일한 글자 수라도 실제 폭이 달라질 수 있습니다. 프리뷰는 모노스페이스로 보여주지만 실제 댓글에서는 줄 정렬이 달라질 수 있습니다.

## 빈 점자 공백(U+2800)을 쓰는 이유

일반 스페이스는 인스타에서 연속 공백이 뭉개지거나 줄 끝이 잘릴 수 있습니다. U+2800(⠀)는 눈에 보이지 않는 점자 공백이지만 폭을 유지해 정렬을 더 안정적으로 만듭니다.

## Deployment

### Vercel

1. GitHub에 푸시
2. Vercel에서 Import
3. Framework: Vite
4. Build Command: `npm run build`
5. Output: `dist`

### Netlify

1. GitHub에 푸시
2. Netlify에서 New site from Git
3. Build Command: `npm run build`
4. Publish directory: `dist`
