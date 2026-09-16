import './style.css';
import { mergePdfs, downloadPdf } from './pdfMerger.js';
import { renderPreview, getPageCount } from './pdfPreview.js';
import { translations, getCurrentLang, setLang, t, initI18n } from './i18n.js';

let oddFile = null;
let evenFile = null;
let previewRevision = 0;
let cachedMergedBytes = null;
let filesAreValid = false;

const byId = (id) => document.getElementById(id);
const dropOdd = byId('drop-odd');
const dropEven = byId('drop-even');
const inputOdd = byId('input-odd');
const inputEven = byId('input-even');
const oddFilename = byId('odd-filename');
const evenFilename = byId('even-filename');
const btnSwap = byId('btn-swap');
const btnMerge = byId('btn-merge');
const btnMergeLabel = byId('btn-merge-label');
const previewEmpty = byId('preview-empty');
const previewContainer = byId('preview-container');
const previewScroll = byId('preview-scroll');
const previewLoading = byId('preview-loading');
const previewStatus = byId('preview-status');
const evenOrder = byId('even-order');
const rotateEven = byId('rotate-even');

function format(key, values = {}) {
    return Object.entries(values).reduce(
        (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
        t(key)
    );
}

function setStatus(message = '', tone = 'neutral') {
    previewStatus.textContent = message;
    previewStatus.dataset.tone = tone;
    previewStatus.classList.toggle('hidden', !message);
}

function setPreviewState(state) {
    previewEmpty.classList.toggle('hidden', state !== 'empty');
    previewLoading.classList.toggle('hidden', state !== 'loading');
    previewContainer.classList.toggle('hidden', state !== 'ready');
}

function updateButtons(processing = false) {
    const hasBoth = Boolean(oddFile && evenFile);
    btnSwap.disabled = processing || !hasBoth;
    btnMerge.disabled = processing || !hasBoth || !filesAreValid;
    evenOrder.disabled = processing;
    rotateEven.disabled = processing;
}

function looksLikePdf(file, bytes) {
    const signature = new TextDecoder().decode(bytes.slice(0, 5));
    return file.name.toLowerCase().endsWith('.pdf') && signature === '%PDF-';
}

async function handleFile(file, type) {
    try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        if (!looksLikePdf(file, bytes)) {
            setStatus(t('invalidFile'), 'error');
            return;
        }

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

        filesAreValid = false;
        cachedMergedBytes = null;
        updateButtons();
        await tryPreview();
    } catch (error) {
        console.error('File read error:', error);
        setStatus(`${t('fileReadError')} ${error.message}`, 'error');
    }
}

function getMergeOptions() {
    return { evenOrder: evenOrder.value, rotateEven: rotateEven.checked };
}

async function tryPreview() {
    const revision = ++previewRevision;
    cachedMergedBytes = null;
    filesAreValid = false;
    previewScroll.replaceChildren();

    if (!oddFile || !evenFile) {
        setPreviewState('empty');
        setStatus('');
        updateButtons();
        return;
    }

    setPreviewState('loading');
    setStatus(t('checkingFiles'));
    updateButtons(true);

    try {
        const [oddCount, evenCount] = await Promise.all([
            getPageCount(oddFile.bytes.slice()),
            getPageCount(evenFile.bytes.slice())
        ]);
        if (revision !== previewRevision) return;

        if (oddCount !== evenCount && oddCount !== evenCount + 1) {
            setPreviewState('empty');
            setStatus(format('alertPageMismatch', { odd: oddCount, even: evenCount }), 'error');
            updateButtons();
            return;
        }

        setStatus(t('mergingPreview'));
        const mergedBytes = await mergePdfs(oddFile.bytes.slice(), evenFile.bytes.slice(), getMergeOptions());
        if (revision !== previewRevision) return;

        const result = await renderPreview(mergedBytes.slice(), previewScroll, {
            maxHeight: 200,
            maxPages: 40,
            shouldCancel: () => revision !== previewRevision,
            onProgress: (current, visible) => {
                if (revision === previewRevision) setStatus(format('previewProgress', { current, total: visible }));
            }
        });
        if (revision !== previewRevision) return;

        cachedMergedBytes = mergedBytes;
        filesAreValid = true;
        setPreviewState('ready');
        const statusKey = result.totalPages > result.renderedPages ? 'readyLimited' : 'ready';
        setStatus(format(statusKey, { total: result.totalPages, rendered: result.renderedPages }), 'success');
    } catch (error) {
        if (revision !== previewRevision) return;
        console.error('Preview error:', error);
        setPreviewState('empty');
        setStatus(`${t('alertPreviewError')}${error.message}`, 'error');
    } finally {
        if (revision === previewRevision) updateButtons(false);
    }
}

