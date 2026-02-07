import { PDFDocument } from 'pdf-lib';

/**
 * 홀수 페이지 PDF와 짝수 페이지(역순) PDF를 교차 병합
 * @param {ArrayBuffer} oddBytes - 홀수 페이지 PDF 바이트
 * @param {ArrayBuffer} evenBytes - 짝수 페이지 PDF 바이트 (역순 상태)
 * @returns {Promise<Uint8Array>} - 병합된 PDF 바이트
 */
export async function mergePdfs(oddBytes, evenBytes) {
    const oddPdf = await PDFDocument.load(oddBytes);
    const evenPdf = await PDFDocument.load(evenBytes);

    const oddPageCount = oddPdf.getPageCount();
    const evenPageCount = evenPdf.getPageCount();

    if (oddPageCount !== evenPageCount) {
        throw new Error(`페이지 수가 일치하지 않습니다. 홀수: ${oddPageCount}, 짝수: ${evenPageCount}`);
    }

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < oddPageCount; i++) {
        // 홀수 페이지 추가 (정방향)
        const [oddPage] = await mergedPdf.copyPages(oddPdf, [i]);
        mergedPdf.addPage(oddPage);

        // 짝수 페이지 추가 (역순에서 가져오기)
        const evenIndex = oddPageCount - i - 1;
        const [evenPage] = await mergedPdf.copyPages(evenPdf, [evenIndex]);
        mergedPdf.addPage(evenPage);
    }

    return await mergedPdf.save();
}

/**
 * PDF 바이트를 Blob으로 변환하여 다운로드
 * @param {Uint8Array} pdfBytes 
 * @param {string} filename 
 */
export function downloadPdf(pdfBytes, filename = 'merged.pdf') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
