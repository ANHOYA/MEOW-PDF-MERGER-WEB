import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export async function renderPreview(pdfBytes, container, options = {}) {
    const {
        maxHeight = 200,
        maxPages = 40,
        shouldCancel = () => false,
        onProgress = () => {}
    } = options;
    container.innerHTML = '';

    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const numPages = pdf.numPages;
    const pagesToRender = Math.min(numPages, maxPages);

    try {
    for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
        if (shouldCancel()) break;
        const page = await pdf.getPage(pageNum);

        const viewport = page.getViewport({ scale: 1 });
        const scale = maxHeight / viewport.height;
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext('2d');
        await page.render({
            canvasContext: ctx,
            viewport: scaledViewport
        }).promise;

        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'preview-thumb';
        thumbDiv.appendChild(canvas);

        const label = document.createElement('div');
        label.className = 'page-label';
        label.textContent = `Page ${pageNum}`;
        thumbDiv.appendChild(label);

        container.appendChild(thumbDiv);
        onProgress(pageNum, pagesToRender, numPages);
        page.cleanup();
    }

    return { renderedPages: pagesToRender, totalPages: numPages };
    } finally {
        await pdf.destroy();
    }
}

export async function getPageCount(pdfBytes) {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const count = pdf.numPages;
    await pdf.destroy();
    return count;
}
