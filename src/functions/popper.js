import { h } from "vue";
import { props as componentProps, setup as componentSetup } from "./component";

export const props = {
    ...componentProps,
    content: {
        type: String,
        default: null,
    },
    className: {
        type: String,
        default: "",
    },
};

export const setup = (props, leafletRef) => {
    const { options, methods: componentMethods } = componentSetup(props);
    options.className = props.className;
    const methods = {
        ...componentMethods,
        setContent(newVal) {
            if (leafletRef.value && newVal !== null && newVal !== undefined) {
                leafletRef.value.setContent(newVal);
            }
        },
    };
    return { options, methods };
};

export const render = (slots) => {
    if (slots.default) {
        return h("div", { ref: "root" }, slots.default());
    }
    return null;
};
