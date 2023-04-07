import { onBeforeUnmount, inject } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
    ...popperProps,
    latLng: {
        type: [Object, Array],
        default: () => [],
    },
    options: {
        type: [Object, Array],
        default: () => [],
    },
    visible: {
        type: Boolean,
        default: false,
    },
};

export const setup = (props, leafletRef) => {
    const { options, methods } = popperSetup(props, leafletRef);
    const unbindPopup = inject("unbindPopup");
    methods.setVisible = (visible) => {
        if (visible) leafletRef.value.openOn(props.mapRef);
        else leafletRef.value.close();
    };

    onBeforeUnmount(() => {
        unbindPopup();
    });

    return { options, methods };
};
