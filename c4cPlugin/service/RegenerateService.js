define({
    
    patterns: {
        create: "Creator",
        details: "Details",
        table: "Table"
    },
    
    model: null,

	init : function() {
		
	},
	
	getScripts: function(scripts, callback) {
	    Q.sap.require(scripts[0] , true).then(function(){
	        scripts.splice(0,1);
            if (scripts.length === 0) {
                callback();
            } else {
	            this.getScripts(scripts, callback);
            }
    	}.bind(this));
	},

	generate : function(serviceName) {
		var that = this;
		
		that.generateModel = new sap.ui.model.json.JSONModel();
		
		Q.sap.require("sap.hcp.c4c.plugin/utils/utils" , true).then(function(){
		   var scripts = utils.getScripts();
	       that.getScripts(scripts, function() { //Load all scripts
                that.getParser(serviceName, function(){ //Load the parser
                    that.context.service.selection.getSelection().then(function(aSelection) { //Get the selected document
                        var folderSelected = aSelection[0].document,
                            folderObj,
                            path = folderSelected.getEntity().getFullPath(),
                            bos = that.parser.getAvailableBO("pcmSolution");
                        
                        if (folderSelected) {
                            that.context.service.template.getTemplate('c4cPlugin.starterDetailsPage').then(function(template){ //TODO remove details. Get template
    		                    folderObj = that.getFolderObj(folderSelected.getTitle()); 
                                var bo = that.getBo(bos, folderObj.boId);
                                var overwrite = true;
                                
                                var model = utils["createModelFor" + folderObj.type.charAt(0).toUpperCase() + folderObj.type.slice(1) +  "Template"](bo, that.parser); 
                               
                                that.generateModel.setData({currentBO: model},true);
                                that.context.service.generation.generate(path, template, that.generateModel.getData(), overwrite, folderSelected);
    	                	});
                        }
                    });
                });
	       });
    	}); 
        
		/*return this.context.service.usernotification.info(serviceName).then(function() {
			return that.context.event.fireNotificationDisplayed({
				notificationCount : that.getNotificationCount()
			});
		});*/
	},
	
	getBo: function(bos, boId) {
	    var i;
	    
	    for (i = 0; i < bos.length; i++) {
	        if (boId === bos[i].id) {
	            return bos[i];
	        }
	    }
	    
	    return {};
	},
	
	getParser: function(serviceName, callback) {
	    if (!this.parser) {
	        this.parser =  new Parser("/destinations/" + serviceName, callback);
	    } else {
	        callback();
	    }
	},
	
	getFolderObj: function(folderName) {
	    var i,
	        obj;
	    
	    for (i in this.patterns) {
	        if (this.patterns.hasOwnProperty(i)) {
	            if (folderName.indexOf(this.patterns[i]) >= 0) {
	               obj = {
	                  boId: folderName.substring(0,folderName.indexOf(this.patterns[i])),
	                  type: i
	               };
	               break;
	            }
	        }
	    }
	    
	    return obj;
	}
});