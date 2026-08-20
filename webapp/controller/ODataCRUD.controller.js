sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Token",
    "sap/m/MessageBox"
], (Controller, Token, MessageBox) => {
    "use strict";

    return Controller.extend("project1.controller.ODataCRUD", {
        oModel: null,
        editingContext: null,

        onInit() {
            this.oModel = this.getView().getModel()
        },

        clearInputs() {
            this.byId("oDataCRUDFirstNameInput").setValue("")
            this.byId("oDataCRUDLastNameInput").setValue("")
            this.byId("oDataCRUDAgeInput").setValue("")

            const hobbies = this.byId("oDataCRUDHobbiesInput")
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

        async onPressAddUser() {
            const firstName = this.byId("oDataCRUDFirstNameInput").getValue()
            const lastName = this.byId("oDataCRUDLastNameInput").getValue()
            const age = this.byId("oDataCRUDAgeInput").getValue()
            // const hobbies = this.byId("hobbiesInput").getTokens()

            if (!firstName || !lastName || !age) {
                MessageBox.warning("Preencha todos os campos.")
                return;
            }

            try {
                if (this.editingContext) {
                    this.editingContext.setProperty("firstname", firstName);

                    this.editingContext.setProperty("lastname", lastName);

                    this.editingContext.setProperty("age", Number(age));

                    this.editingContext = null;

                    this.byId("oDataCRUDSaveButton").setText("Adicionar usuário");

                    this.clearInputs();

                    return;
                }

                const oTable = this.byId("usersTable")

                const oListBinding = oTable.getBinding("items")

                const oContext = oListBinding.create({
                    firstname: firstName,
                    lastname: lastName,
                    age: Number(age)
                })

                await oContext.created()

                this.clearInputs();
            } catch(error) {
                console.error(error)
            }
        },

        onPressEditUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()

            const user = oContext.getObject();

            console.log(user)

            this.byId("oDataCRUDFirstNameInput").setValue(user.firstname);

            this.byId("oDataCRUDLastNameInput").setValue(user.lastname);

            this.byId("oDataCRUDAgeInput").setValue(user.age);

            this.editingContext = oContext;

            this.byId("oDataCRUDSaveButton").setText("Salvar mudanças");
        },

        async onPressDeleteUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()

            try {
                await oContext.delete("$direct")
            } catch(error) {
                console.error(error)
            }
        },
    });
});