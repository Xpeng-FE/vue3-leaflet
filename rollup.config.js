import commonjs from "rollup-plugin-commonjs";
import VuePlugin from "rollup-plugin-vue";

export default {
    input: "./src/lib.js",
    output: [
        {
            file: "dist/xp-leaflet-vue.esm.js",
            format: "es",
            sourcemap: true,
        },
        {
            file: "dist/xp-leaflet-vue.cjs.js",
            format: "cjs",
            sourcemap: true,
        },
        {
            file: "dist/xp-leaflet-vue.umd.js",
            format: "umd",
            name: "xp-leaflet-vue",
            sourcemap: true,
            globals: {
                leaflet: "L",
                vue: "vue",
            },
        },
    ],
    plugins: [
        commonjs(),
        VuePlugin({
            css: false,
        }),
    ],
    external: [
        "vue",
        "leaflet/dist/leaflet-src.esm",
        "leaflet",
        "leaflet-polylinedecorator",
        "leaflet-editable",
        "leafletjs-canvas-overlay",
        "leaflet-path-transform",
    ],
};
