<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    remapEvents,
    propsBinder,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
    initPane,
} from "../utils.js";
import { props, setup as polygonSetup } from "../functions/polygon";
import { render, initRenderer } from "../functions/layer";

/**
 * 形状组件
 */
export default {
    name: "LPolygon",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");

        let { options, methods } = polygonSetup(props, leafletRef, context);

        onMounted(async () => {
            const { polygon, DomEvent, canvas, svg } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            options = initRenderer(options, canvas, svg, options.pane);
            options = initPane(options, "overlayPane", props.mapRef);
            let info = JSON.parse(JSON.stringify(options.info));
            delete options.info;
            leafletRef.value = polygon(props.latLngs, options);

            const listeners = remapEvents(context.attrs);
            DomEvent.on(leafletRef.value, listeners);

            propsBinder(methods, leafletRef.value, props);
            leafletRef.value["info"] = info;
            if (props.visible)
                addLayer({
                    ...props,
                    ...methods,
                    leafletObject: leafletRef.value,
                });
            ready.value = true;
            nextTick(() => context.emit("ready", leafletRef.value));
        });

        return { ready, leafletObject: leafletRef };
    },
    render() {
        return render(this.ready, this.$slots);
    },
};
</script>
