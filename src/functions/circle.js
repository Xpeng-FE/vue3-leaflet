import {
    props as circleMarkerProps,
    setup as circleMarkerSetup,
} from "./circleMarker";

export const props = {
    ...circleMarkerProps,
    /**
     * 半径（米）
     */
    radius: {
        type: Number,
        default: null,
    },
};

export const setup = (props, leafletRef, context) => {
    const {
        options: circleMarkerOptions,
        methods: circleMarkerMethods,
    } = circleMarkerSetup(props, leafletRef, context);

    const options = {
        ...circleMarkerOptions,
        ...props,
    };

    const methods = {
        ...circleMarkerMethods,
    };

    return { options, methods };
};
