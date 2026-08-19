sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("project1.controller.AggregationBinding", {
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
    });
});