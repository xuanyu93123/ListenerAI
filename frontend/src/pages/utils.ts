export function loadCSS(href: string) {
    // 檢查是否已經載入過相同的 CSS 文件
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    }
}