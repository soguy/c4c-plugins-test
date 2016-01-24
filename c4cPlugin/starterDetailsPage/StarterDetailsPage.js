define({

	/**
	 * Applies template logic before generating the template resources in the provided zip file.
	 * 
	 * This method is executed before passing the model into the template resources, 
	 * and is therefore ideal for model manipulations.
	 * 
	 * Note that this method is not called for templates that do not include resources.
	 * 
	 * @param templateZip The zip bundle containing the template resources that are about to be generated, 
	 * as provided by the template.
	 *  
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onBeforeTemplateGenerate : function(templateZip, model) {
	    var templateType = this.getTemplateType(templateZip);
        utils.registerHandleBars();
        if (templateType === "Details") {
            var newTemplateZip =utils.createFacetsDialogs(templateZip, model.currentBO.facets, model.currentBO.selectedBO);
            return [ newTemplateZip, model ];
        } else {
            return [ templateZip, model ];
        }
	},
	
	getTemplateType :function(templateZip){
        var name;
        var tmplFile = templateZip.files["view/create.controller.js.tmpl"];
		if (typeof tmplFile !== "undefined") {
		    name =  "Creator";
		}else{
		    tmplFile = templateZip.files["view/table.controller.js.tmpl"];
		    if(typeof tmplFile !== "undefined"){
		        name = "Table";
		    }
		    else{
		        tmplFile = templateZip.files["view/details.controller.js.tmpl"];
			    if(typeof tmplFile !== "undefined"){
			        name = "Details";
			    }
			    else{
			        name = "MassCreator";
			    }
		    }
		}
		return name;
    },
   
	/**
	 * Applies template logic after generating the template resources according to the template model 
	 * and bundling the generated resources into the provided zip file.
	 * 
	 * This method is executed after passing the model into the template resources 
	 * but before extracting the generated project zip file to the SAP RDE workspace. 
	 * Therefore, this method is ideal for manipulating the generated project files 
	 * (for example, renaming files according to the template model). 
	 * 
	 * @param projectZip The zip bundle containing all the generated project resources, 
	 * after applying the model parameters on the template resources.
	 * 
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onAfterGenerate : function(projectZip, model) {

		return [ projectZip, model ];
	},

	/**
	 * Checks that the template can be selected in the wizard with the context of the given model.
	 * 
	 * This method can be used for preventing the user from selecting the template when it is not appropriate 
	 * according to previous selections in the generation wizard.
	 * For example, you are prevented from generating a Component template in an inappropriate project.
	 * 
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 * @returns 'true' if the template can be selected according to a given model, 
	 * or throws an error with the appropriate message if the validation fails.
	 */
	validateOnSelection : function(model) {

		return true;
	},
	
	/**
	 * Configures the wizard steps that appear after the template is selected in the wizard.
	 * 
	 * The method arguments are the wizard step objects that appear after selecting the template.
	 * These steps are defined in the 'wizardSteps' property of the template configuration entry 
	 * (located in the plugin.json file of the plugin containing the template).
	 * 
	 * The method is used for setting step parameters and event handlers  
	 * that define the appropriate relations between the steps.
	 * 
	 * For example, to define how 'step2' handles changes that occur in 'step1':
	 * 
	 * var oStep1Content = oStep1.getStepContent();
	 * var oStep2Content = oStep2.getStepContent();
	 * 
	   // To handle validation status changes in oStep1Content:
	 * oStep1Content.attachValidation(oStep2Content.someHandlerMethod, oStep2Content);
	 * 
	   // To handle value changes in oStep1Content:
	 * oStep1Content.attachValueChange(oStep2Content.anotherHandlerMethod, oStep2Content);
	 *  
	 */
	configWizardSteps : function(selectBOStep, oDetailspagestep) {
	    var oSelectBOStepContent = selectBOStep.getStepContent();
	    var oDetailspagestepContent = oDetailspagestep.getStepContent();
		oSelectBOStepContent.attachValueChange(oDetailspagestepContent.onChangeDestination,oDetailspagestepContent);
		oSelectBOStepContent.attachValueChange(oDetailspagestepContent.onChangeBO,oDetailspagestepContent);
		// Return an array that contains all the template wizard steps
		return [selectBOStep, oDetailspagestep];
	}

});
