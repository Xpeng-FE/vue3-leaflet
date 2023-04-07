<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    remapEvents,
    propsBinder,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
    initPane,
} from "../utils.js";
import { props, setup as circleSetup } from "../functions/circle";
import { render } from "../functions/layer";

/**
 * 圆形组件
 */
export default {
    name: "LCircle",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");

        const { options, methods } = circleSetup(props, leafletRef, context);
        options.pane = initPane(options, "overlayPane", props.mapRef).pane;

        onMounted(async () => {
            const { circle, DomEvent } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            let info = JSON.parse(JSON.stringify(options.info));
            delete options.info;
            let clickStop = options.clickStop;
            delete options.clickStop;
            leafletRef.value = circle(props.latLng, options);
            leafletRef.value["info"] = info;

            const listeners = remapEvents(context.attrs);
            DomEvent.on(leafletRef.value, listeners);
            if (clickStop)
                DomEvent.on(leafletRef.value, "click", (ev) => {
                    DomEvent.stopPropagation(ev);
                });
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
        return { ready, leafletObject: leafletRef };
    },
    render() {
        return render(this.ready, this.$slots);
    },
};
</script>
