<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    remapEvents,
    propsBinder,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
    initPane,
} from "../utils.js";
import { props, setup as geoJSONSetup } from "../functions/geoJSON";
import { render, initRenderer } from "../functions/layer";

export default {
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");
        const allGeojsonVal = ref(props.geojson);
        const isFinishAddData = ref(null);
        // const removeLayer = inject("removeLayer");

        let { methods, options } = geoJSONSetup(
            props,
            leafletRef,
            allGeojsonVal,
            isFinishAddData,
            context
        );
        delete options["geojson"];
        if (typeof options["onEachFeature"] === "undefined")
            delete options["onEachFeature"];
        options.pane = initPane(options, "overlayPane", props.mapRef).pane;

        onMounted(async () => {
            const { geoJSON, DomEvent, canvas, svg, circle } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            options = initRenderer(options, canvas, svg, options.pane);
            if (typeof options.pointToLayer === "undefined")
                options.pointToLayer = (_geoJsonPoint, latlng) => {
                    let circleinfo = {
                        radius: _geoJsonPoint.properties.style.mRadius,
                        pane: options.pane,
                        info: _geoJsonPoint,
                    };
                    return circle(latlng, circleinfo);
                };
            leafletRef.value = geoJSON(props.geojson, options);

            const listeners = remapEvents(context.attrs);

            DomEvent.on(leafletRef.value, listeners);

            propsBinder(methods, leafletRef.value, props);
            if (props.visible)
                addLayer({
                    ...props,
                    ...methods,
                    leafletObject: leafletRef.value,
                });
            // else
            //     removeLayer({
            //         leafletObject: leafletRef.value,
            //     });
            ready.value = true;
            nextTick(() => context.emit("ready", leafletRef.value));
        });
        return { ready, leafletObject: leafletRef, isFinishAddData };
    },
    render() {
        return render(this.ready, this.$slots);
    },
};
</script>
