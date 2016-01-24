jQuery.sap.declare("sap.hcp.c4c.plugin.control.SelectBOFeatureStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.SelectBOFeatureStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},
		
	    _CATALOG_GENERIC: "odata_gen",
		comboboxModel : null,
		populated:false,
		nextStepAnable:false,

		init: function() {
		},

		_createContent: function() {
		    
		   var that = this,
		       content;
            
           this.oDestinationComboBox = new sap.ui.commons.ComboBox({
    			width: "50%",
    			change: [this._destinationComboBoxChanged, that],
    			placeholder: this.getContext().i18n.getText("c4c_select_BO_system"),
    			layoutData: new sap.ui.layout.GridData({
    				span: "L10 M10 S10"
    			}),
    			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		   }); 
		   
		   this.systemLabel = new sap.ui.commons.Label({
		      text: this.getContext().i18n.getText("c4c_select_BO_system"), 
		      layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
		  });
		  
		  this.oServicesComboBox = new sap.ui.commons.ComboBox({
    			width: "50%",
    			change: [this._serviceComboBoxChanged, that],
    			items: this.getServicesItems(),
    			placeholder: this.getContext().i18n.getText("c4c_select_service"),
    			layoutData: new sap.ui.layout.GridData({
    				span: "L10 M10 S10"
    			}),
    			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		   }); 
		   
		   this.serviceLabel = new sap.ui.commons.Label({
		      text: this.getContext().i18n.getText("c4c_select_service"), 
		      layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
		  });
		    
		  content = [this.systemLabel, this.oDestinationComboBox, this.serviceLabel, this.oServicesComboBox];
		  
		  if (!this.isDestinationOnly) {
                this.buisnessObjectComboBox = new sap.ui.commons.ComboBox({
                    change: this.buisnessObjectChanged.bind(this),
                    placeholder: this.getContext().i18n.getText("c4c_select_BO_BO"),
                    width: "50%",
                    layoutData: new sap.ui.layout.GridData({span: "L10 M10 S10"}),
                    enabled: false
                });
                
                this.comboboxModel = new sap.ui.model.json.JSONModel();
                
                this.businessObjectLabel = new sap.ui.commons.Label({
                    text: this.getContext().i18n.getText("c4c_select_BO_BO"),
                    layoutData: new sap.ui.layout.GridData({span: "L2 M2 S2"})
                });
                
                content.push(this.businessObjectLabel);
                content.push(this.buisnessObjectComboBox);
		  }
		    
		  var oLayout = new sap.ui.layout.Grid({
              content: content,
              hSpacing: 0
		  });
           
          return oLayout;
		},
		
		getServicesItems: function() {
            return [
                new sap.ui.core.ListItem({text:"pcmportal"}),
                new sap.ui.core.ListItem({text:"servicerequest"})
            ];
		},
		
		_serviceComboBoxChanged: function(oEvent) {
		    
		    var item = oEvent.getParameter("selectedItem");
		    this.oDataBackendServiceName = item.getText();
		    this.getModel().oData.oDataServiceName = this.oDataBackendServiceName;
		    this.startParser();
		},
		
		_destinationComboBoxChanged: function(oEvent) {
		    var dest = oEvent.getParameter("selectedItem");
		    
		    if (dest && dest.data) {
		        this.destinationSelected = dest.data("connection");
		        //turn off cache in plugin
		        // this.getModel().oData.neoapp.destinations.push({"path":"/c4c","target" :{"type" : "destination", "name": "C4C_Optimize","entryPath" : "" }, "description" : "Forward C4C back-end requests to HANA Cloud Platform account's destination ('name' value indicates the destination name)", "_comment" : "Valid values for name attribute: 'C4C_Optimize' for production (OAuth2SAMLBearerAssertion+cache) ; 'C4C' (OAuth2SAMLBearerAssertion no cache); 'C4C__public' (BasicAuthentication no cache)"  });
		        this.getModel().oData.neoapp.destinations.push({"path":"/c4c","target" :{"type" : "destination", "name": "C4C","entryPath" : "" }, "description" : "Forward C4C back-end requests to HANA Cloud Platform account's destination ('name' value indicates the destination name)", "_comment" : "Valid values for name attribute: 'C4C_Optimize' for production (OAuth2SAMLBearerAssertion+cache) ; 'C4C' (OAuth2SAMLBearerAssertion no cache); 'C4C__public' (BasicAuthentication no cache)"  });
		        this.getModel().oData.neoapp.destinations.push({"path":"/c4cPreview","target" :{"type" : "destination", "name": this.destinationSelected.name,"entryPath" : "" }, "description" : "C4C preview"  });
		        this.startParser();
		    }
		},
		
		startParser: function() {
		   
		    if (this.destinationSelected && this.oDataBackendServiceName) {
                this.fireProcessingStarted();
		        this.parser = new Parser(this.destinationSelected.url, this.parserCompleted.bind(this),{oDataServiceName:this.oDataBackendServiceName}); 
		    }
		},
		
		getDestItemByKey: function(key) {
		    var items = this.oDestinationComboBox.getItems(),
		    i;
		    
		    for (i = 0; i < items.length; i++) {
		        if (items[i].getKey() === key) {
		            return items[i];
		        }
		    }
		},
		
		parserCompleted: function parserCompleted() {
		    var items = [];
		    
		    this.fireValueChange({
                     id : "c4cDestination",
                     parser: this.parser
            });
		    
		    this.nextStepAnable = !!this.isDestinationOnly;
            this.selectBoNextStep();
		    this.fireProcessingEnded();
		    
		    if (!this.isDestinationOnly) {
                this.buisnessObjectComboBox.setEnabled(true);
                items = this.parser.getAvailableBO(this.templateType);
                this.comboboxModel.setData(items);
                this.buisnessObjectComboBox.setVisible(true); 
		    }
		},
		
		onGetAnotationError: function() {
		    this.fireProcessingEnded();
		},
		
		buisnessObjectChanged: function(){
		    var boName = this.buisnessObjectComboBox.getValue(),
		        bo,
		        viewModel = this.getModel();
		        
		        if (!boName) {
		            return;
		        }
		        
		    bo = this.getBo(boName);  
              
            this.fireValueChange({
                 id : "c4cBO",
                 value : bo
            });
            this.nextStepAnable=true;
            this.fireValidation({isValid: true});
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
		     this.selectBoNextStep();

		    if (!this.isDestinationOnly) {
                this.buisnessObjectComboBox.setModel(this.comboboxModel);
                var oItemTemplate1 = new sap.ui.core.ListItem();
                oItemTemplate1.bindProperty("text", "name");
                oItemTemplate1.bindProperty("key", "name");
                this.buisnessObjectComboBox.bindItems("/", oItemTemplate1);
		    }
		    
		    this.getModel().oData.neoapp = this.getModel().oData.neoapp || {};
		    this.getModel().oData.neoapp.destinations = this.getModel().oData.neoapp.destinations || [];
		    var currentComponentPath = this.getModel().oData.componentPath;//this.getModel().oData.projectName
		    var pathToDestination;
		    if(typeof (currentComponentPath) !== "undefined"){
		        pathToDestination = this.getApplicationName(this.getModel().oData.componentPath);
		    }
		    else {
		        pathToDestination = this.getModel().oData.projectName;
		    }
		    if(pathToDestination.indexOf("/") !== 0 ){
		        pathToDestination = "/" + pathToDestination;
		    }
		    //var pathToDestination = this.getApplicationName(this.getModel().oData.componentPath);
		    this.getModel().oData.pathToDestination  = pathToDestination;
		    this.getModel().oData.overwrite = true;
		   // this.getModel().oData.oDataServiceName = this.oDataBackendServiceName;
		    
		    //this.getModel().oData.applicationPath = this.getRelativeApplicationPath(this.getModel().oData.componentPath,pathToDestination);
		},

		selectBoNextStep:function(){
		     this.fireValidation({
	             isValid : this.nextStepAnable});
		},
		
		getApplicationName :function(componentPath){
		    var index = componentPath.indexOf("/",1);
		    var pathToDestination;
		    if(index > -1){
		        pathToDestination = componentPath.substring(0,index);
		    }
		    else{
		        pathToDestination = componentPath; 
		    }
		    return pathToDestination;
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
			    
			    var templateID =this.getModel().oData.selectedTemplate._sId;
			    
			    if(templateID.indexOf("starterTableTemplate") > -1){
			        this.templateType = "table";
			    }else if(templateID.indexOf("starterDetailsPage") > -1){
			        this.templateType = "details";
		        }else if(templateID.indexOf("starterCreateTemplate") > -1){
		            this.templateType = "create";
        		}else if(templateID.indexOf("starterMassCreatorTemplate") > -1){
		            this.templateType = "massCreator";
        		} else if (templateID.indexOf("starterPCMSolutionTemplate") > -1 || templateID.indexOf("starterPCMUpdateTemplate") > -1 ) {
        		    this.templateType = "pcmSolution";
        		    this.isDestinationOnly = true;
        		}
        		
        		this.cbLayout = this._createContent();
			    this.addContent(this.cbLayout);
			}
			// Implement your logic here
			 var that = this;
		    
		    if (this.mProperties.context && !this.populated) {

		         this.fireProcessingStarted();
		      //  var destination = this.mProperties.context.service.catalogstep.context.service.destination;
		        var destination = this.mProperties.context.service.destination;
		        destination.getDestinations().then(function(aDestinations){
		          /*  that.oDestinationComboBox.addItem(new sap.ui.core.ListItem({
        				text: ""
        			}).data("connection", undefined));*/
        			
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