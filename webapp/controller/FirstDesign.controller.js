sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], (Controller, MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.FirstDesign", {
        oRouter: null,

        onInit() {
            this.oRouter = this.getOwnerComponent().getRouter()
        },

        onPress() {
            const input = this.byId("input")

            MessageToast.show(input.getValue())
        },

        onPressGoToFullName() {
            this.oRouter.navTo("RouteFullName")
        },
        onPressGoToPropertyBinding() {
            this.oRouter.navTo("RoutePropertyBinding")
        },
        onPressGoToAggregationBinding() {
            this.oRouter.navTo("RouteAggregationBinding")
        },
        onPressGoToFactoryFunctions() {
            this.oRouter.navTo("RouteFactoryFunctions")
        },
        onPressGoToCRUD() {
            this.oRouter.navTo("RouteCRUD")
        },
        onPressGoToODataCRUD() {
            this.oRouter.navTo("RouteODataCRUD")
        },
        onPressGoToParameters() {
            this.oRouter.navTo("RouteParameters", {
                id: 123
            })
        }
    });
});