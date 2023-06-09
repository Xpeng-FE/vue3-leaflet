<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    propsBinder,
    remapEvents,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import { props, setup as tooltipSetup } from "../functions/tooltip";
import { render } from "../functions/popper";

/**
 * 弹出提示组件
 */
export default {
    name: "LTooltip",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const root = ref(null);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const bindTooltip = inject("bindTooltip");

        const { options, methods } = tooltipSetup(props, leafletRef, context);

        onMounted(async () => {
            const { tooltip, DomEvent } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");

            leafletRef.value = tooltip(options);
            propsBinder(methods, leafletRef.value, props);
            const listeners = remapEvents(context.attrs);
            DomEvent.on(leafletRef.value, listeners);
            leafletRef.value.setContent(props.content || root.value);
            bindTooltip({ leafletObject: leafletRef.value });
            nextTick(() => context.emit("ready", leafletRef.value));
        });
        return {
            root,
            leafletObject: leafletRef,
        };
    },
    render() {
        return render(this.$slots);
    },
};
</script>
