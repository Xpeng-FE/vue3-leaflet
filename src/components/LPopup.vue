<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    propsBinder,
    remapEvents,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { props, setup as popupSetup } from "../functions/popup";
import { render } from "../functions/popper";
import "../functions/popupCare";

/**
 * 展示弹出框
 */
export default {
    name: "LPopup",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const root = ref(null);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const bindPopup = inject("bindPopup");

        const { options, methods } = popupSetup(props, leafletRef, context);

        onMounted(async () => {
            const { popupCare, DomEvent, DomUtil } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            leafletRef.value = popupCare(options);

            if (props.latLng !== undefined) {
                leafletRef.value.setLatLng(props.latLng);
            }
            methods.setClassName = (newVal) => {
                if (document.getElementsByClassName("leaflet-popup").length > 0)
                    DomUtil.setClass(
                        document.getElementsByClassName("leaflet-popup")[0],
                        `leaflet-popup leaflet-zoom-animated ${newVal}`
                    );
            };

            propsBinder(methods, leafletRef.value, props);
            const listeners = remapEvents(context.attrs);
            DomEvent.on(leafletRef.value, listeners);
            leafletRef.value.setContent(props.content || root.value);
            bindPopup({ leafletObject: leafletRef.value });
            nextTick(() => context.emit("ready", leafletRef.value));
        });
        return { root, leafletObject: leafletRef };
    },
    render() {
        return render(this.$slots);
    },
};
</script>
