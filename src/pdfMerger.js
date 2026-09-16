import { degrees, PDFDocument } from 'pdf-lib';

export async function mergePdfs(oddBytes, evenBytes, options = {}) {
    const { evenOrder = 'reverse', rotateEven = false } = options;
    const oddPdf = await PDFDocument.load(oddBytes);
    const evenPdf = await PDFDocument.load(evenBytes);

    const oddPageCount = oddPdf.getPageCount();
    const evenPageCount = evenPdf.getPageCount();

    const hasTrailingOddPage = oddPageCount === evenPageCount + 1;
    if (oddPageCount !== evenPageCount && !hasTrailingOddPage) {
        throw new Error(`페이지 수가 일치하지 않습니다. 홀수: ${oddPageCount}, 짝수: ${evenPageCount}`);
    }

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < oddPageCount; i++) {
        const [oddPage] = await mergedPdf.copyPages(oddPdf, [i]);
        mergedPdf.addPage(oddPage);

        if (i >= evenPageCount) continue;

        const evenIndex = evenOrder === 'reverse' ? evenPageCount - i - 1 : i;
        const [evenPage] = await mergedPdf.copyPages(evenPdf, [evenIndex]);
        if (rotateEven) {
            const currentRotation = evenPage.getRotation().angle;
            evenPage.setRotation(degrees((currentRotation + 180) % 360));
        }
        mergedPdf.addPage(evenPage);
    }

    return await mergedPdf.save();
}

export function downloadPdf(pdfBytes, filename = 'merged.pdf') {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
