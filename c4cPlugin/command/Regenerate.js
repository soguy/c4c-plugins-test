
define({

	execute : function() {
	    return this.context.service.regenerateService.generate(this.serviceName);
	},

	isAvailable : function() {
	    this.serviceName = null;
	    var that = this;
	    return false;
		/*return this.context.service.selection.getSelection().then(function(aSelection) {
		    var doc = aSelection[0].document;
		    if (doc) {
		        
		        return doc.getProject().then(function(project) {
		            return that.context.service.document.getDocumentByPath("/" + project.getTitle() + "/neo-app.json").then(function(neoApp) {
		                if (neoApp) {
		                    return neoApp.getContent().then(function(content) {
                                try {
                                    var neoJson = JSON.parse(content),
                                    i;
                                    for (i = 0; i < neoJson.routes.length; i++) {
                                        if (neoJson.routes[i].path === "/c4cPreview") {
                                          that.serviceName = neoJson.routes[i].target.name;
                                        }
                                    } 
                                } catch(e) {
                                } 
                                
                                return Q(!!that.serviceName);
		                    });
		                } else {
		                    return Q(false);
		                }
		            });
		        });
		    } else {
		        return Q(false);
		    }
		});*/
	},

	isEnabled : function() {
	    return true;
	}
});