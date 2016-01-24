define({

	getContent: function() {

		var that = this;
		
		return Q.sap.require("sap.hcp.c4c.plugin/control/TableCustomizationFeatureStepContent" , true).then(function(){
		   
		   //var url= require.toUrl("sap.hcp.widget.plugin/css/AddRequireFeatureStep.css");
		   
		   //sap.watt.includeCSS(url);
		   
	   		var oStepContent = new sap.hcp.c4c.plugin.control.TableCustomizationFeatureStepContent({
				context: that.context
			});

			var sStepTitle = that.context.i18n.getText("c4c_table_customization_step_name");
			var sStepDescription = that.context.i18n.getText("c4c_table_customization_step_desc");
            
            // Backward compatible to deprecared method (version 1.2 and before)
            var wizardStepFunc = that.context.service.wizard.createWizardStep || that.context.service.wizard.getWizardStep;
			
			return wizardStepFunc(oStepContent, sStepTitle, sStepDescription).then(function(oWizardStep) {
			        oWizardStep.setOptional(true);
					return oWizardStep;
				});
		});
	}
});