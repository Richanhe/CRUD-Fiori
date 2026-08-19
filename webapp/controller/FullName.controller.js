sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.FullName", {
        onInit() {
            var oModel = new JSONModel({
                "FirstName": "Richard",
                "LastName": "Kanheski"
            })

            var oFirstName = oModel.getProperty("/FirstName")
            var oLastName = oModel.getProperty("/LastName")

            this.byId("firstNameInput").setValue(oFirstName);
            this.byId("lastNameInput").setValue(oLastName);
            this.byId("fullNameInput").setValue(oFirstName + " " + oLastName);
        },

        processFullName() {
            var firstNameInputValue = this.byId("firstNameInput").getValue()
            var lastNameInputValue = this.byId("lastNameInput").getValue()

            this.byId("fullNameInput").setValue(firstNameInputValue + " " + lastNameInputValue)
        }
    });
});