import { props as layerProps, setup as layerSetup } from "./layer";
/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

export const props = {
    ...layerProps,
    url: {
        type: String,
        required: true,
    },
    bounds: {
        type: [Array, Object],
        required: true,
    },
    opacity: {
        type: Number,
        custom: true,
        default: 1.0,
    },
    alt: {
        type: String,
        default: "",
    },
    interactive: {
        type: Boolean,
        default: false,
    },
    crossOrigin: {
        type: Boolean,
        default: false,
    },
    errorOverlayUrl: {
        type: String,
        custom: true,
        default: "",
    },
    zIndex: {
        type: Number,
        custom: true,
        default: 1,
    },
    className: {
        type: String,
        default: "",
    },
};

export const setup = (setupProps, LeafletRef, context) => {
    const { options: layerOptions, methods: layerMethods } = layerSetup(
        setupProps,
        LeafletRef,
        context
    );
    const options = {
        ...layerOptions,
        ...setupProps,
    };

    const methods = {
        ...layerMethods,
        /**
         * 设置图层透明度.
         * @param {number} opacity
         */
        setOpacity(opacity) {
            return LeafletRef.value.setOpacity(opacity);
        },
        /**
         * 设置图片地址
         * @param {string} url
         */
        setUrl(url) {
            return LeafletRef.value.setUrl(url);
        },
        /**
         * 设置图片覆盖范围
         * @param {LatLngBounds | Array<Array<number>>} bounds
         */
        setBounds(bounds) {
            return LeafletRef.value.setBounds(bounds);
        },
        /**
         * 获取图片覆盖范围
         * @returns {LatLngBounds}
         */
        getBounds() {
            return LeafletRef.value.getBounds();
        },
        /**
         * 获取图片所在地图上的dom节点
         * @returns {HTMLElement}
         */
        getElement() {
            return LeafletRef.value.getElement();
        },
        /**
         * 把图层放置所有图层的最上层
         */
        bringToFront() {
            return LeafletRef.value.bringToFront();
        },
        /**
         * 把图层放置所有图层的最下层
         */
        bringToBack() {
            return LeafletRef.value.bringToBack();
        },
        /**
         * 设置图层zindex
         * @param {number} zIndex
         */
        setZIndex(zIndex) {
            return LeafletRef.value.setZIndex(zIndex);
        },
    };

    return { options, methods };
};
