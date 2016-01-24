define({
    
    templates: {
        create: {name: "Creator", fileValidator: "view/create.controller.js.tmpl", isGeneratedTemplate: true},
        table: {name: "Table", fileValidator: "view/table.controller.js.tmpl", isGeneratedTemplate: true},
        details: {name: "Details", fileValidator: "view/details.controller.js.tmpl", isGeneratedTemplate: true},
        shared: {name: "Shared", fileValidator: "backend.calls.js", isGeneratedTemplate: false},
        massCreator: {name: "MassCreator", fileValidator: "", isGeneratedTemplate: false}
    },

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
	onBeforeTemplateGenerate: function(templateZip, model) {
	    var templateType = this.getTemplateType(templateZip, model),
	        newTemplateZip,
	        newModel;
	    
	    if (templateType === "Shared") {
	        newTemplateZip = this.createSharedResources(templateZip, model);
	        newModel = model;
	    } else {
	        newTemplateZip = this.regenerateZip(templateType,templateZip, model);
	        newModel = this.regenerateModel(templateType,templateZip, model);
	    }
	    
	    
		utils.registerHandleBars();
		return [newTemplateZip, newModel];
	},
	
	createSharedResources: function createSharedResources(templateZip, model) {
	    var newZip = new JSZip(),
	        i,
	        nameSuffix,
	        folder;
	    
	    for (i in this.templates) {
	        if (this.templates.hasOwnProperty(i) && this.templates[i].isGeneratedTemplate) {
                nameSuffix = this.getFolderPath(this.templates[i].name, model);
                folder = newZip.folder(nameSuffix);
                this.createFilesInFolder(folder, templateZip); 
	        }
	    }
	    
	    return newZip;
	},
	
	createFilesInFolder: function createFilesInFolder(folder, zip) {
	    var file,
	        iFile;
	        
        for ( file in zip.files) {
            if (zip.files.hasOwnProperty(file)) {
                iFile = zip.files[file];
                folder.file(iFile.name, iFile._data, iFile.options);  
            }
        }
	},

    getTemplateType :function getTemplateType(templateZip){
        var name = this.templates.massCreator.name,
            i;
            
        for (i in this.templates) {
            if (this.templates.hasOwnProperty(i)) {
                if (typeof templateZip.files[this.templates[i].fileValidator] !== "undefined") {
                    name = this.templates[i].name;
                    break;
                }
            }
        }
        
        return name;
    },

	regenerateZip :function regenerateZip(rootName,projectZip, model){
	    var newZip = new JSZip(),
	        folder,
	        nameSuffix,
	        newTemplateZip;
	        
	        
	    if (rootName === "MassCreator" || (rootName === "Table"  &&  !model.currentBO.hasTable)){
	        return newZip;
	    }
      
        nameSuffix = this.getFolderPath(rootName, model);
		
		if (rootName === "Details" ){
		    newTemplateZip = utils.createFacetsDialogs(projectZip, model);
		} else{
		    newTemplateZip = projectZip;
		}
	 
		folder = newZip.folder(nameSuffix);
	    this.createFilesInFolder(folder, newTemplateZip);
		
		return newZip;
	},
	
	getFolderPath: function getFolderPath(templateType, model) {
	    return model.currentBO.boId + "/" + model.currentBO.boId + templateType;
	},
	
	regenerateModel :function regenerateModel (templateType,projectZip, model){
	    var newModel = jQuery.extend(true, {}, model);
	    newModel.componentPath = model.componentPath + "/" + model.currentBO.boId + "/" + model.currentBO.boId + templateType;
	    
	    //new presentation
	   var appPath = "/" + model.currentBO.boId + "/" + model.currentBO.boId + templateType;
	     //newModel.applicationPath = appPath;
	     newModel.currentBO.applicationPath = appPath;
	    //newModel.applicationPath = "/" + model.boId + "/" + model.boId + templateType;
	   /* if(templateType ==="Creator"){
	        newModel.uiFields = model.createUiFields;
	    }*/
	    return newModel;
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
	onAfterGenerate: function(projectZip, model) {

		return [projectZip, model];
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
	validateOnSelection: function(model) {

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
	configWizardSteps: function(oSelectBOStep, oCreate) {
		var oSelectBOStepContent = oSelectBOStep.getStepContent();
		var oCreateContent = oCreate.getStepContent();
		oSelectBOStepContent.attachValueChange(oCreateContent.onChangeDestination, oCreateContent);
		oSelectBOStepContent.attachValueChange(oCreateContent.onChangeBO, oCreateContent);

		// Return an array that contains all the template wizard steps
		return [oSelectBOStep, oCreate];
	}

});