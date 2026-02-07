// i18n translations
export const translations = {
    en: {
        // Header
        subtitle: "Merge single-sided PDF scans into double-sided documents",

        // Drop zones
        oddPages: "Odd Pages PDF",
        evenPages: "Even Pages PDF (Reversed)",
        dropHint: "Drag & drop or click to select",

        // Buttons
        swapFiles: "Swap Odd/Even Files",
        mergeAndSave: "🐱 Merge & Save",

        // Info box
        infoTip: "Even pages PDF is assumed to be scanned in ",
        infoReverse: "reverse order",

        // Preview
        preview: "Preview",
        previewEmpty: "Select PDF files to see preview",
        previewLoading: "Generating preview...",

        // Footer
        footerPrivacy: "All PDF processing happens in your browser. Files are never uploaded to any server. 🔒",
        terms: "Terms of Service",
        privacy: "Privacy Policy",

        // Modals
        termsTitle: "📜 Terms of Service",
        termsContent: {
            section1Title: "1. Service Overview",
            section1Text: "MEOW PDF MERGER (the \"Service\") is a free web service that merges single-sided scan PDFs into double-sided documents.",
            section2Title: "2. Terms of Use",
            section2Items: [
                "This service is free and requires no registration.",
                "Users must use this service for lawful purposes only.",
                "Do not use this service to reproduce or distribute copyrighted materials without permission."
            ],
            section3Title: "3. Service Provision",
            section3Items: [
                "All PDF processing is performed in the user's browser.",
                "The service is provided \"AS-IS\" without any warranties.",
                "The service provider may modify or discontinue the service without prior notice."
            ],
            section4Title: "4. Disclaimer",
            section4Text: "We are not responsible for any data loss or file corruption resulting from the use of this service. Please back up important files.",
            section5Title: "5. Changes to Terms",
            section5Text: "These terms may be changed without prior notice, and the updated terms take effect upon posting."
        },

        privacyTitle: "🔒 Privacy Policy",
        privacyContent: {
            section1Title: "1. Information We Collect",
            section1Highlight: "We collect no personal information.",
            section1Text: "MEOW PDF MERGER does not collect, store, or transmit any personal information.",
            section2Title: "2. How Files Are Processed",
            section2Items: [
                "Uploaded PDF files are processed ",
                "only in your browser",
                ".",
                "Files are never sent to any server and are not stored anywhere.",
                "All data is immediately deleted when you close the browser."
            ],
            section3Title: "3. Cookies & Tracking",
            section3Items: [
                "This service does not use cookies.",
                "No user behavior tracking (Analytics) is performed.",
                "No third-party ads or tracking scripts are used."
            ],
            section4Title: "4. Third-Party Sharing",
            section4Text: "Since we collect no information, there is nothing to share with third parties.",
            section5Title: "5. Contact",
            section5Text: "For questions about this privacy policy, please use GitHub Issues."
        },

        close: "Close",

        // Alerts
        alertPageMismatch: "Page count mismatch.\nOdd PDF: {odd} pages\nEven PDF: {even} pages",
        alertPreviewError: "Preview generation failed: ",
        alertMergeError: "Merge failed: "
    },

    ko: {
        // Header
        subtitle: "단면 스캔 PDF를 완벽한 양면 문서로 병합하세요",

        // Drop zones
        oddPages: "홀수 페이지 PDF",
        evenPages: "짝수 페이지 PDF (역순)",
        dropHint: "드래그하거나 클릭하세요",

        // Buttons
        swapFiles: "홀짝 파일 바꾸기",
        mergeAndSave: "🐱 병합 후 저장",

        // Info box
        infoTip: "짝수 페이지 PDF는 ",
        infoReverse: "역순",

        // Preview
        preview: "미리보기",
        previewEmpty: "PDF 파일을 선택하면 미리보기가 표시됩니다",
        previewLoading: "미리보기 생성 중...",

        // Footer
        footerPrivacy: "모든 PDF 처리는 브라우저에서 수행됩니다. 파일이 서버로 전송되지 않습니다. 🔒",
        terms: "이용약관",
        privacy: "개인정보 처리방침",

        // Modals
        termsTitle: "📜 이용약관",
        termsContent: {
            section1Title: "1. 서비스 개요",
            section1Text: "MEOW PDF MERGER(이하 \"서비스\")는 단면 스캔 PDF 파일을 양면 문서로 병합하는 무료 웹 서비스입니다.",
            section2Title: "2. 이용 조건",
            section2Items: [
                "본 서비스는 무료로 제공되며, 별도의 회원가입 없이 이용 가능합니다.",
                "사용자는 본 서비스를 합법적인 목적으로만 사용해야 합니다.",
                "저작권이 있는 문서의 무단 복제/배포 목적으로 사용할 수 없습니다."
            ],
            section3Title: "3. 서비스 제공",
            section3Items: [
                "모든 PDF 처리는 사용자의 브라우저에서 수행됩니다.",
                "서비스는 \"있는 그대로(AS-IS)\" 제공되며, 어떠한 보증도 하지 않습니다.",
                "서비스 제공자는 예고 없이 서비스를 변경하거나 중단할 수 있습니다."
            ],
            section4Title: "4. 면책 조항",
            section4Text: "서비스 이용으로 발생하는 데이터 손실, 파일 손상 등에 대해 책임지지 않습니다. 중요한 파일은 반드시 백업하시기 바랍니다.",
            section5Title: "5. 약관 변경",
            section5Text: "본 약관은 사전 통지 없이 변경될 수 있으며, 변경된 약관은 서비스에 게시된 시점부터 효력이 발생합니다."
        },

        privacyTitle: "🔒 개인정보 처리방침",
        privacyContent: {
            section1Title: "1. 수집하는 개인정보",
            section1Highlight: "수집하는 개인정보가 없습니다.",
            section1Text: "MEOW PDF MERGER는 어떠한 개인정보도 수집, 저장, 전송하지 않습니다.",
            section2Title: "2. 파일 처리 방식",
            section2Items: [
                "업로드된 PDF 파일은 ",
                "사용자의 브라우저에서만",
                " 처리됩니다.",
                "파일은 서버로 전송되지 않으며, 어디에도 저장되지 않습니다.",
                "브라우저를 닫으면 모든 데이터가 즉시 삭제됩니다."
            ],
            section3Title: "3. 쿠키 및 추적",
            section3Items: [
                "본 서비스는 쿠키를 사용하지 않습니다.",
                "사용자 행동 추적(Analytics)을 수행하지 않습니다.",
                "제3자 광고 또는 추적 스크립트가 없습니다."
            ],
            section4Title: "4. 제3자 제공",
            section4Text: "수집하는 정보가 없으므로, 제3자에게 제공되는 정보도 없습니다.",
            section5Title: "5. 문의",
            section5Text: "개인정보 처리방침에 대한 문의는 GitHub 저장소의 Issues를 통해 접수해주세요."
        },

        close: "닫기",

        // Alerts
        alertPageMismatch: "페이지 수가 일치하지 않습니다.\n홀수 PDF: {odd}페이지\n짝수 PDF: {even}페이지",
        alertPreviewError: "미리보기 생성 실패: ",
        alertMergeError: "병합 실패: "
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

export function getCurrentLang() {
    return currentLang;
}

export function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyTranslations();
}

export function t(key) {
    return translations[currentLang][key] || translations['en'][key] || key;
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });

    // Update lang toggle button
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.textContent = currentLang === 'en' ? '한국어' : 'English';
    }

    // Dispatch event for dynamic content
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang: currentLang } }));
}

// Initialize on load
export function initI18n() {
    applyTranslations();
}
