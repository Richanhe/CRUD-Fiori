sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.PropertyBinding", {
        onInit() {
            var oModel = new JSONModel({
                "FirstName": "Richard",
                "LastName": "Kanheski"
            })
            this.getView().setModel(oModel)
        },
    });
});