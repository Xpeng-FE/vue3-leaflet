<script>
import { onMounted, ref, inject, nextTick } from "vue";
import {
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
    initPane,
    propsBinder,
} from "../utils.js";
import {
    props,
    setup as rectangleMeasureSetup,
} from "../functions/rectangleMeasure";
import { render } from "../functions/layer";

/**
 * 框选组件
 */
export default {
    name: "LRectangleMeasure",
    props,
    setup(props, context) {
        const leafletRef = ref({});
        const ready = ref(false);

        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");
        const removeLayer = inject("removeLayer");
        const startpoint = ref([]);
        const endpoint = ref([]);
        const isMouseOut = ref(false);
        const moveFlag = ref(0);

        const { options, methods } = rectangleMeasureSetup(
            props,
            leafletRef,
            context
        );

        initPane(options, "overlayPane", props.mapRef);

        methods.setStartMeasure = (isStart) => {
            if (isStart) {
                props.mapRef.dragging.disable();
                // props.mapRef.scrollWheelZoom.disable();
                props.mapRef.on("mousedown", mousedown);
            } else {
                props.mapRef.dragging.enable();
                // props.mapRef.scrollWheelZoom.enable();
                props.mapRef.off("mousedown");
            }
        };

        propsBinder(methods, leafletRef.value, props);

        let mouseDownStarttime = new Date().valueOf();

        const mousedown = (e) => {
            if (!props.startMeasure) {
                props.mapRef.off("mousedown", mousedown);
                return;
            }
            mouseDownStarttime = new Date().valueOf();
            startpoint.value = e.latlng;
            moveFlag.value = 1;
            props.mapRef.on("mousemove", mousemove).on("mouseup", mouseup);
        };

        const mousedownout = (e) => {
            isMouseOut.value = false;
            endpoint.value = e.latlng;
            props.mapRef.on("mousemove", mousemove).on("mouseup", mouseup);
        };

        const mousemove = (e) => {
            if (moveFlag.value === 0) return;
            moveFlag.value = 2;
            endpoint.value = e.latlng;
            startRectangle();
            props.mapRef
                .off("mousedown", mousedown)
                .on("mouseup", mouseup)
                .on("mouseout", mouseout);
        };

        const mouseup = () => {
            removeLayer({ leafletObject: leafletRef.value });
            props.mapRef
                .off("mousemove", mousemove)
                .off("mouseup", mouseup)
                .on("mousedown", mousedown)
                .on("mouseout", mouseout);
            nextTick(() => {
                leafletRef.value = {};
                if (moveFlag.value === 2)
                    context.emit(
                        "selected",
                        [startpoint.value, endpoint.value],
                        new Date().valueOf() - mouseDownStarttime
                    );
                moveFlag.value = 0;
            });
        };

        const mouseout = () => {
            if (props.isOutRemove) {
                moveFlag.value = 0;
                props.mapRef
                    .off("mousemove", mousemove)
                    .off("mouseup", mouseup)
                    .off("mouseout", mouseout)
                    .on("mousedown", mousedown);
                removeLayer({ leafletObject: leafletRef.value });
                leafletRef.value = {};
            } else
                props.mapRef
                    .off("mousemove", mousemove)
                    .on("mousedown", mousedownout)
                    .on("mouseup", mouseup)
                    .off("mouseout", mouseout);
        };

        const moveEndPoint = () => {
            leafletRef.value.setBounds([startpoint.value, endpoint.value]);
        };

        const startRectangle = async () => {
            const { rectangle } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            if (leafletRef.value._leaflet_id) {
                moveEndPoint();
                return;
            }
            leafletRef.value = rectangle(
                [startpoint.value, endpoint.value],
                options
            );
            leafletRef.value._leaflet_id = new Date().valueOf();
            addLayer({
                ...props,
                ...methods,
                leafletObject: leafletRef.value,
            });
        };

        onMounted(async () => {
            if (props.startMeasure) {
                props.mapRef.dragging.disable();
                // props.mapRef.scrollWheelZoom.disable();
                props.mapRef.off("keydown").off("keypress");
                props.mapRef.on("mousedown", mousedown).on("mouseup", mouseup);
            }
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
