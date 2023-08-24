import {HtmlSanitizer} from "@/DocumentEditor/imports/HtmlSanitizer";

export const clearHtmlString = function(html) {
    html = HtmlSanitizer.SanitizeHtml(html)
    //console.log(html);

    if (isCopiedFromGoogleDocs(html)) {
        html = cleanFromGoogleDocWrapper(html)
    }
    // const doc = new DOMParser().parseFromString(html, "text/html");
    // const HTMLArray = [...doc.body.children].map(el => el.outerHTML);

    // console.log(HTMLArray)
    // console.log('----------');
    //console.log('res', html);
    return html;
}

const docsGoogleStart = '<b style="font-weight: normal;"><p style="text-align: center;">';
const docsGoogleEnd = '</p></b><br>';

const isCopiedFromGoogleDocs = function(html) {
    html = html.trim();
    return html.startsWith(docsGoogleStart) && html.endsWith(docsGoogleEnd);
}

const cleanFromGoogleDocWrapper = function(html) {
    return html.substring(docsGoogleStart.length + 1, html.length - docsGoogleEnd.length + 2);
}
