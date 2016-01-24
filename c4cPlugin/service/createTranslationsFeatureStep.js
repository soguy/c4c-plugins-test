define({

	getContent: function() {

		var that = this;
		
		sap.watt.includeScript(require.toUrl("sap.hcp.c4c.plugin/utils/parser.js"));
		sap.watt.includeScript(require.toUrl("sap.hcp.c4c.plugin/utils/utils.js"));
		
		return Q.sap.require("sap.hcp.c4c.plugin/control/createTranslationsFeatureStepContent" , true).then(function(){
		   

	   		var oStepContent = new sap.hcp.c4c.plugin.control.createTranslationsFeatureStepContent({
				context: that.context
			});
          
			var sStepTitle = that.context.i18n.getText("c4c_select_BO_step_name");
			var sStepDescription =that.context.i18n.getText("c4c_select_BO_translation_step_description");
            
            // Backward compatible to deprecared method (version 1.2 and before)
            var wizardStepFunc = that.context.service.wizard.createWizardStep || that.context.service.wizard.getWizardStep;
			
			return wizardStepFunc(oStepContent, sStepTitle, sStepDescription).then(function(oWizardStep) {
			        oWizardStep.setOptional(true);

					return oWizardStep;
				});
		});
	}
});