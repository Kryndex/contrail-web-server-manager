/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "underscore",
    "contrail-model",
    "sm-constants",
    "sm-labels",
    "sm-utils",
    "sm-model-config"
], function (_, ContrailModel, smwc, smwl, smwu, smwmc) {
    var ImageModel = ContrailModel.extend({

        defaultConfig: smwmc.getImageModel(smwc.CATEGORY_IMAGE),

        configure: function (callbackObj) {
            var ajaxConfig = {};
            if (this.model().isValid(true, smwc.KEY_CONFIGURE_VALIDATION)) {
                var imageAttrs = this.model().attributes,
                    imageSchema = smwmc.getImageSchema,
                    putData = {}, imageAttrsEdited = [],
                    locks = this.model().attributes.locks.attributes;

                locks["category" + cowc.LOCKED_SUFFIX_ID] = false;
                imageAttrsEdited.push(cowu.getEditConfigObj(imageAttrs, locks, imageSchema, ""));
                putData[smwc.IMAGE_PREFIX_ID] = imageAttrsEdited;

                ajaxConfig.type = "POST";
                ajaxConfig.data = JSON.stringify(putData);
                ajaxConfig.timeout = smwc.TIMEOUT;
                ajaxConfig.url = smwu.getObjectUrl(smwc.IMAGE_PREFIX_ID);

                contrail.ajaxHandler(ajaxConfig, function () {
                    if (contrail.checkIfFunction(callbackObj.init)) {
                        callbackObj.init();
                    }
                }, function () {
                    if (contrail.checkIfFunction(callbackObj.success)) {
                        callbackObj.success();
                    }
                }, function (error) {
                    console.log(error);
                    if (contrail.checkIfFunction(callbackObj.error)) {
                        callbackObj.error(error);
                    }
                });
            } else {
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(this.getFormErrorText(smwc.IMAGE_PREFIX_ID));
                }
            }
        },
        deleteImage: function (checkedRow, callbackObj) {
            var ajaxConfig = {},
                clusterId = checkedRow.id;

            ajaxConfig.type = "DELETE";
            ajaxConfig.url = smwc.URL_OBJ_IMAGE_ID + clusterId;

            contrail.ajaxHandler(ajaxConfig, function () {
                if (contrail.checkIfFunction(callbackObj.init)) {
                    callbackObj.init();
                }
            }, function () {
                if (contrail.checkIfFunction(callbackObj.success)) {
                    callbackObj.success();
                }
            }, function (error) {
                console.log(error);
                if (contrail.checkIfFunction(callbackObj.error)) {
                    callbackObj.error(error);
                }
            });
        },
        validations: {
            configureValidation: {
                "id": {
                    required: true,
                    msg: smwm.getRequiredMessage("id")
                },
                "type": {
                    required: true,
                    msg: smwm.getRequiredMessage("type")
                },
                "version": {
                    required: true,
                    msg: smwm.getRequiredMessage("version")
                },
                "path": {
                    required: true,
                    msg: smwm.getRequiredMessage("path")
                }
            }
        },
        goForward : function(rootViewPath, path, prefixId, rowIndex){
            var self = this;
            var modalId = "configure-" + prefixId;
            $("#" + modalId).modal("hide");
            var viewConfigOptions = {
                rootViewPath : rootViewPath,
                path : path,
                group : "",
                page : "",
                element : prefixId,
                rowIndex: rowIndex,
                formType: "edit"
            };
            var viewConfig = vcg.generateViewConfig(viewConfigOptions, schemaModel, "default", "form"),
                dataItem = $("#" + smwl.SM_IMAGE_GRID_ID).data("contrailGrid")._dataView.getItem(rowIndex),
                checkedRow = [dataItem],
                title = smwl.TITLE_EDIT_CONFIG + " ("+ dataItem.id +")";

            var imageEditView = new ImageEditView();
            imageEditView.model = self;
            imageEditView.renderConfigure({"title": title, checkedRows: checkedRow, rowIndex: rowIndex, viewConfig: viewConfig, callback: function () {
                var dataView = $("#" + smwl.SM_IMAGE_GRID_ID).data("contrailGrid")._dataView;
                dataView.refreshData();
            }});

            imageEditView.renderView4Config($("#" + modalId).find("#" + prefixId + "-form"), self, viewConfig, smwc.KEY_CONFIGURE_VALIDATION, null, null, function() {
                self.showErrorAttr(prefixId + cowc.FORM_SUFFIX_ID, false);
                Knockback.applyBindings(self, document.getElementById(modalId));
                kbValidation.bind(imageEditView);
            });

        }
    });

    return ImageModel;
});
