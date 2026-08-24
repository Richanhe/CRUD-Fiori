sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Token",
    "sap/m/MessageBox"
], (Controller, Token, MessageBox) => {
    "use strict";

    return Controller.extend("project1.controller.ODataCRUD", {
        oModel: null,
        editingContext: null,
        i18n: null,

        onInit() {
            this.oModel = this.getView().getModel()
            this.i18n = this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle();
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
                    const button = this.byId('cancelUpdateButton')
                    button.setVisible(false)

                    this.editingContext.setProperty("firstname", firstName);
                    this.editingContext.setProperty("lastname", lastName);
                    this.editingContext.setProperty("age", Number(age));
                    this.editingContext = null;

                    this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("add"));
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
            
            const button = this.byId('cancelUpdateButton')
            button.setVisible(true)

            this.byId("oDataCRUDFirstNameInput").setValue(user.firstname);

            this.byId("oDataCRUDLastNameInput").setValue(user.lastname);

            this.byId("oDataCRUDAgeInput").setValue(user.age);

            this.editingContext = oContext;

            this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("save"));

        },

        async onPressDeleteUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()
            const oModel = oContext.getModel()

            try {
                await oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.softDelete(...)`
                ).execute();
                await oModel.refresh();
            } catch(error) {
                console.error(error)
            }
        },

        async onPressRestoreUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()
            const oModel = oContext.getModel()

            try {
                await oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.restore(...)`
                ).execute();
                await oModel.refresh();
            } catch(error) {
                console.error(error)
            }
        },

        onPressShowDeletedUsers(oEvent) {
            const button = oEvent.getSource()
            const oTable = this.byId("usersTable")
            const deleteButton = this.byId("deleteButton")
            const editButton = this.byId("editButton")
            const restoreButton = this.byId("restoreButton")

            if (button.getText() == "Usuários") {
                restoreButton.setVisible(false)
                deleteButton.setVisible(true)
                editButton.setVisible(true)
                
                oTable.unbindItems();
                oTable.bindItems({
                    path: "/Users",
                    template: this.byId("userItemTemplate")
                });

                button.setText(this.i18n.getText("deletedUsers"))
                return
            }
            restoreButton.setVisible(true)
            deleteButton.setVisible(false)
            editButton.setVisible(false)

            oTable.unbindItems();
            oTable.bindItems({
                path: "/DeletedUsers",
                template: this.byId("userItemTemplate")
            });

            button.setText(this.i18n.getText("users"))
        },

        onPressCancelUpdate(oEvent) {
            const button = oEvent.getSource()
            button.setVisible(false)

            this.editingContext = null;
            this.clearInputs();
            this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("add"));
        }
    });
});