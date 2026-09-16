import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument } from 'pdf-lib';
import { mergePdfs } from '../src/pdfMerger.js';

async function createPdf(widths) {
    const pdf = await PDFDocument.create();
    widths.forEach((width) => pdf.addPage([width, 200]));
    return pdf.save();
}

async function pageWidths(bytes) {
    const pdf = await PDFDocument.load(bytes);
    return pdf.getPages().map((page) => page.getWidth());
}

test('interleaves reverse-order back pages', async () => {
    const odd = await createPdf([101, 103, 105]);
    const even = await createPdf([106, 104, 102]);
    const merged = await mergePdfs(odd, even);
    assert.deepEqual(await pageWidths(merged), [101, 102, 103, 104, 105, 106]);
});

test('supports a final front page without a matching back page', async () => {
    const odd = await createPdf([101, 103, 105]);
    const even = await createPdf([104, 102]);
    const merged = await mergePdfs(odd, even);
    assert.deepEqual(await pageWidths(merged), [101, 102, 103, 104, 105]);
});

test('supports forward-order back pages and rotation', async () => {
    const odd = await createPdf([101, 103]);
    const even = await createPdf([102, 104]);
    const merged = await mergePdfs(odd, even, { evenOrder: 'forward', rotateEven: true });
    const pdf = await PDFDocument.load(merged);
    assert.deepEqual(pdf.getPages().map((page) => page.getWidth()), [101, 102, 103, 104]);
    assert.deepEqual(pdf.getPages().map((page) => page.getRotation().angle), [0, 180, 0, 180]);
});

test('rejects incompatible page counts', async () => {
    const odd = await createPdf([101, 103]);
    const even = await createPdf([102, 104, 106]);
    await assert.rejects(() => mergePdfs(odd, even), /페이지 수/);
});
