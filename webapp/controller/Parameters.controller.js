sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.Parameters", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter()

            oRouter.getRoute("RouteParameters").attachPatternMatched((oEvent) => {
                const id = oEvent.getParameter("arguments").id

                const oResourceBundle = this.getOwnerComponent()
                    .getModel("i18n")
                    .getResourceBundle();

                const idText = this.byId('idText')

                idText.setText(oResourceBundle.getText("idText", [id]));
            })
        },
    });
});