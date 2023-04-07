import { watch, ref, provide } from "vue";

export const initPane = (props, defaultpane, mapRef) => {
    if (
        typeof props.pane != "undefined" &&
        ["overlayPane", "tilePane"].indexOf(props.pane) < 0 &&
        (typeof mapRef == "undefined" || !mapRef)
    )
        props.pane = defaultpane;
    return props;
};

export const debounce = (fn, time) => {
    let timeout;

    return function (...args) {
        const context = this;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            fn.apply(context, args);
            timeout = null;
        }, time);
    };
};

export const capitalizeFirstLetter = (string) => {
    if (!string || typeof string.charAt !== "function") {
        return string;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const isFunction = (x) => typeof x === "function";

export const propsBinder = (methods, leafletElement, props) => {
    for (const key in props) {
        const setMethodName = "set" + capitalizeFirstLetter(key);
        if (methods[setMethodName]) {
            if (setMethodName === "setGeojson")
                watch(
                    () => [props["isChangeGeojson"], props[key]],
                    () => {
                        methods[setMethodName](props[key]);
                    }
                );
            else if (
                setMethodName === "setLatLngs" ||
                setMethodName === "setLatLng"
            )
                watch(
                    () => props[key],
                    (newVal, oldVal) => {
                        methods[setMethodName](newVal, oldVal);
                    }
                );
            else
                watch(
                    () => props[key],
                    (newVal, oldVal) => {
                        methods[setMethodName](newVal, oldVal);
                    },
                    {
                        deep: true,
                    }
                );
        } else if (leafletElement[setMethodName]) {
            watch(
                () => props[key],
                (newVal) => {
                    leafletElement[setMethodName](newVal);
                }
            );
        }
    }
};

export const remapEvents = (contextAttrs) => {
    const result = {};
    for (const attrName in contextAttrs) {
        if (
            attrName.startsWith("on") &&
            !attrName.startsWith("onUpdate") &&
            attrName !== "onReady"
        ) {
            const eventName = attrName.slice(2).toLocaleLowerCase();
            result[eventName] = contextAttrs[attrName];
        }
    }
    return result;
};

export const resetWebpackIcon = async (Icon) => {
    const modules = await Promise.all([
        import("leaflet/dist/images/marker-icon-2x.png"),
        import("leaflet/dist/images/marker-icon.png"),
        import("leaflet/dist/images/marker-shadow.png"),
    ]);

    delete Icon.Default.prototype._getIconUrl;

    Icon.Default.mergeOptions({
        iconRetinaUrl: modules[0].default,
        iconUrl: modules[1].default,
        shadowUrl: modules[2].default,
    });
};

/**
 * @param {String} methodName 用来保护map的方法
 */
export const provideLeafletWrapper = (methodName) => {
    const wrapped = ref(() =>
        console.warn(
            `方法名 ${methodName} 已经被替代`
        )
    );
    const wrapper = (...args) => wrapped.value(...args);
    // eslint-disable-next-line vue/no-ref-as-operand
    wrapper.wrapped = wrapped;
    provide(methodName, wrapper);

    return wrapper;
};

/**
 * 重新声明leaflet的方法
 *
 * @param {*} wrapper
 * @param {function} leafletMethod 新方法名
 */
export const updateLeafletWrapper = (wrapper, leafletMethod) =>
    (wrapper.wrapped.value = leafletMethod);

export const WINDOW_OR_GLOBAL =
    (typeof self === "object" && self.self === self && self) ||
    (typeof global === "object" && global.global === global && global) ||
    undefined;

export const GLOBAL_LEAFLET_OPT = "useGlobalLeaflet";

export const IsPtInPoly = (ALon, ALat, APoints) => {
    let iSum = 0,
        iCount;
    let dLon1, dLon2, dLat1, dLat2, dLon;
    if (APoints.length < 3) return false;
    iCount = APoints.length;
    for (var i = 0; i < iCount; i++) {
        if (i == iCount - 1) {
            dLon1 = APoints[i].lng;
            dLat1 = APoints[i].lat;
            dLon2 = APoints[0].lng;
            dLat2 = APoints[0].lat;
        } else {
            dLon1 = APoints[i].lng;
            dLat1 = APoints[i].lat;
            dLon2 = APoints[i + 1].lng;
            dLat2 = APoints[i + 1].lat;
        }
        //以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上
        if (
            (ALat >= dLat1 && ALat < dLat2) ||
            (ALat >= dLat2 && ALat < dLat1)
        ) {
            if (Math.abs(dLat1 - dLat2) > 0) {
                //得到 A点向左射线与边的交点的x坐标：
                dLon =
                    dLon1 -
                    ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
                if (dLon < ALon) iSum++;
            }
        }
    }
    if (iSum % 2 != 0) return true;
    return false;
};

export const getIfVisible = (features, bbox) => {
    let fourPoint = [
        {
            lat: bbox._northEast.lat,
            lng: bbox._southWest.lng,
        },
        {
            lat: bbox._northEast.lat,
            lng: bbox._northEast.lng,
        },
        {
            lat: bbox._southWest.lat,
            lng: bbox._northEast.lng,
        },
        {
            lat: bbox._southWest.lat,
            lng: bbox._southWest.lng,
        },
    ];
    let isVisible = [],
        unVisible = [],
        type = features[0].geometry.type;
    for (let feature of features) {
        let isExsit = false;
        if (type === "LineString") {
            for (let point of feature.geometry.coordinates) {
                if (IsPtInPoly(point[0], point[1], fourPoint)) {
                    isExsit = true;
                    isVisible.push(feature);
                    break;
                }
            }
        } else {
            for (let line of feature.geometry.coordinates) {
                for (let point of line) {
                    if (IsPtInPoly(point[0], point[1], fourPoint)) {
                        isExsit = true;
                        isVisible.push(feature);
                        break;
                    }
                }
                if (isExsit) break;
            }
        }
        if (!isExsit) unVisible.push(feature);
    }
    return { isVisible, unVisible };
};
