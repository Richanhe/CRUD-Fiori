/*global QUnit*/

sap.ui.define([
	"project1/controller/FirstDesign.controller"
], function (Controller) {
	"use strict";

	QUnit.module("FirstDesign Controller");

	QUnit.test("I should test the FirstDesign controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
