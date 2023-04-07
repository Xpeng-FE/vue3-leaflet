import { onUnmounted, provide, inject, h, onMounted } from "vue";
import { props as componentProps, setup as componentSetup } from "./component";
import { isFunction } from "../utils";

export const props = {
    ...componentProps,
    pane: {
        type: String,
        default: "overlayPane",
    },
    attribution: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        custom: true,
        default: undefined,
    },
    layerType: {
        type: String,
        custom: true,
        default: undefined,
    },
    visible: {
        type: Boolean,
        custom: true,
        default: true,
    },
    renderer: {
        type: String,
        default: undefined,
    },
    className: {
        type: String,
        default: "",
    },
    mapRef: {
        type: Object,
        default: undefined,
    },
};

export const setup = (props, leafletRef, context) => {
    const addLayer = inject("addLayer");
    const removeLayer = inject("removeLayer");
    const {
        options: componentOptions,
        methods: componentMethods,
    } = componentSetup(props);

    const options = {
        ...componentOptions,
        pane: props.pane,
        attribution: props.attribution,
    };

    const addThisLayer = () => addLayer({ leafletObject: leafletRef.value });
    const removeThisLayer = () =>
        removeLayer({ leafletObject: leafletRef.value });

    const methods = {
        ...componentMethods,
        setAttribution(val, old) {
            const attributionControl = this.$parent.leafletObject
                .attributionControl;
            attributionControl.removeAttribution(old).addAttribution(val);
        },
        setName() {
            removeThisLayer();
            if (props.visible) {
                addThisLayer();
            }
        },
        setLayerType() {
            removeThisLayer();
            if (props.visible) {
                addThisLayer();
            }
        },
        setVisible(isVisible) {
            if (leafletRef.value) {
                if (isVisible) {
                    addThisLayer();
                } else {
                    removeThisLayer();
                }
            }
        },
        bindPopup({ leafletObject }) {
            if (!leafletRef.value || !isFunction(leafletRef.value.bindPopup)) {
                console.warn("组件未正常加载");

                return;
            }

            leafletRef.value.bindPopup(leafletObject);
        },
        bindTooltip({ leafletObject }) {
            if (
                !leafletRef.value ||
                !isFunction(leafletRef.value.bindTooltip)
            ) {
                console.warn("组件未正常加载");
                return;
            }
            leafletRef.value.bindTooltip(leafletObject);
        },
        unbindTooltip() {
            const tooltip =
                leafletRef.value && isFunction(leafletRef.value.getTooltip)
                    ? leafletRef.value.getTooltip()
                    : null;
            if (tooltip && isFunction(tooltip.unbindTooltip)) {
                leafletRef.value.unbindTooltip();
            }
        },
        unbindPopup() {
            const popup =
                leafletRef.value && isFunction(leafletRef.value.getPopup)
                    ? leafletRef.value.getPopup()
                    : null;
            if (popup && isFunction(popup.unbindPopup)) {
                popup.unbindPopup();
            }
        },
        updateVisibleProp(value) {
            /**
             * 操作图层显示
             * @type {boolean}
             * @property {boolean} value - 是否显示
             */
            context.emit("update:visible", value);
        },
    };

    provide("bindPopup", methods.bindPopup);
    provide("bindTooltip", methods.bindTooltip);
    provide("unbindTooltip", methods.unbindTooltip);
    provide("unbindPopup", methods.unbindPopup);

    onMounted(() => {
        if (
            typeof props.mapRef != "undefined" &&
            ["overlayPane", "tilePane"].indexOf(props.pane) < 0
        )
            if (
                typeof props.mapRef._map != "undefined" &&
                typeof props.mapRef._map.getPane(props.pane) == "undefined"
            )
                props.mapRef._map.createPane(props.pane);
            else if (typeof props.mapRef.getPane(props.pane) == "undefined")
                props.mapRef.createPane(props.pane);
    });

    onUnmounted(() => {
        methods.unbindPopup();
        methods.unbindTooltip();
        removeThisLayer();
    });

    return { options, methods };
};

export const render = (ready, slots) => {
    if (ready && slots.default) {
        return h(
            "div",
            { style: { display: "none" }, class: "unuse" },
            slots.default()
        );
    }
};

export const initRenderer = (options, canvas, svg, pane = "overlayPane") => {
    if (options.renderer && ["canvas", "svg"].indexOf(options.renderer) < 0)
        delete options["renderer"];
    else if (options.renderer === "canvas") {
        if (pane === "overlayPane") options.renderer = canvas();
        else
            options.renderer = canvas({
                pane,
            });
    } else if (options.renderer === "svg") options.renderer = svg();
    return options;
};
