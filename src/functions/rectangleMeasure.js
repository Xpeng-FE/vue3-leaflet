import { props as rectangleProps, setup as rectangleSetup } from "./rectangle";

export const props = {
    ...rectangleProps,
    startMeasure: {
        type: Boolean,
        default: true,
    },
    isOutRemove: {
        type: Boolean,
        default: true,
    },
};

export const setup = (props, leafletRef, context) => {
    const { options: polygonOptions, methods: polygonMethods } = rectangleSetup(
        props,
        leafletRef,
        context
    );
    const options = {
        ...polygonOptions,
    };

    const methods = {
        ...polygonMethods,
    };

    return { options, methods };
};
