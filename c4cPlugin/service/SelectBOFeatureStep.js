define({

	getContent: function() {

		var that = this;
		    
		Q.sap.require("sap.hcp.c4c.plugin/utils/utils" , true).then(function(){
		    var scripts = utils.getScripts();
	       this.getScripts(scripts);
    	}.bind(this));    

		return Q.sap.require("sap.hcp.c4c.plugin/control/SelectBOFeatureStepContent" , true).then(function(){
		   
		   //var url= require.toUrl("sap.hcp.widget.plugin/css/AddRequireFeatureStep.css");
		   
		   //sap.watt.includeCSS(url);
		   
	   		var oStepContent = new sap.hcp.c4c.plugin.control.SelectBOFeatureStepContent({
				context: that.context
			});

			var sStepTitle = that.context.i18n.getText("c4c_select_BO_step_name");
			var sStepDescription = that.context.i18n.getText("c4c_select_BO_step_description");
            
            // Backward compatible to deprecared method (version 1.2 and before)
            var wizardStepFunc = that.context.service.wizard.createWizardStep || that.context.service.wizard.getWizardStep;
			
			return wizardStepFunc(oStepContent, sStepTitle, sStepDescription).then(function(oWizardStep) {
			        oWizardStep.setOptional(true);
					return oWizardStep;
				});
		});
	},
	
	getScripts: function(scripts) {
	    Q.sap.require(scripts[0] , true).then(function(){
	        scripts.splice(0,1);
	        this.getScripts(scripts);
    	}.bind(this));
	}
});