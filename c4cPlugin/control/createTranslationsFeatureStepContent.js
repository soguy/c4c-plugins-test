jQuery.sap.declare("sap.hcp.c4c.plugin.control.createTranslationsFeatureStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.createTranslationsFeatureStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},


        parsers: {},
        
        _CATALOG_GENERIC: "odata_gen",
        
		init: function() {
		},
		
		_createContent: function() {
		  this.oDestinationComboBox = new sap.ui.commons.ComboBox({
    			width: "50%",
    			change: [this._destinationComboBoxChanged, this],
    			placeholder: this.getContext().i18n.getText("c4c_select_BO_system"),
    			layoutData: new sap.ui.layout.GridData({
    				span: "L10 M10 S10"
    			}),
    			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		   });
		   var systemLabel = new sap.ui.commons.Label({text: this.getContext().i18n.getText("c4c_select_BO_system"), layoutData: new sap.ui.layout.GridData({
    				span: "L2 M2 S2"
    			})});
          
          var oLayout = new sap.ui.layout.Grid({
           	    content: [systemLabel, this.oDestinationComboBox],
           hSpacing: 0});
		    
          return oLayout;  
		},
		
		_destinationComboBoxChanged: function(oEvent) {
		    var dest = oEvent.getParameter("selectedItem");
		    
		    this.fireValidation({isValid : false});
		    this.numOfTranslationsLoaded = 0;
		     var url;
		    if (dest && dest.data) {
		        this.destinationSelected = dest.data("connection");
		        url = this.destinationSelected.url;
		        this.fireProcessingStarted();
		        utils.setAdditionalData(this);
		        utils.getAllTranslations(this,url);
		    }
		},
		
		onReceiveAllTranslation   : function() {
           this.fireProcessingEnded();
           this.fireValidation({isValid : true});
		},
		renderer: {},

		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onAfterRendering: function() {
		   this.fireValidation({isValid : false});
		},
		
		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onBeforeRendering: function() {

			// Make sure to first call this method implementation in the
			// WizardStepContent base class
			if (sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.onBeforeRendering) {
				sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.prototype.
				onBeforeRendering.apply(this, arguments);
			}
			
			if(!this.populated){
		        this.cbLayout = this._createContent();
			    this.addContent(this.cbLayout);
			}

			 var that = this;
		    if (this.mProperties.context && !this.populated) {

		        this.fireProcessingStarted();
		        var destination = this.mProperties.context.service.destination;
		        destination.getDestinations().then(function(aDestinations){
        			
        			utils.getFormatterConnections(aDestinations, 0).forEach(function(oConnection) {
        				that.oDestinationComboBox.addItem(new sap.ui.core.ListItem({
    				        	text: oConnection.name,
    				        	key: oConnection.name
    				    }).data("connection", oConnection));
		        	});
                    
		            that.fireProcessingEnded();
		       });
		       this.populated=true;
		    }
		}
	});