import * as pdfjsLib from 'pdfjs-dist';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

/**
 * PDF 미리보기 렌더링
 * @param {ArrayBuffer} pdfBytes - PDF 바이트
 * @param {HTMLElement} container - 썸네일을 넣을 컨테이너
 * @param {number} maxHeight - 최대 썸네일 높이 (픽셀)
 */
export async function renderPreview(pdfBytes, container, maxHeight = 200) {
    // 기존 썸네일 제거
    container.innerHTML = '';

    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // 스케일 계산
        const viewport = page.getViewport({ scale: 1 });
        const scale = maxHeight / viewport.height;
        const scaledViewport = page.getViewport({ scale });

        // 캔버스 생성
        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext('2d');
        await page.render({
            canvasContext: ctx,
            viewport: scaledViewport
        }).promise;

        // 썸네일 래퍼 생성
        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'preview-thumb';
        thumbDiv.appendChild(canvas);

        // 페이지 번호 라벨
        const label = document.createElement('div');
        label.className = 'page-label';
        label.textContent = `Page ${pageNum}`;
        thumbDiv.appendChild(label);

        container.appendChild(thumbDiv);
    }
}

/**
 * PDF 페이지 수 반환
 * @param {ArrayBuffer} pdfBytes 
 * @returns {Promise<number>}
 */
export async function getPageCount(pdfBytes) {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    return pdf.numPages;
}
