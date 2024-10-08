const WXTagList = [
    "cover-image",
    "cover-view",
    "match-media",
    "movable-area",
    "movable-view",
    "page-container",
    "root-portal",
    "scroll-view",
    "share-element",
    "swiper",
    "swiper-item",
    "view",
    "icon",
    "progress",
    "rich-text",
    "text",
    "button",
    "checkbox",
    "checkbox-group",
    "editor",
    "form",
    "input",
    "keyboard-accessory",
    "label",
    "picker",
    "picker-view",
    "picker-view-column",
    "radio",
    "radio-group",
    "slider",
    "switch",
    "textarea",
    "functional-page-navigator",
    "navigator",
    "audio",
    "camera",
    "image",
    "live-player",
    "live-pusher",
    "video",
    "voip-room",
    "map",
    "canvas",
    "ad",
    "ad-custom",
    "official-account",
    "open-data",
    "web-view",
    "native-component",
    "aria-component",
    "navigation-bar",
    "page-meta",
    "block",
    "template",
    "trade-service"
];
let H5TagList = [];
let VueTagList = [
    "template",
    'slot'
];

let uniTagList = ['address', 'article', 'aside', 'body', 'caption', 'center', 'cite', 'footer', 'header', 'html', 'nav', 'section', 'pre', 'area', 'base', 'canvas', 'frame', 'iframe', 'input', 'link', 'map', 'meta', 'param', 'script', 'source', 'style', 'svg', 'textarea', 'title', 'track', 'wbr', 'rp', 'a', 'colgroup', 'fieldset', 'legend', 'bdi', 'bdo', 'rt', 'ruby', 'br', 'col', 'circle', 'ellipse', 'embed', 'hr', 'img', 'line', 'path', 'polygon', 'rect', 'use', 'abbr', 'ad', 'audio', 'b', 'blockquote', 'code', 'dd', 'del', 'dl', 'dt', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'i', 'ins', 'label', 'li', 'ol', 'p', 'q', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'video',

    "a",
    "canvas",
    "cell",
    "content",
    "countdown",
    "datepicker",
    "div",
    "element",
    "embed",
    "header",
    "image",
    "img",
    "indicator",
    "input",
    "link",
    "list",
    "loading-indicator",
    "loading",
    "marquee",
    "meta",
    "refresh",
    "richtext",
    "script",
    "scrollable",
    "scroller",
    "select",
    "slider-neighbor",
    "slider",
    "slot",
    "span",
    "spinner",
    "style",
    "svg",
    "switch",
    "tabbar",
    "tabheader",
    "template",
    "text",
    "textarea",
    "timepicker",
    "transition-group",
    "transition",
    "video",
    "view",
    "web"
];

export default  [...new Set([
    ...uniTagList,
    ...WXTagList,
    ...H5TagList,
    ...VueTagList
])];