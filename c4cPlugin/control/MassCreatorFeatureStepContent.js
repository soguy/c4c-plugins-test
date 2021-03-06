jQuery.sap.declare("sap.hcp.c4c.plugin.control.MassCreatorFeatureStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.MassCreatorFeatureStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},
		
		init: function() {
            this.cbLayout = this._createContent();
	        this.addContent(this.cbLayout);
		},

		renderer: {},
		
		_createContent: function() {
		  var src = require.toUrl("sap.hcp.c4c.plugin/starterMassCreatorTemplate/image/preview.png"); 
		  var oImage = new sap.ui.commons.Image({src : src}); 
		  var oLayout = new sap.ui.layout.VerticalLayout({
          	    content: [oImage]
          }).addStyleClass("create-cust-layout");
		    
          return oLayout;  
		},

		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onAfterRendering: function() {
		        if(!this.bAlreadyLoaded) {
		             this.bAlreadyLoaded = true;
			         this.setViewModel();
		        }
			},

		 setViewModel: function(){
		    var viewModel = this.getModel();

            //for create
             var currentBO = utils.createModelForCreateTemplate(this.bo, this.parser); 
             
            //for table
            if(this.parser.getLeadBos()[this.bo.id]){
               currentBO = utils.createModelForTableTemplate(this.bo, this.parser,currentBO);
               currentBO.hasTable = true;
            }
            else{
                 currentBO.hasTable = false;
            }
            //for details
            currentBO = utils.createModelForDetailsTemplate(this.bo, this.parser,currentBO);

            //be sure that component created under the root folder
            viewModel.oData.componentPath = viewModel.oData.pathToDestination;
            viewModel.setData({currentBO:currentBO}, true);
            
		},
		
		onChangeDestination : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cDestination") {
    			this.parser = oEvent.getParameter("parser");
            }
        },
        
        onChangeBO : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cBO") {
                this.bo = oEvent.getParameter("value");
                if(this.getModel()){
			        this.setViewModel();
                }
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
			// Implement your logic here
		}
	});