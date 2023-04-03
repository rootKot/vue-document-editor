import {HtmlSanitizer} from "@/DocumentEditor/imports/HtmlSanitizer";

export const clearHtmlString = function(html) {
    // console.log(html);
    html = HtmlSanitizer.SanitizeHtml(html)
    // console.log('----------');
    // console.log(html);
    return html;
}
