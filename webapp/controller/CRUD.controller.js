sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/m/MessageBox"
], (Controller, JSONModel, Token, MessageBox) => {
    "use strict";

    return Controller.extend("project1.controller.CRUD", {
        oModel: null,
        editingPath: null,
        i18n: null,

        onInit() {
            this.oModel = new JSONModel({
                "Users": [
                    {
                        "UserID": 0,
                        "FirstName": "Richard",
                        "LastName": "Kanheski",
                        "Age": 21,
                        "Hobbies": [
                            {"name": "Jogar"},
                            {"name": "Passar tempo com a família"},
                            {"name": "Programar"},
                            {"name": "Assistir Animes"},
                        ],
                    },
                    {
                        "UserID": 1,
                        "FirstName": "Richard",
                        "LastName": "Kanheski",
                        "Age": 21,
                        "Hobbies": [
                            {"name": "Jogar"},
                            {"name": "Passar tempo com a família"},
                            {"name": "Programar"},
                            {"name": "Assistir Animes"},
                        ],
                    },
                ]
            })
            this.getView().setModel(this.oModel)

            this.i18n = this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle();
        },

        clearInputs() {
            this.byId("CRUDFirstNameInput").setValue("")
            this.byId("CRUDLastNameInput").setValue("")
            this.byId("ageInput").setValue("")

            const hobbies = this.byId("hobbiesInput")
            hobbies.setValue("")
            hobbies.removeAllTokens()
        },

        onSubmitHobby(oEvent) {
            const input = oEvent.getSource()

            const value = input.getValue().trim()

            if (!value) {
                return
            }

            input.addToken(
                new Token({
                    text: value
                })
            )

            input.setValue("")
        },

        onPressAddUser() {
            const firstName = this.byId("CRUDFirstNameInput").getValue()
            const lastName = this.byId("CRUDLastNameInput").getValue()
            const age = this.byId("ageInput").getValue()
            const hobbies = this.byId("hobbiesInput").getTokens()

            const users = this.oModel.getProperty("/Users")

            const user = {
                "FirstName": firstName,
                "LastName": lastName,
                "Age": age, 
                "Hobbies": hobbies.map(token => ({
                    name: token.getText()
                }))
            }

            if (this.editingPath) {
                const oldUser = this.oModel.getProperty(this.editingPath)

                user.UserID = oldUser.UserID

                this.oModel.setProperty(this.editingPath, user)

                this.editingPath = null

                this.byId("saveButton").setText(this.i18n.getText("addUser"));
            } else {
                user.UserID = users.length

                users.push(user)

                this.oModel.refresh()
            }

            this.clearInputs()
        },

        onPressDeleteUser(oEvent) {
            const path = oEvent.getSource().getBindingContext().getPath()

            const index = Number(path.split("/").pop())

            const users = this.oModel.getProperty("/Users")

            users.splice(index, 1);

            this.oModel.refresh()
        },

        onPressEditUser(oEvent) {
            const context = oEvent.getSource().getBindingContext()
            const user = context.getObject()
            const hobbies = this.byId("hobbiesInput")

            const tokens = user.Hobbies.map(hobbie => {
                return hobbie.name
            })

            this.byId("CRUDFirstNameInput").setValue(user.FirstName)
            this.byId("CRUDLastNameInput").setValue(user.LastName)
            this.byId("ageInput").setValue(user.Age)

            hobbies.removeAllTokens()
            tokens.forEach(token => {
                hobbies.addToken(
                    new Token({
                        text: token
                    })
                )
            });

            this.editingPath = context.getPath()

            this.byId("saveButton").setText(this.i18n.getText("saveChanges"));
        }
    });
});