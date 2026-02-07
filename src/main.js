import './style.css';
import { mergePdfs, downloadPdf } from './pdfMerger.js';
import { renderPreview, getPageCount } from './pdfPreview.js';

// ─── State ───────────────────────────────────────────────
let oddFile = null;   // { name: string, bytes: ArrayBuffer }
let evenFile = null;

// ─── DOM Elements ────────────────────────────────────────
const dropOdd = document.getElementById('drop-odd');
const dropEven = document.getElementById('drop-even');
const inputOdd = document.getElementById('input-odd');
const inputEven = document.getElementById('input-even');
const oddFilename = document.getElementById('odd-filename');
const evenFilename = document.getElementById('even-filename');
const btnSwap = document.getElementById('btn-swap');
const btnMerge = document.getElementById('btn-merge');
const previewEmpty = document.getElementById('preview-empty');
const previewContainer = document.getElementById('preview-container');
const previewScroll = document.getElementById('preview-scroll');
const previewLoading = document.getElementById('preview-loading');

// ─── File Handling ───────────────────────────────────────
async function handleFile(file, type) {
    const arrayBuffer = await file.arrayBuffer();
    // ArrayBuffer를 Uint8Array로 복사하여 detach 방지
    const bytes = new Uint8Array(arrayBuffer);
    const fileData = { name: file.name, bytes };

    if (type === 'odd') {
        oddFile = fileData;
        oddFilename.textContent = file.name;
        dropOdd.classList.add('has-file');
    } else {
        evenFile = fileData;
        evenFilename.textContent = file.name;
        dropEven.classList.add('has-file');
    }

    updateButtons();
    tryPreview();
}

function updateButtons() {
    const hasBoth = oddFile && evenFile;
    btnSwap.disabled = !hasBoth;
    btnMerge.disabled = !hasBoth;
}

// ─── Preview ─────────────────────────────────────────────
async function tryPreview() {
    if (!oddFile || !evenFile) return;

    // 페이지 수 확인 (복사본 사용)
    const oddCount = await getPageCount(oddFile.bytes.slice());
    const evenCount = await getPageCount(evenFile.bytes.slice());

    if (oddCount !== evenCount) {
        alert(`페이지 수가 일치하지 않습니다.\n홀수 PDF: ${oddCount}페이지\n짝수 PDF: ${evenCount}페이지`);
        return;
    }

    // 로딩 상태
    previewEmpty.classList.add('hidden');
    previewContainer.classList.add('hidden');
    previewLoading.classList.remove('hidden');

    try {
        // 병합 후 미리보기 생성 (복사본 사용)
        const oddCopy = oddFile.bytes.slice();
        const evenCopy = evenFile.bytes.slice();
        const mergedBytes = await mergePdfs(oddCopy, evenCopy);
        await renderPreview(mergedBytes, previewScroll, 200);

        previewLoading.classList.add('hidden');
        previewContainer.classList.remove('hidden');
    } catch (err) {
        console.error('Preview error:', err);
        previewLoading.classList.add('hidden');
        previewEmpty.classList.remove('hidden');
        alert('미리보기 생성 실패: ' + err.message);
    }
}

// ─── Swap Files ──────────────────────────────────────────
function swapFiles() {
    [oddFile, evenFile] = [evenFile, oddFile];

    // UI 업데이트
    oddFilename.textContent = oddFile?.name || '드래그하거나 클릭하세요';
    evenFilename.textContent = evenFile?.name || '드래그하거나 클릭하세요';

    dropOdd.classList.toggle('has-file', !!oddFile);
    dropEven.classList.toggle('has-file', !!evenFile);

    tryPreview();
}

// ─── Merge & Download ────────────────────────────────────
async function mergeAndSave() {
    if (!oddFile || !evenFile) return;

    btnMerge.disabled = true;
    btnMerge.textContent = '병합 중...';

    try {
        // 복사본 사용하여 병합
        const oddCopy = oddFile.bytes.slice();
        const evenCopy = evenFile.bytes.slice();
        const mergedBytes = await mergePdfs(oddCopy, evenCopy);

        // 파일명 생성: odd 파일명 기반
        const baseName = oddFile.name.replace(/\.pdf$/i, '');
        const outputName = `${baseName}_merged.pdf`;

        downloadPdf(mergedBytes, outputName);
    } catch (err) {
        console.error('Merge error:', err);
        alert('병합 실패: ' + err.message);
    } finally {
        btnMerge.disabled = false;
        btnMerge.textContent = '🐱 병합 후 저장';
    }
}

// ─── Drag & Drop Setup ───────────────────────────────────
function setupDropZone(dropZone, inputEl, type) {
    // 클릭하면 파일 선택
    dropZone.addEventListener('click', () => inputEl.click());

    // 파일 선택 시
    inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file, type);
    });

    // 드래그 이벤트
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            handleFile(file, type);
        }
    });
}

// ─── Event Listeners ─────────────────────────────────────
setupDropZone(dropOdd, inputOdd, 'odd');
setupDropZone(dropEven, inputEven, 'even');
btnSwap.addEventListener('click', swapFiles);
btnMerge.addEventListener('click', mergeAndSave);

// 전역 드래그 방지 (윈도우에 드롭 시 브라우저가 파일 열지 않도록)
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());

// ─── Modal Handlers ──────────────────────────────────────
const modalTerms = document.getElementById('modal-terms');
const modalPrivacy = document.getElementById('modal-privacy');
const btnTerms = document.getElementById('btn-terms');
const btnPrivacy = document.getElementById('btn-privacy');

btnTerms?.addEventListener('click', () => modalTerms.showModal());
btnPrivacy?.addEventListener('click', () => modalPrivacy.showModal());

// 닫기 버튼 및 배경 클릭으로 닫기
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        modalTerms.close();
        modalPrivacy.close();
    });
});

[modalTerms, modalPrivacy].forEach(modal => {
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
    });
});
