define({

	getContent: function() {

		var that = this;
		
		return Q.sap.require("sap.hcp.c4c.plugin/control/TableSettingsStepFeatureStepContent" , true).then(function(){
		   
		   //var url= require.toUrl("sap.hcp.widget.plugin/css/AddRequireFeatureStep.css");
		   
		   //sap.watt.includeCSS(url);
		   
	   		var oStepContent = new sap.hcp.c4c.plugin.control.TableSettingsStepFeatureStepContent({
				context: that.context
			});

			var sStepTitle = "Table Settings";//that.context.i18n.getText("hcp_select_features");
			var sStepDescription = "Table Settings description";//that.context.i18n.getText("hcp_select_open_social_features_for_widget");
            
            // Backward compatible to deprecared method (version 1.2 and before)
            var wizardStepFunc = that.context.service.wizard.createWizardStep || that.context.service.wizard.getWizardStep;
			
			return wizardStepFunc(oStepContent, sStepTitle, sStepDescription).then(function(oWizardStep) {
			        oWizardStep.setOptional(true);
					return oWizardStep;
				});
		});
	}
});