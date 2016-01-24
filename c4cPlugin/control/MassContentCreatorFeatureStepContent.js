jQuery.sap.declare("sap.hcp.c4c.plugin.control.MassContentCreatorFeatureStepContent");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.hcp.c4c.plugin.control.MassContentCreatorFeatureStepContent", {
		// Define the SAPUI5 control's metadata  
		metadata: {
			properties: {

			}
		},
		
		initialTranslationCheckBoxChecked: true,
		
		init: function() {
            
		},

		renderer: {},
		
		_createContent: function() {
		    
		  this.oTreeTable = this.createTreeBos();  
		  this.oTranslationCheckbox = this.createTranslationCheckbox();
		  var linksTabLayout = new sap.ui.layout.HorizontalLayout({
			content:[
					new sap.ui.commons.Link({text: this.getContext().i18n.getText("c4c_solution_component_template_generate_select_all") ,press: this.onSelectAll.bind(this)}).addStyleClass("first-link"),
					new sap.ui.commons.Link({text: this.getContext().i18n.getText("c4c_solution_component_template_generate_clear_all") ,press: this.onClearAll.bind(this)}).addStyleClass("second-link")                                     
					]

		}).addStyleClass("links-content-layout");
		  var dr1=new sap.ui.commons.HorizontalDivider(); 
		  var dr2=new sap.ui.commons.HorizontalDivider(); 
		  var oTreeLayout =  new sap.ui.layout.VerticalLayout({
          	    content: [this.oTreeTable]
          }).addStyleClass("create-tree-layout");
		  var oLayout = new sap.ui.layout.VerticalLayout({
		        width: "300px",
          	    content: [linksTabLayout,dr1, oTreeLayout,dr2,this.oTranslationCheckbox]
		  });
          return oLayout;
		},
		
		onClearAll:function(){
		    this.applyTreeState("Unchecked");
		},
		
		applyTreeState:function(state){
		    var i,boIndex;
		    var  data = this.oTreeTable.getModel().getData().bos; 
		    for (boIndex = 0; boIndex < data.length; boIndex++) {
		        data[boIndex].checked = state;
		        var numberOfPatterns = data[boIndex].patterns.length;
		        for (i = 0; i < numberOfPatterns; i++) {
    				var pattern = data[boIndex].patterns[i];
    				pattern.checked = state;
    			}		
		    }
		    this.setTreeViewModel();
    		this.oTreeTable.rerender();
		},
		
		
		onSelectAll:function(){
		  this.applyTreeState("Checked");
		},
		
		createTreeBos: function createTreeBos() {
		    var scope = this;
		    
		    var oTSCB = new sap.ui.commons.TriStateCheckBox({change: onCheckboxChange});
    		oTSCB.bindProperty("selectionState", "checked");
		    
		    var icon = new sap.ui.core.Icon({
				src: sap.ui.core.IconPool.getIconURI("favorite"),
				size: '11px',
				color: '#4F7CC3',
				tooltip: this.getContext().i18n.getText("c4c_solution_component_template_new_icon_tolltip")
			});
			icon.bindProperty("visible", "isNew");
    		
    		var textView = new sap.ui.commons.TextView();
			textView.bindProperty("text","text");
    		
    		var template = new sap.ui.layout.HorizontalLayout({content: [oTSCB, icon, textView]});
    
    		var oColumn = new sap.ui.table.Column({template: template, visible: true});
    		
    		var oTreeTable = new sap.ui.table.TreeTable({
    			columns: oColumn,
    			visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
    			showNoData: false
    			//expandFirstLevel: true 					
    		}).addStyleClass('bos-tree');		
    
    		function onCheckboxChange(oEvent){
    			var state = this.getSelectionState(),
        			table = oEvent.getSource(),
    			    bindingContext = table.getBindingContext(),
    			    isBoChanged = bindingContext.sPath.indexOf("patterns") === -1,
    			    boIndex = bindingContext.sPath.substr("/bos/".length),
    			    data = table.getModel().getData(),
    			    i;
    			
    			if (isBoChanged) {
    					//select all patterns (children)
    					var numberOfPatterns = data.bos[boIndex].patterns.length;
    					
    					for (i = 0; i < numberOfPatterns; i++) {
    						var patternContext = table.getModel().getContext(bindingContext.sPath + "/patterns/" + i);
    						var pattern = patternContext.getObject();
    						pattern.checked = state;
    					}				
    			}
    			
    		    scope.setTreeViewModel();
    			oColumn.rerender();
    		}
    		
    		return oTreeTable;
		},
		
		createTranslationCheckbox: function createTranslationCheckbox() {
		    var scope = this;
		    var translationCheckBox = new sap.ui.commons.CheckBox({
                            text : this.getContext().i18n.getText("c4c_solution_component_template_generate_translations"),
                            tooltip : this.getContext().i18n.getText("c4c_solution_component_template_generate_translations"),
                            checked : this.initialTranslationCheckBoxChecked,
                            change : function() {
                                scope.setTranslationViewModel(this.getChecked());
                            }
            });
    
            return translationCheckBox;
		},
		
		setTranslationViewModel: function setTranslationViewModel(checked) {
		    this.getModel().setData({generateTranslations:checked}, true);
		},

		// Overwrite this SAPUI5 control method if you have some logic to implement here
		onAfterRendering: function() {
		       
		},
		
		setTreeViewModel: function setTreeViewModel() {
		    var viewModel = this.getModel(),
		        generateBos = this.getGenerateBos();
		    
		    if (viewModel.getData() && viewModel.getData().generateBos) {
		        viewModel.getData().generateBos = {};
		    }
		    
		    viewModel.setData({generateBos:generateBos}, true);
		},
		
		getGenerateBos: function getGenerateBos() {
		    var bos = this.oTreeTable.getModel().getData().bos,
		        generateBos = {},
		        boIndex,
		        bo,
		        boObj,
		        pattern,
		        typeIndex;
		        
		    for (boIndex = 0; boIndex < bos.length; boIndex++) {
		        bo = bos[boIndex];
		        boObj = {};
		        
                for (typeIndex = 0; typeIndex < bo.patterns.length; typeIndex++) {
                    pattern = bo.patterns[typeIndex];
                    boObj[pattern.key] =  (pattern.checked === sap.ui.commons.TriStateCheckBoxState.Checked);
                }
                
                generateBos[bo.key] = boObj; 
		        
		    }  
		        
		    return generateBos;
		},

		setTreeModel: function(){
		    var that = this,
		        bosTree = this.parser.getBosTree();
		    
		    if(this.isProject()){
		        this.setTreeModelHelper(bosTree);
		    }
		    else{
		    this.getContext().service.document.getDocumentByPath(this.getModel().getData().pathToDestination).then(function(document){
			    document.getFolderContent().then(function(projectContent){
                    that.getGeneratedFolders(projectContent, function(generatedContent) {
                        that.setTreeModelHelper(bosTree, generatedContent);
                    }); 
			    });
			});
		   }
		 
		},
		
		setTreeModelHelper: function setTreeModelHelper(bosTree, generatedContent) {
		    var boName,
		        bo,
		        generated,
		        boObj,
		        foundPattern,
		        type,
		        isNew,
		        oData = {bos: []};
		    
		    for (boName in bosTree) {
                if (bosTree.hasOwnProperty(boName)) {
                    bo = bosTree[boName];
                    generated = generatedContent && generatedContent[boName];
                    boObj = this.createCheckBoxObj(boName);
                    foundPattern = false;
                    
                    for (type in bo) {
                        if (bo.hasOwnProperty(type) && bo[type]) {
                            if (generatedContent) {
                                if (!generated || generated[type] === undefined) {
                                   isNew = true; 
                                } else {
                                    isNew = generated[type]
                                }
                            } else {
                                isNew = false;
                            }
                            boObj.patterns.push(this.createCheckBoxObj(type, isNew));
                            foundPattern = true;
                        }
                    }
                    
                    if (foundPattern) {
                        oData.bos.push(boObj); 
                    }
                }
            }    
            
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(oData);
            
            this.oTreeTable.setModel(oModel);
            this.oTreeTable.bindRows("/bos");
            
            //update view model with initial params:
            this.setTreeViewModel();
            this.setTranslationViewModel(this.initialTranslationCheckBoxChecked); 
		},
		
		isProject: function isProject() {
            var currentComponentPath = this.getModel().oData.componentPath;
		    if(typeof (currentComponentPath) !== "undefined"){
		        return false;
		    }
		    else {
		      return true;
		    }
		},
		
		getGeneratedFolders: function getGeneratedFolders(projectContent, callback) {
		    var i,j,k,
                pattern,
		        folder,
		        patterns = {
		          Creator: "create",
		          Details: "details",
		          Table: "table"
		        },
		        boName,
		        numberOfProjectFolders = projectContent.length,
		        numberOfProjectFoldersCompleted = 0,
		        bosObj = {},
		        generatedFolders = {};
		      
		    function projectFolderCompleted() {
		        numberOfProjectFoldersCompleted++;
                if (numberOfProjectFolders === numberOfProjectFoldersCompleted) {
                    callback(generatedFolders); 
                }
		    }
		    
		    function patternCompleted(boName) {
		        bosObj[boName].numberOfPatternsCompleted++;
                if (bosObj[boName].numberOfPatterns ===  bosObj[boName].numberOfPatternsCompleted) {
                    projectFolderCompleted();
                }
		    }  
		        
		    if (projectContent.length === 0) {
		        callback();
		        return;
		    }
		    
		    //BOS
		    for (i = 0; i < projectContent.length; i++) {
		        //BO
		        folder = projectContent[i];
		        boName = folder._mEntity._sName;
	            generatedFolders[boName] = {};
	            
	            if (folder._mEntity._sType === "folder") {
    	            folder.getFolderContent().then(function(folderContentPatterns){
    	                //Paterns
    	                bosObj[this.boName] = {numberOfPatterns: folderContentPatterns.length, numberOfPatternsCompleted: 0};    
    	                for (j = 0; j < folderContentPatterns.length; j++) {
    	                    pattern = patterns[folderContentPatterns[j]._mEntity._sName.slice(this.boName.length)];
    	                    if (pattern) {
        	                    folderContentPatterns[j].getFolderContent().then(function(patternContent) {
        	                        //Pattern
        	                        var isNew = true;
        	                        for (k = 0; k < patternContent.length; k++) {
        	                            if (patternContent[k]._mEntity._sName === "Component.js") {
        	                                isNew = false;
        	                                break;
        	                            }
        	                        }
        	                        generatedFolders[this.boName][this.pattern] = isNew;
        	                        patternCompleted(this.boName);
        	                    }.bind({boName: this.boName, pattern: pattern}));
    	                    } else {
    	                        patternCompleted(this.boName);
    	                    }
    	                }
    	            }.bind({boName: boName}));
	            } else {
	                //not a folder
	                projectFolderCompleted();
	            }
		    }
		},
		
		 createCheckBoxObj: function createCheckBoxObj(name, isNew) {
		     return {  
	                checked: sap.ui.commons.TriStateCheckBoxState.Checked,
	                text: name,
	                key: name, //TODO ?
	                patterns: [],
	                isNew: !!isNew
		     };
		 },
		
		onChangeDestination : function(oEvent) {
            if (oEvent.getParameter("id") === "c4cDestination") {
    			this.parser = oEvent.getParameter("parser");
    			if(this.getModel() && this.populate){
                    this.setTreeModel();
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
			if (!this.populate ) {
			   this.populate  = true;
			   this.cbLayout = this._createContent();
	           this.addContent(this.cbLayout); 
	           this.setTreeModel();
			}
		}
	});