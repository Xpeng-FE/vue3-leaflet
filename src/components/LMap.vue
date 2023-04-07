<script>
import {
    computed,
    h,
    nextTick,
    onBeforeUnmount,
    onMounted,
    provide,
    reactive,
    ref,
} from "vue";
import {
    remapEvents,
    propsBinder,
    debounce,
    resetWebpackIcon,
    provideLeafletWrapper,
    updateLeafletWrapper,
    WINDOW_OR_GLOBAL,
    GLOBAL_LEAFLET_OPT,
} from "../utils.js";
import {
    props as componentProps,
    setup as componentSetup,
} from "../functions/component";

const userAgentContains = (str) => {
    return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
};

const android23 =
    userAgentContains("android 2") || userAgentContains("android 3");
export default {
    emits: ["ready", "update:zoom", "update:center", "update:bounds"],
    props: {
        ...componentProps,
        wrapperName: {
            type: String,
            dafault: undefined,
        },
        /**
         * 地图中心点,支持中心点变更
         */
        center: {
            type: [Object, Array],
            default: () => [0, 0],
        },
        /**
         * 地图bbox支持变更
         */
        bounds: {
            type: [Array, Object],
            default: undefined,
        },
        /**
         * 控制最大bbox范围
         */
        maxBounds: {
            type: [Array, Object],
            default: undefined,
        },
        /**
         * 缩放级别，支持变更
         */
        zoom: {
            type: Number,
            default: 0,
        },
        /**
         * 设置地图最小级别
         */
        minZoom: {
            type: Number,
            default: undefined,
        },
        /**
         * 设置地图最大级别
         */
        maxZoom: {
            type: Number,
            default: undefined,
        },
        boxZoom: {
            type: Boolean,
            default: false,
        },
        /**
         * 地图右下角距离
         */
        paddingBottomRight: {
            type: Array,
            default: undefined,
        },
        /**
         * 地图左上角距离
         */
        paddingTopLeft: {
            type: Array,
            default: undefined,
        },
        /**
         * 地图四边距离
         */
        padding: {
            type: Array,
            default: undefined,
        },
        /**
         * The worldCopyJump option for the map
         */
        worldCopyJump: {
            type: Boolean,
            default: false,
        },
        /**
         * leaflet定义的crs
         */
        crs: {
            type: [String, Object],
            default: "EPSG3857",
        },
        maxBoundsViscosity: {
            type: Number,
            default: 0.0,
        },
        inertia: {
            type: Boolean,
            default: !android23,
        },
        inertiaDeceleration: {
            type: Number,
            default: 3400,
        },
        inertiaMaxSpeed: {
            type: Number,
            default: Infinity,
        },
        easeLinearity: {
            type: Number,
            default: 0.2,
        },
        zoomAnimation: {
            type: Boolean,
            default: true,
        },
        zoomAnimationThreshold: {
            type: Number,
            default: 4,
        },
        fadeAnimation: {
            type: Boolean,
            default: true,
        },
        markerZoomAnimation: {
            type: Boolean,
            default: true,
        },
        noBlockingAnimations: {
            type: Boolean,
            default: true,
        },
        useGlobalLeaflet: {
            type: Boolean,
            default: false,
        },
        attributionControl: {
            type: Boolean,
            dafault: false,
        },
        zoomControl: {
            type: Boolean,
            default: true,
        },
        isEditable: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const root = ref(null);
        const blueprint = reactive({
            ready: false,
            leafletRef: {},
            layersToAdd: [],
            layersInControl: [],
        });
        const classname = ref(props.wrapperName);
        const { options: componentOptions } = componentSetup(props);
        const options = {
            ...componentOptions,
            minZoom: props.minZoom,
            maxZoom: props.maxZoom,
            maxBounds: props.maxBounds,
            maxBoundsViscosity: props.maxBoundsViscosity,
            worldCopyJump: props.worldCopyJump,
            crs: props.crs,
            center: props.center,
            zoom: props.zoom,
            inertia: props.inertia,
            inertiaDeceleration: props.inertiaDeceleration,
            inertiaMaxSpeed: props.inertiaMaxSpeed,
            easeLinearity: props.easeLinearity,
            zoomAnimation: props.zoomAnimation,
            zoomAnimationThreshold: props.zoomAnimationThreshold,
            fadeAnimation: props.fadeAnimation,
            markerZoomAnimation: props.markerZoomAnimation,
            attributionControl: props.attributionControl,
            zoomControl: props.zoomControl,
            boxZoom: props.boxZoom,
        };

        const addLayer = provideLeafletWrapper("addLayer");
        const removeLayer = provideLeafletWrapper("removeLayer");
        const registerControl = provideLeafletWrapper("registerControl");
        const registerLayerControl = provideLeafletWrapper(
            "registerLayerControl"
        );
        provide(GLOBAL_LEAFLET_OPT, props.useGlobalLeaflet);

        const eventHandlers = {
            moveEndHandler() {
                /**
                 * 当更新级别的时候调用
                 */
                context.emit("update:zoom", blueprint.leafletRef.getZoom());
                /**
                 * 当更新中心位置的时候调用
                 */
                context.emit("update:center", blueprint.leafletRef.getCenter());

                /**
                 * 当更新bbox的时候调用
                 */
                context.emit("update:bounds", blueprint.leafletRef.getBounds());
            },
            overlayAddHandler(e) {
                const layer = blueprint.layersInControl.find(
                    (l) => l.name === e.name
                );
                if (layer) {
                    layer.updateVisibleProp(true);
                }
            },
            overlayRemoveHandler(e) {
                const layer = blueprint.layersInControl.find(
                    (l) => l.name === e.name
                );
                if (layer) {
                    layer.updateVisibleProp(false);
                }
            },
        };

        onMounted(async () => {
            if (props.useGlobalLeaflet) {
                WINDOW_OR_GLOBAL.L =
                    WINDOW_OR_GLOBAL.L || (await import("leaflet"));
            }
            const {
                map,
                CRS,
                Icon,
                latLngBounds,
                latLng,
                point,
                DomEvent,
                // canvas,
            } = props.useGlobalLeaflet
                ? WINDOW_OR_GLOBAL.L
                : await import("leaflet/dist/leaflet-src.esm");
            // options.renderer = canvas({ tolerance: 15 });
            // options.preferCanvas = true;

            try {
                options.beforeMapMount && (await options.beforeMapMount());
            } catch (error) {
                console.error(`beforeMapMount钩子 ${error.message}`);
            }

            await resetWebpackIcon(Icon);

            const optionsCrs =
                typeof options.crs == "string" ? CRS[options.crs] : options.crs;
            options.crs = optionsCrs || CRS.EPSG3857;

            const methods = {
                addLayer(layer) {
                    if (layer.layerType !== undefined) {
                        if (blueprint.layerControl === undefined) {
                            blueprint.layersToAdd.push(layer);
                        } else {
                            const exist = blueprint.layersInControl.find(
                                (l) =>
                                    l.leafletObject._leaflet_id ===
                                    layer.leafletObject._leaflet_id
                            );
                            if (!exist) {
                                blueprint.layerControl.addLayer(layer);
                                blueprint.layersInControl.push(layer);
                            }
                        }
                    }
                    if (layer.visible !== false) {
                        blueprint.leafletRef.addLayer(layer.leafletObject);
                    }
                },
                removeLayer(layer) {
                    if (layer.layerType !== undefined) {
                        if (blueprint.layerControl === undefined) {
                            blueprint.layersToAdd = blueprint.layersToAdd.filter(
                                (l) => l.name !== layer.name
                            );
                        } else {
                            blueprint.layerControl.removeLayer(
                                layer.leafletObject
                            );
                            blueprint.layersInControl = blueprint.layersInControl.filter(
                                (l) =>
                                    l.leafletObject._leaflet_id !==
                                    layer.leafletObject._leaflet_id
                            );
                        }
                    }
                    blueprint.leafletRef.removeLayer(layer.leafletObject);
                },

                registerLayerControl(lControlLayer) {
                    blueprint.layerControl = lControlLayer;
                    blueprint.layersToAdd.forEach((layer) => {
                        blueprint.layerControl.addLayer(layer);
                    });
                    blueprint.layersToAdd = [];

                    registerControl(lControlLayer);
                },

                registerControl(lControl) {
                    blueprint.leafletRef.addControl(lControl.leafletObject);
                },

                setZoom(newVal) {
                    const zoom = blueprint.leafletRef.getZoom();
                    if (newVal !== zoom) {
                        blueprint.leafletRef.setZoom(newVal, {
                            animate: props.noBlockingAnimations ? false : null,
                        });
                    }
                },

                setPaddingBottomRight(newVal) {
                    blueprint.paddingBottomRight = newVal;
                },
                setPaddingTopLeft(newVal) {
                    blueprint.paddingTopLeft = newVal;
                },
                setPadding(newVal) {
                    blueprint.padding = newVal;
                },
                setCrs(newVal) {
                    const prevBounds = blueprint.leafletRef.getBounds();
                    blueprint.leafletRef.options.crs = newVal;
                    blueprint.leafletRef.fitBounds(prevBounds, {
                        animate: false,
                        padding: [0, 0],
                    });
                },
                fitBounds(bounds) {
                    blueprint.leafletRef.fitBounds(bounds, {
                        animate: this.noBlockingAnimations ? false : null,
                    });
                },
                setBounds(newVal) {
                    if (!newVal) {
                        return;
                    }
                    const newBounds = latLngBounds(newVal);
                    if (!newBounds.isValid()) {
                        return;
                    }
                    const oldBounds =
                        blueprint.lastSetBounds ||
                        blueprint.leafletRef.getBounds();
                    const boundsChanged = !oldBounds.equals(newBounds, 0); // 设置最大边距到0 - 对比前后bbox
                    if (boundsChanged) {
                        blueprint.lastSetBounds = newBounds;
                        blueprint.leafletRef.fitBounds(
                            newBounds,
                            this.fitBoundsOptions
                        );
                    }
                },

                setCenter(newVal) {
                    if (newVal == null) {
                        return;
                    }
                    const newCenter = latLng(newVal);
                    const oldCenter =
                        blueprint.lastSetCenter ||
                        blueprint.leafletRef.getCenter();
                    if (
                        oldCenter.lat !== newCenter.lat ||
                        oldCenter.lng !== newCenter.lng
                    ) {
                        blueprint.lastSetCenter = newCenter;
                        blueprint.leafletRef.panTo(newCenter, {
                            animate: this.noBlockingAnimations ? false : null,
                        });
                    }
                },
            };

            updateLeafletWrapper(addLayer, methods.addLayer);
            updateLeafletWrapper(removeLayer, methods.removeLayer);
            updateLeafletWrapper(registerControl, methods.registerControl);
            updateLeafletWrapper(
                registerLayerControl,
                methods.registerLayerControl
            );

            if (props.isEditable) {
                await import("leaflet-editable");
                options.editable = true;
            }
            delete options.isEditable;

            blueprint.leafletRef = map(root.value, options);

            propsBinder(methods, blueprint.leafletRef, props);
            const listeners = remapEvents(context.attrs);

            blueprint.leafletRef.on(
                "moveend",
                debounce(eventHandlers.moveEndHandler, 100)
            );
            blueprint.leafletRef.on(
                "overlayadd",
                eventHandlers.overlayAddHandler
            );
            blueprint.leafletRef.on(
                "overlayremove",
                eventHandlers.overlayRemoveHandler
            );
            DomEvent.on(blueprint.leafletRef, listeners);
            blueprint.leafletRef.latLng = (lat, lng) => {
                return latLng(lat, lng);
            };
            blueprint.leafletRef.latLngBounds = (corner1, corner2) => {
                return latLngBounds(corner1, corner2);
            };
            blueprint.leafletRef.point = (num1, num2) => {
                return point(num1, num2);
            };

            blueprint.ready = true;
            nextTick(() => context.emit("ready", blueprint.leafletRef));
        });

        onBeforeUnmount(() => {
            if (blueprint.leafletRef) {
                blueprint.leafletRef.remove();
            }
        });

        const leafletObject = computed(() => blueprint.leafletRef);
        const ready = computed(() => blueprint.ready);
        return { root, ready, leafletObject, classname };
    },
    render() {
        return h(
            "div",
            {
                style: { width: "100%", height: "100%" },
                class: this.classname,
                ref: "root",
            },
            this.ready ? this.$slots.default() : {}
        );
    },
};
</script>
