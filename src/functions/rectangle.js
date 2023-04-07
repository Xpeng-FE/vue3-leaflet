import { props as polygonProps, setup as polygonSetup } from "./polygon";

export const props = {
    ...polygonProps,
    bounds: {
        type: Array,
        default: undefined,
    },
};

export const setup = (props, leafletRef, context) => {
    const { options: polygonOptions, methods: polygonMethods } = polygonSetup(
        props,
        leafletRef,
        context
    );
    const options = {
        ...polygonOptions,
        ...props,
    };

    const methods = {
        ...polygonMethods,
        setBounds(latLngBounds) {
            leafletRef.value.setBounds(latLngBounds);
        },
        setLatLngs(latLngs) {
            leafletRef.value.setBounds(latLngs);
        },
    };

    return { options, methods };
};
