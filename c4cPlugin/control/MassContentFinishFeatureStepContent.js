jQuery.sap.declare("sap.hcp.c4c.plugin.control.MassContentFinishFeatureStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.MassContentFinishFeatureStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},
		
		init: function() {
            this.cbLayout = this._createContent();
	        this.addContent(this.cbLayout);
		},
        parsers: {},
		renderer: {},
		nextStepAnable:false,
		translationGenerated:false,
		
		
		_createContent: function() {
		  var src = require.toUrl("sap.hcp.c4c.plugin/starterPCMSolutionTemplate/image/preview.png"); 
		  var oImage = new sap.ui.commons.Image({src : src}); 
		  var oLayout = new sap.ui.layout.VerticalLayout({
          	    content: [oImage]
          }).addStyleClass("create-cust-layout");
		    
          return oLayout;  
		},

		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onAfterRendering: function() {
		     this.setViewModel();
		       /* if(!this.bAlreadyLoaded) {
		             this.bAlreadyLoaded = true;
			        this.setViewModel();
		        }*/
			},

        setViewModel: function(){
            this.getTranlstions();
            var contentCreation = this.getModel().oData.generateBos;
            var viewModel = this.getModel();
            var objIndex;
            var obj;
            var contentModel = {};
            contentModel.avilableBO = [];
            var bo;
            for( objIndex in contentCreation){
                obj = contentCreation[objIndex]; 
                bo = utils.getBoForMassCreator(objIndex,this.parser);
                var currentBO = utils.createModelForCreateTemplate(bo, this.parser); 
             
                //for table
                if(obj.table){   
                   currentBO = utils.createModelForTableTemplate(bo, this.parser,currentBO);
                   currentBO.hasTable = true;
                }
                else{
                     currentBO.hasTable = false;
                }
                //for details
                currentBO = utils.createModelForDetailsTemplate(bo, this.parser,currentBO);
                contentModel.avilableBO.push(currentBO);    
            }
            viewModel.setData({contentModel:contentModel}, true); 
            
            //be sure that component created under the root folder
            var currentComponentPath = this.getModel().oData.componentPath;
		    if(typeof (currentComponentPath) !== "undefined"){
                viewModel.oData.componentPath = viewModel.oData.pathToDestination;
		    }
        },
        
        getTranlstions :function(){
           var generateTranslation = this.getModel().oData.generateTranslations;
           if(generateTranslation && !this.translationGenerated){
                this.numOfTranslationsLoaded = 0;
                var url = this.destinationSelectedURL;
                this.fireProcessingStarted();
                this.fireValidation({
	             isValid : false});
	            this.translationGenerated =true;
		        utils.getAllTranslations(this,url);
           }
        },
        onReceiveAllTranslation   : function() {
           this.fireProcessingEnded();
           this.fireValidation({isValid : true});
		},
	
		onChangeDestination : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cDestination") {
    			this.parser = oEvent.getParameter("parser");
    			this.destinationSelectedURL = oEvent.getParameter("parser").destUrl;
    			this.translationGenerated = false;
    			this.bAlreadyLoaded = false;
    			this.oDataBackendServiceName = oEvent.getParameter("parser").oDataServiceName;
            }
        },
        
		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onBeforeRendering: function() {
			// Make sure to first call this method implementation in the
			// WizardStepContent base class
			if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
				sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.
				onBeforeRendering.apply(this, arguments);
			}
			//if model changed set to false
			//temporary solution
			 //this.bAlreadyLoaded = false;
			// Implement your logic here
		}
	});