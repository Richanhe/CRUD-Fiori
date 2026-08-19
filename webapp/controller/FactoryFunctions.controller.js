sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/ColumnListItem",
    "sap/m/ObjectIdentifier",
    "sap/m/Text"
], (Controller, JSONModel, ColumnListItem, ObjectIdentifier, Text) => {
    "use strict";

    return Controller.extend("project1.controller.FactoryFunctions", {
        onInit() {
            var Products = new JSONModel({
                "Products": [
                    {
                        "ProductID": 1,
                        "ProductName": "Chai",
                        "QuantityPerUnit": "10 boxes x 20 bags",
                        "UnitsInStock": 39
                    },
                    {
                        "ProductID": 2,
                        "ProductName": "Chang",
                        "QuantityPerUnit": "10 boxes x 20 bags",
                        "UnitsInStock": 39
                    },
                ]
            })
            this.getView().setModel(Products)
        },

        productFactory(id, oContext) {
            var rowControl =  new ColumnListItem({
                cells: [
                    new ObjectIdentifier({
                        title: "{ProductName}",
                        text: "{ProductID}"
                    }),
                    new Text({
                        text: "{QuantityPerUnit}"
                    }),
                    new Text({
                        text: "{UnitsInStock}"
                    })
                ]
            })

            if(oContext.getProperty("ProductID") == 2) {
                rowControl.addStyleClass("highlight")
                console.log(oContext.getProperty("ProductID"))
            }

            return rowControl
        }
    });
});