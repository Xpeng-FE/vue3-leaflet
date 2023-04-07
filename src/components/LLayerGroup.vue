<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    remapEvents,
    propsBinder,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { props, setup as layerGroupSetup } from "../functions/layerGroup";
import { render } from "../functions/layer";

export default {
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");

        const { methods } = layerGroupSetup(props, leafletRef, context);

        onMounted(async () => {
            const { DomEvent, layerGroup } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            // const { GLL } = await import("../gll_leaflet");
            // const { layerGroup } = GLL;

            leafletRef.value = layerGroup(props.options);
            // gll.init(props.mapRef, leafletRef.value);

            const listeners = remapEvents(context.attrsd);
            DomEvent.on(leafletRef.value, listeners);

            propsBinder(methods, leafletRef.value, props);

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
