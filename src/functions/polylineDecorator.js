import { props as pathProps, setup as pathSetup } from "./path";

export const props = {
    ...pathProps,
    latLngs: {
        type: Array,
        default: () => [],
    },
    offset: {
        type: [String, Number],
        default: "100%",
    },
    repeat: {
        type: Number,
        default: 0,
    },
    pixelSize: {
        type: Number,
        default: 15,
    },
    headAngle: {
        type: Number,
        default: 60,
    },
    polygon: {
        type: Boolean,
        default: true,
    },
    symbolType: {
        type: Boolean,
        default: true,
    },
    needPolyline: {
        type: Boolean,
        default: false,
    },
    arrowOptions: {
        type: Object,
        default: {
            stroke: false,
            weight: 2,
        },
    },
};

export const setup = (props, leafletRef, leafletDecoratorRef, context) => {
    const { options: pathOptions, methods: pathMethods } = pathSetup(
        props,
        leafletRef,
        context
    );
    const options = {
        offset: props.offset,
        repeat: props.repeat,
    };
    const symboloptions = {
        pixelSize: props.pixelSize,
        polygon: props.polygon,
        headAngle: props.headAngle,
    };
    const arrowOption = {
        arrowOptions: props.arrowOptions,
    };
    const pathOption = {
        ...pathOptions,
    };
    const polylineMethods = { ...pathMethods };
    const methods = {
        setLatLngs(latLng) {
            new Promise((resolve) => {
                leafletDecoratorRef.value.setPaths(latLng);
                resolve(true);
            });
        },
    };
    return {
        options,
        symboloptions,
        pathOption,
        arrowOption,
        methods,
        polylineMethods,
    };
};

export const decoratorSetup = (
    props,
    leafletDecoratorRef,
    symbolClass,
    symbol,
    options,
    symboloptions,
    arrowOption
) => {
    const methods = {
        setOffset(val) {
            leafletDecoratorRef.value.setPatterns([
                {
                    offset: val,
                    repeat: props.repeat,
                    symbol: symbol,
                },
            ]);
        },
        setRepeat(val) {
            leafletDecoratorRef.value.setPatterns([
                {
                    offset: props.val,
                    repeat: val,
                    symbol: symbol,
                },
            ]);
        },
        setPixelSize(val) {
            symboloptions.pixelSize = val;
            commonSetPattern(
                props,
                symboloptions,
                arrowOption,
                leafletDecoratorRef,
                options,
                symbolClass
            );
        },
        setHeadAngle(val) {
            symboloptions.headAngle = val;
            commonSetPattern(
                props,
                symboloptions,
                arrowOption,
                leafletDecoratorRef,
                options,
                symbolClass
            );
        },
        setPolygon(val) {
            symboloptions.polygon = val;
            commonSetPattern(
                props,
                symboloptions,
                arrowOption,
                leafletDecoratorRef,
                options,
                symbolClass
            );
        },
    };
    return methods;
};

const commonSetPattern = (
    props,
    symboloptions,
    arrowOption,
    leafletDecoratorRef,
    options,
    symbolClass
) => {
    let symbol = props.symbolType
        ? symbolClass.arrowHead({
              ...symboloptions,
              pathOptions: arrowOption,
          })
        : symbolClass.dash({
              ...symboloptions,
              pathOptions: arrowOption,
          });
    leafletDecoratorRef.value.setPatterns([
        {
            ...options,
            symbol: symbol,
        },
    ]);
};
