import { onBeforeUnmount, inject } from "vue";
import { props as popperProps, setup as popperSetup } from "./popper";

export const props = {
    ...popperProps,
    sticky: {
        type: Boolean,
        default: false,
    },
};

export const setup = (props, leafletRef) => {
    const { popOptions, methods } = popperSetup(props, leafletRef);
    const options = {
        ...popOptions,
        ...props,
    };
    const unbindTooltip = inject("unbindTooltip");

    onBeforeUnmount(() => {
        unbindTooltip();
    });

    return { options, methods };
};
