define({

	getContent: function() {

		var that = this;
		
		 var urlParser= require.toUrl("sap.hcp.c4c.plugin/utils/parser.js");
		   sap.watt.includeScript(urlParser);
		
		return Q.sap.require("sap.hcp.c4c.plugin/control/DetailsPageFeatureStepContent" , true).then(function(){
		   

	   		var oStepContent = new sap.hcp.c4c.plugin.control.DetailsPageFeatureStepContent({
				context: that.context
			});
          
			var sStepTitle = that.context.i18n.getText("c4c_details_step_name");
			var sStepDescription ="";// that.context.i18n.getText("c4c_details_step_desc");
            
            // Backward compatible to deprecared method (version 1.2 and before)
            var wizardStepFunc = that.context.service.wizard.createWizardStep || that.context.service.wizard.getWizardStep;
			
			return wizardStepFunc(oStepContent, sStepTitle, sStepDescription).then(function(oWizardStep) {
			        oWizardStep.setOptional(true);

					return oWizardStep;
				});
		});
	}
});