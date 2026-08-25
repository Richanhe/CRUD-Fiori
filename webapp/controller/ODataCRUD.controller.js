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
            this.oModel = this.getOwnerComponent().getModel();
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

        async onSubmitHobby(oEvent) {
            const input = oEvent.getSource()
            const sHobby = input.getValue().trim()
            var sHobbyId

            if (!sHobby) {
                return
            }

            const oListBinding = this.oModel.bindList("/Hobbies", null, null, null, {
                $filter: `name eq '${sHobby}'`
            });

            const aContexts = await oListBinding.requestContexts();

            if (aContexts.length > 0) {
                const oHobby = aContexts[0].getObject();
                sHobbyId = oHobby.hobby_id;
            } else {
                const oHobbiesBinding = this.oModel.bindList("/Hobbies");

                const oHobbyContext = oHobbiesBinding.create({
                    name: sHobby
                });

                await oHobbyContext.created();

                sHobbyId = oHobbyContext.getProperty("hobby_id");
            }

            input.addToken(
                new Token({
                    text: sHobby
                }).data("hobbyId", sHobbyId)
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

                    const oHobbiesBinding = this.oModel.bindList(
                        `${this.editingContext.getPath()}/_Hobbies`
                    )

                    const aHobbyContexts = await oHobbiesBinding.requestContexts()

                    for (const oHobbyContext of aHobbyContexts) {
                        await oHobbyContext.delete()
                    }

                    const aTokens = this.byId("oDataCRUDHobbiesInput").getTokens()

                    for (const oToken of aTokens) {

                        const sHobbyId = oToken.data("hobbyId")

                        const oNewHobbyContext = oHobbiesBinding.create({
                            hobby_id: sHobbyId
                        })

                        await oNewHobbyContext.created()
                    }

                    this.editingContext = null;

                    this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("add"));
                    this.clearInputs();

                    await this.oModel.refresh()

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

                const aTokens = this.byId("oDataCRUDHobbiesInput").getTokens()

                const oHobbiesBinding = this.oModel.bindList(
                    `${oContext.getPath()}/_Hobbies`
                )

                for (const oToken of aTokens) {
                    const sHobbyId = oToken.data("hobbyId")

                    const oHobbyContext = oHobbiesBinding.create({
                        hobby_id: sHobbyId
                    })

                    await oHobbyContext.created()
                }

                this.clearInputs();

                await this.oModel.refresh();
            } catch(error) {
                console.error(error)
            }
        },

        async onPressEditUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()
            const user = oContext.getObject();
            
            const button = this.byId('cancelUpdateButton')
            button.setVisible(true)

            this.byId("oDataCRUDFirstNameInput").setValue(user.firstname);
            this.byId("oDataCRUDLastNameInput").setValue(user.lastname);
            this.byId("oDataCRUDAgeInput").setValue(user.age);

            const oHobbiesInput = this.byId("oDataCRUDHobbiesInput")
            oHobbiesInput.removeAllTokens()

            const oRow = oEvent.getSource().getParent().getParent()
            const oHobbiesList = oRow.getCells().find(oCell => oCell.isA("sap.m.List"))
            const aItems = oHobbiesList ? oHobbiesList.getItems() : []

            for (const oItem of aItems) {
                const oHobbyContext = oItem.getBindingContext()
                if (oHobbyContext) {
                    const sHobbyId = oHobbyContext.getProperty("hobby_id")
                    const sHobbyName = oHobbyContext.getProperty("_Hobby/name") || oItem.getTitle()

                    oHobbiesInput.addToken(
                        new Token({
                            text: sHobbyName
                        }).data("hobbyId", sHobbyId)
                    )
                }
            }

            this.editingContext = oContext;

            this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("save"));

        },

        async onPressDeleteUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()

            try {
                await this.oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.softDelete(...)`
                ).execute();
                await this.oModel.refresh();
            } catch(error) {
                console.error(error)
            }
        },

        async onPressRestoreUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()

            try {
                await this.oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.restore(...)`
                ).execute();
                await this.oModel.refresh();
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