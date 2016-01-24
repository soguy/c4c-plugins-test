jQuery.sap.declare("sap.hcp.c4c.plugin.control.CreateStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.CreateStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},
		
		_CATALOG_RDL: "river",
	    _CATALOG_ODATA_ABAP: "odata_abap",
	    _CATALOG_GENERIC: "odata_gen",
		
		comboboxModel : null,
		selectedBO:null,

		init: function() {
		  this.bAlreadyLoaded = false;
		  this.cbLayout = this._createContent();
		  this.addContent(this.cbLayout);
		},
		
		_createContent: function() {
		  var src = require.toUrl("sap.hcp.c4c.plugin/starterCreateTemplate/image/preview.png"); 
		  var oImage = new sap.ui.commons.Image({src : src}); 
		  var oLayout = new sap.ui.layout.VerticalLayout({
          	    content: [oImage]
          }).addStyleClass("create-cust-layout");
		    
          return oLayout;  
		},

        getParser:function(){
            return this.parser;
        },
        
        getSelectedBO: function(){
            return this.selectedBO;
        },
        
		 setViewModel: function(){
		    var viewModel = this.getModel();
            var currentBO = utils.createModelForCreateTemplate(this.bo, this.parser);
            utils.addDataToSimpleModelTemplate(currentBO,viewModel.oData);
            viewModel.setData({currentBO:currentBO}, true);
            
		},


		getBo: function(boName) {
		    var bos = this.comboboxModel.getData(),
		        i;
		    for (i = 0; i < bos.length; i++) {
		        if (bos[i].name === boName) {
		           return bos[i]; 
		        }
		    }
		    
		    return [];
		},
		
		renderer: {},

		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onAfterRendering: function() {
		     if(!this.bAlreadyLoaded) {
		             this.bAlreadyLoaded = true;
			         this.setViewModel();
		        }
		},

        onChangeDestination : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cDestination") {
    			this.parser = oEvent.getParameter("parser");
            }
        },
        
        onChangeBO : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cBO") {
            this.bo =oEvent.getParameter("value");//this.getModel().oData.annotations;
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