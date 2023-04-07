import {
    props as layerGroupProps,
    setup as layerGroupSetup,
} from "./layerGroup";

export const props = {
    ...layerGroupProps,
    geojson: {
        type: [Object, Array],
        default: () => ({}),
    },
    mapStyle: {
        type: [Object, Array, Function],
        default: () => ({}),
    },
    onEachFeature: {
        type: Function,
        default: undefined,
    },
    pointToLayer: {
        type: Function,
        default: undefined,
    },
    isChangeGeojson: {
        type: Boolean,
        default: false,
    },
    changeClear: {
        type: Boolean,
        default: false,
    },
};

export const setup = (
    props,
    leafletRef,
    allGeojsonVal,
    isFinishAddData,
    context
) => {
    const {
        options: layerOptions,
        methods: layerGroupMethods,
    } = layerGroupSetup(props, leafletRef, context);
    const options = {
        ...layerOptions,
        ...props,
    };

    if (options.mapStyle) {
        options.style = options.mapStyle;
        delete options["mapStyle"];
        delete options["isChangeGeojson"];
    }

    const methods = {
        ...layerGroupMethods,
        setGeojson(newVal) {
            allGeojsonVal.value = newVal;
            isFinishAddData.value = new Promise((resolve) => {
                // leafletRef.value.clearLayers();
                leafletRef.value.addData(newVal.features);
                allGeojsonVal.value = {
                    type: "FeatureCollection",
                    features: [],
                };
                resolve(true);
            });
        },
        getGeoJSONData() {
            return leafletRef.value.toGeoJSON();
        },
        getBounds() {
            return leafletRef.value.getBounds();
        },
        setChangeClear() {
            leafletRef.value.clearLayers();
        },
    };

    return { options, methods };
};
