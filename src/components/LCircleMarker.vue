<script>
import { onMounted, ref, inject, nextTick, onBeforeUnmount } from "vue";
import {
    remapEvents,
    propsBinder,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
    initPane,
} from "../utils.js";
import { props, setup as circleMarkerSetup } from "../functions/circleMarker";
import { render } from "../functions/layer";

/**
 * 圆形标志组件
 */
export default {
    name: "LCircleMarker",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");

        const { options, methods } = circleMarkerSetup(
            props,
            leafletRef,
            context
        );
        options.pane = initPane(options, "overlayPane", props.mapRef).pane;

        onMounted(async () => {
            const { circleMarker, DomEvent } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");

            leafletRef.value = circleMarker(props.latLng, options);

            const listeners = remapEvents(context.attrs);
            DomEvent.on(leafletRef.value, listeners);

            propsBinder(methods, leafletRef.value, props);
            if (props.visible)
                addLayer({
                    ...props,
                    ...methods,
                    leafletObject: leafletRef.value,
                });
            ready.value = true;
            nextTick(() => context.emit("ready", leafletRef.value));
        });
        onBeforeUnmount(() => {
            let slots = context.slots;
            if (slots && typeof slots.default === "function")
                slots = slots.default();
            if (!slots) slots = [];
            if (slots.length > 0) {
                let hasPopUp = false;
                if (slots.length === 1)
                    hasPopUp = slots[0].type.name !== "LIcon";
                else hasPopUp = true;
                if (hasPopUp) leafletRef.value.unbindPopup();
            }
        });
        return { ready, leafletObject: leafletRef };
    },
    render() {
        return render(this.ready, this.$slots);
    },
};
</script>
