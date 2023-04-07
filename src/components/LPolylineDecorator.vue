<script>
// map的传入的值必须有useGlobalLeaflet且为true
import { inject, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
    remapEvents,
    propsBinder,
    initPane,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import {
    props,
    setup as polylineSetup,
    decoratorSetup,
} from "../functions/polylineDecorator";
import { render, initRenderer } from "../functions/layer";
import "leaflet-polylinedecorator";

export default {
    name: "LPolylineDecorator",
    props,
    setup(props, context) {
        const leafletDecoratorRef = ref({});
        const leafletRef = ref({});
        const ready = ref(false);
        const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
        const addLayer = inject("addLayer");
        const removeLayer = inject("removeLayer");
        let {
            options,
            symboloptions,
            pathOption,
            methods,
            arrowOption,
            polylineMethods,
        } = polylineSetup(props, leafletRef, leafletDecoratorRef, context);
        onMounted(async () => {
            const {
                canvas,
                svg,
                DomEvent,
                polylineDecorator,
                Symbol,
                polyline,
            } = useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            if (props.pane != "overlayPane")
                arrowOption.arrowOptions.pane = props.pane;
            arrowOption.arrowOptions = initRenderer(
                arrowOption.arrowOptions,
                canvas,
                svg,
                props.pane
            );
            arrowOption.arrowOptions = initPane(
                arrowOption.arrowOptions,
                "overlayPane",
                props.mapRef
            );
            let symbol = props.symbolType
                ? Symbol.arrowHead({
                      ...symboloptions,
                      pathOptions: arrowOption.arrowOptions,
                  })
                : Symbol.dash({
                      ...symboloptions,
                      pathOptions: arrowOption.arrowOptions,
                  });
            methods.setVisible = (isVisible) => {
                if (leafletDecoratorRef.value) {
                    if (isVisible)
                        addLayer({ leafletObject: leafletDecoratorRef.value });
                    else
                        removeLayer({
                            leafletObject: leafletDecoratorRef.value,
                        });
                }
            };
            methods.setArrowOptions = (option) => {
                if (props.pane != "overlayPane") option.pane = props.pane;
                let symbolchange = props.symbolType
                    ? Symbol.arrowHead({
                          ...symboloptions,
                          pathOptions: { ...option },
                      })
                    : Symbol.dash({
                          ...symboloptions,
                          pathOptions: { ...option },
                      });
                leafletDecoratorRef.value.setPatterns([
                    {
                        ...options,
                        symbol: symbolchange,
                    },
                ]);
            };
            new Promise((resolve) => {
                leafletDecoratorRef.value = polylineDecorator(props.latLngs, {
                    patterns: [
                        {
                            ...options,
                            symbol: symbol,
                        },
                    ],
                });
                let othermethods = decoratorSetup(
                    props,
                    leafletDecoratorRef,
                    Symbol,
                    symbol,
                    options,
                    symboloptions,
                    arrowOption.arrowOptions
                );
                Object.assign(methods, othermethods);
                const listeners = remapEvents(context.attrs);
                DomEvent.on(leafletDecoratorRef.value, listeners);
                propsBinder(methods, leafletDecoratorRef.value, props);
                if (props.visible) {
                    addLayer({
                        ...props,
                        ...methods,
                        leafletObject: leafletDecoratorRef.value,
                    });
                }
                if (props.needPolyline) {
                    pathOption = initRenderer(
                        pathOption,
                        canvas,
                        svg,
                        pathOption.pane
                    );
                    pathOption = initPane(
                        pathOption,
                        "overlayPane",
                        props.mapRef
                    );
                    leafletRef.value = polyline(props.latLngs, pathOption);
                    propsBinder(polylineMethods, leafletRef.value, props);
                    if (props.visible) {
                        addLayer({
                            ...props,
                            ...polylineMethods,
                            leafletObject: leafletRef.value,
                        });
                    }
                }
                ready.value = true;
                nextTick(() =>
                    context.emit("ready", leafletDecoratorRef.value)
                );
                resolve(true);
            });
        });
        onBeforeUnmount(() => {
            removeLayer({ leafletObject: leafletDecoratorRef.value });
            if (props.needPolyline)
                removeLayer({ leafletObject: leafletRef.value });
        });
        return { ready, leafletObject: leafletDecoratorRef };
    },
    render() {
        return render(this.ready, this.$slots);
    },
};
</script>