function swapFiles() {
    [oddFile, evenFile] = [evenFile, oddFile];
    oddFilename.textContent = oddFile?.name || t('dropHint');
    evenFilename.textContent = evenFile?.name || t('dropHint');
    dropOdd.classList.toggle('has-file', Boolean(oddFile));
    dropEven.classList.toggle('has-file', Boolean(evenFile));
    tryPreview();
}

async function mergeAndSave() {
    if (!oddFile || !evenFile || !filesAreValid) return;
    updateButtons(true);
    btnMergeLabel.textContent = t('merging');
    try {
        const mergedBytes = cachedMergedBytes || await mergePdfs(oddFile.bytes.slice(), evenFile.bytes.slice(), getMergeOptions());
        const baseName = oddFile.name.replace(/\.pdf$/i, '');
        downloadPdf(mergedBytes, `${baseName}_merged.pdf`);
        setStatus(t('downloadReady'), 'success');
    } catch (error) {
        console.error('Merge error:', error);
        setStatus(`${t('alertMergeError')}${error.message}`, 'error');
    } finally {
        btnMergeLabel.textContent = t('mergeAndSave');
        updateButtons(false);
    }
}

function setupDropZone(dropZone, inputEl, type) {
    const openPicker = () => inputEl.click();
    dropZone.addEventListener('click', openPicker);
    dropZone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
        }
    });
    inputEl.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) handleFile(file, type);
        event.target.value = '';
    });
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        if (file) handleFile(file, type);
    });
}

setupDropZone(dropOdd, inputOdd, 'odd');
setupDropZone(dropEven, inputEven, 'even');
btnSwap.addEventListener('click', swapFiles);
btnMerge.addEventListener('click', mergeAndSave);
evenOrder.addEventListener('change', tryPreview);
rotateEven.addEventListener('change', tryPreview);
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());

const modalTerms = byId('modal-terms');
const modalPrivacy = byId('modal-privacy');
byId('btn-terms')?.addEventListener('click', () => modalTerms.showModal());
byId('btn-privacy')?.addEventListener('click', () => modalPrivacy.showModal());
document.querySelectorAll('.modal-close').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
});
[modalTerms, modalPrivacy].forEach((modal) => {
    modal?.addEventListener('click', (event) => {
        if (event.target === modal) modal.close();
    });
});

const termsContent = byId('terms-content');
const privacyContent = byId('privacy-content');
function renderModalContent() {
    const { termsContent: terms, privacyContent: privacy } = translations[getCurrentLang()];
    termsContent.innerHTML = `
        <h3 class="text-white font-semibold">${terms.section1Title}</h3><p>${terms.section1Text}</p>
        <h3 class="text-white font-semibold">${terms.section2Title}</h3><ul class="list-disc list-inside space-y-1">${terms.section2Items.map((item) => `<li>${item}</li>`).join('')}</ul>
        <h3 class="text-white font-semibold">${terms.section3Title}</h3><ul class="list-disc list-inside space-y-1">${terms.section3Items.map((item) => `<li>${item}</li>`).join('')}</ul>
        <h3 class="text-white font-semibold">${terms.section4Title}</h3><p>${terms.section4Text}</p>
        <h3 class="text-white font-semibold">${terms.section5Title}</h3><p>${terms.section5Text}</p>`;
    privacyContent.innerHTML = `
        <h3 class="text-white font-semibold">${privacy.section1Title}</h3><p><strong class="text-green-400">${privacy.section1Highlight}</strong></p><p>${privacy.section1Text}</p>
        <h3 class="text-white font-semibold">${privacy.section2Title}</h3><ul class="list-disc list-inside space-y-1"><li>${privacy.section2Items[0]}<strong class="text-cyan-400">${privacy.section2Items[1]}</strong>${privacy.section2Items[2]}</li><li>${privacy.section2Items[3]}</li><li>${privacy.section2Items[4]}</li></ul>
        <h3 class="text-white font-semibold">${privacy.section3Title}</h3><ul class="list-disc list-inside space-y-1">${privacy.section3Items.map((item) => `<li>${item}</li>`).join('')}</ul>
        <h3 class="text-white font-semibold">${privacy.section4Title}</h3><p>${privacy.section4Text}</p>
        <h3 class="text-white font-semibold">${privacy.section5Title}</h3><p>${privacy.section5Text}</p>`;
}

byId('lang-toggle')?.addEventListener('click', () => {
    setLang(getCurrentLang() === 'en' ? 'ko' : 'en');
    renderModalContent();
    oddFilename.textContent = oddFile?.name || t('dropHint');
    evenFilename.textContent = evenFile?.name || t('dropHint');
    btnMergeLabel.textContent = t('mergeAndSave');
    if (oddFile && evenFile) tryPreview();
});

initI18n();
renderModalContent();
updateButtons();
