import L from "leaflet";

L.PopupCare = L.Popup.extend({
    _animateZoom: function (e) {
        if (!e.target || typeof e.target._latLngToNewLayerPoint !== "function")
            return;
        let pos = e.target._latLngToNewLayerPoint(
                this._latlng,
                e.zoom,
                e.center
            ),
            anchor = this._getAnchor();
        L.DomUtil.setPosition(this._container, pos.add(anchor));
    },
});

L.popupCare = function (options, source) {
    return new L.PopupCare(options, source);
};
