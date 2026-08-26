sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Token",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], (Controller, Token, MessageBox, MessageToast) => {
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

            try {
                input.setBusy(true)
                const sSanitizedHobby = sHobby.replace(/'/g, "''")
                const oListBinding = this.oModel.bindList("/Hobbies", null, null, null, {
                    $filter: `name eq '${sSanitizedHobby}'`
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
            } catch(error) {
                MessageBox.error("Erro ao adicionar hobby: " + (error.message || error.toString()))
            } finally {
                input.setBusy(false)
            }
        },

        async onPressAddUser() {
            const firstName = this.byId("oDataCRUDFirstNameInput").getValue()
            const lastName = this.byId("oDataCRUDLastNameInput").getValue()
            const age = this.byId("oDataCRUDAgeInput").getValue()
            
            if (!firstName || !lastName || !age) {
                MessageBox.warning("Preencha todos os campos.")
                return;
            }

            const oView = this.getView()
            oView.setBusy(true)
            
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

                    const aDeletePromises = aHobbyContexts.map(oHobbyContext => oHobbyContext.delete())
                    await Promise.all(aDeletePromises)

                    const aTokens = this.byId("oDataCRUDHobbiesInput").getTokens()
                    const aCreatePromises = aTokens.map(oToken => {
                        const sHobbyId = oToken.data("hobbyId")
                        const oNewHobbyContext = oHobbiesBinding.create({
                            hobby_id: sHobbyId
                        })
                        return oNewHobbyContext.created()
                    })
                    await Promise.all(aCreatePromises)

                    this.editingContext = null;

                    this.byId("oDataCRUDSaveButton").setText(this.i18n.getText("add"));
                    this.clearInputs();

                    this.byId("usersTable").getBinding("items").refresh()
                    MessageToast.show("Usuário atualizado com sucesso.")

                    return;
                }

                const oTable = this.byId("usersTable")
                const oListBinding = oTable.getBinding("items")
                const aTokens = this.byId("oDataCRUDHobbiesInput").getTokens()

                const oContext = oListBinding.create({
                    firstname: firstName,
                    lastname: lastName,
                    age: Number(age),

                    _Hobbies: aTokens.map(oToken => ({
                        hobby_id: oToken.data("hobbyId")
                    }))
                })

                await oContext.created()

                this.clearInputs();
                this.byId("usersTable").getBinding("items").refresh()
                
                MessageToast.show("Usuário adicionado com sucesso.")
            } catch(error) {
                MessageBox.error("Erro ao salvar usuário: " + (error.message || error.toString()))
            } finally {
                oView.setBusy(false)
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
            const oView = this.getView()

            try {
                oView.setBusy(true)
                await this.oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.softDelete(...)`
                ).execute();
                this.byId("usersTable").getBinding("items").refresh()
                MessageToast.show("Usuário excluído com sucesso.")
            } catch(error) {
                MessageBox.error("Erro ao excluir usuário: " + (error.message || error.toString()))
            } finally {
                oView.setBusy(false)
            }
        },

        async onPressRestoreUser(oEvent) {
            const oContext = oEvent.getSource().getBindingContext()
            const oView = this.getView()

            try {
                oView.setBusy(true)
                await this.oModel.bindContext(
                    `${oContext.getPath()}/com.sap.gateway.srvd.zui_usuario.v0001.restore(...)`
                ).execute();
                this.byId("usersTable").getBinding("items").refresh()
                MessageToast.show("Usuário restaurado com sucesso.")
            } catch(error) {
                MessageBox.error("Erro ao restaurar usuário: " + (error.message || error.toString()))
            } finally {
                oView.setBusy(false)
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