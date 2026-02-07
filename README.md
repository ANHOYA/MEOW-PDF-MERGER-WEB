# MEOW PDF MERGER 🐱

**단면 스캔 PDF를 완벽한 양면 문서로 병합하세요!**

MEOW PDF MERGER는 단면 스캔만 지원하는 스캐너(ADF) 사용자를 위한 편리한 PDF 병합 도구입니다.  
**100% 클라이언트 사이드** - 모든 PDF 처리가 브라우저에서 수행되어 파일이 서버로 전송되지 않습니다. 🔒

<div align="center">
<img width="100%" alt="MEOW PDF MERGER Web UI" src="public/screenshot.png" />
</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🖱️ **Drag & Drop** | 파일을 UI 위로 드래그하여 간편하게 등록 |
| 👁️ **실시간 미리보기** | 병합 결과를 저장 전에 확인 |
| 🔄 **홀짝 교체** | 파일을 잘못 넣었을 경우 즉시 교체 가능 |
| ✅ **페이지 수 검증** | 두 파일의 페이지 수가 일치하지 않으면 경고 |
| � **100% 프라이버시** | 모든 처리가 브라우저에서 수행 |

---

## 🚀 빠른 시작

### 온라인 사용
> 🌐 [바로 사용하기](https://meow-pdf-merger-web.vercel.app/)

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/ANHOYA/MEOW-PDF-MERGER-WEB.git
cd MEOW-PDF-MERGER-WEB

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# → http://localhost:5173/
```

---

## 📖 사용 방법

1. **홀수 페이지 PDF** (1, 3, 5...) 를 왼쪽 상단 영역에 드래그
2. **짝수 페이지 PDF** (역순: 6, 4, 2...) 를 왼쪽 하단 영역에 드래그
3. 미리보기에서 페이지 순서 확인
4. **"🐱 병합 후 저장"** 클릭하여 다운로드

> 💡 **TIP**: 짝수 페이지 파일은 **역순**으로 스캔된 상태로 가정합니다.

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 빌드 | Vite |
| 스타일 | Tailwind CSS |
| PDF 조작 | pdf-lib |
| PDF 렌더링 | pdfjs-dist |

```
📁 프로젝트 구조
├── index.html          # 메인 HTML
├── src/
│   ├── main.js         # 앱 진입점
│   ├── pdfMerger.js    # PDF 병합 로직
│   ├── pdfPreview.js   # 미리보기 렌더링
│   └── style.css       # 스타일
├── package.json
└── vite.config.js
```

---

## 📦 빌드 & 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

`dist/` 폴더를 GitHub Pages, Vercel, Netlify 등에 정적 호스팅하면 됩니다.

---

## ⚠️ 주의 사항

- **짝수 페이지 역순 가정**: 짝수 페이지 파일은 역순으로 스캔된 상태라고 가정합니다.
- **암호화된 PDF**: 암호가 걸린 PDF는 병합이 실패할 수 있습니다.
- **대용량 PDF**: 100MB 이상의 큰 파일은 브라우저 메모리 제한에 주의하세요.

---

## 📄 License

MIT License
