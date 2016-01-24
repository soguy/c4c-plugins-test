var uiUtils = {
     
    isCreatableField: function(creatableFields, field,type) {
        var i,
            path,
            args;
        if(type === "path"){
            path = field.path;
        }
        else{
            path = field.name;
        }
        if (path && creatableFields[path]) {
            return creatableFields[path];
        } else if (field.func && field.func.funcName === "odata.concat") {
            //complex fields
            args = field.func.arguments;
            for (i = 0; i < args.length; i++) {
                if (creatableFields[args[i]]) {
                    //atleast one field is creatable
                    return true;
                }
            }
            
            //all fields are not creatable
            return false;
        }
        return false;
    },
     
    getUiFields:  function(bo, parser,fields,isUpdatable) {
        if(typeof fields === "undefined"){
             fields = parser.getIdentificationInfo(parser.getBusinessObject(bo.id));
        }
         var creatableFields,
             uiFields = [],
             factoryInstance;
                 
             factoryInstance = UIFactory(parser, bo.id);
             //if(typeof isUpdatable !== "undefined"){
             if(isUpdatable){
                //creatableFields = parser.convertAnnotationToMap(parser.getEntityTypeBO(bo.id, {type: "sap\\:creatable", value: "true"}).properties);
                creatableFields = parser.convertAnnotationToMap(parser.getEntityTypeBO(bo.id, {type: "sap\\:updatable", value: "true"}).properties);
                 
             }
             else{
                creatableFields = parser.convertAnnotationToMap(parser.getEntityTypeBO(bo.id, {type: "sap\\:creatable", value: "true"}).properties);
               // creatableFields = parser.convertAnnotationToMap(parser.getEntityTypeBO(bo.id, {type: "sap\\:updatable", value: "true"}).properties); 
             }
             for(var i = 0 ;i < fields.length; i++){
                 if (isUpdatable && !(uiUtils.isCreatableField(creatableFields, fields[i],"path"))) {
                    fields[i].isEnabled = false;
                    uiFields.push(factoryInstance.getField(bo.id,fields[i])); 
                 }
                 
		         if (uiUtils.isCreatableField(creatableFields, fields[i],"path")) {
		            fields[i].isEnabled = true;
                    uiFields.push(factoryInstance.getField(bo.id,fields[i]));
		         }
             }
             
             return uiFields;

    },
    
    getUiFieldsForUILine: function(bo, parser,fields,isUpdatable, isAttachable) {
        
        isAttachable = typeof(isAttachable) === 'undefined' ? false : !!isAttachable;
        
         var creatableFields,
             uiFields = [],
             factoryInstance;
                 
             factoryInstance = UIFactory(parser, bo);
             var typeOfFields;
             if(isUpdatable){
                 typeOfFields = "sap\\:updatable";
             } else {
                 typeOfFields = "sap\\:creatable";
             }
             creatableFields = parser.convertAnnotationToMap(parser.getEntityTypeBO(bo, {type: typeOfFields, value: "true"}).properties);
             
             for(var i = 0 ;i < fields.length; i++){
		         if (uiUtils.isCreatableField(creatableFields, fields[i],"name")) {
                   // uiFields.push(factoryInstance.getField(bo.id,fields[i]));
                    if(typeof fields[i].name !== "undefined" ){
                        uiFields.push(factoryInstance.getField(bo,{path:fields[i].name,titleKey:fields[i].titleKey}));
                    }
                    else{
                        uiFields.push(factoryInstance.getField(bo,fields[i]));
                    }
		         }
             }
             
             if (isAttachable) {
                uiFields.push(factoryInstance.getField(bo, {
                    fieldName: 'Attachment',
                    titleKey: 'starterDetailsPage.dialog.facetAdd.fragment.FileUpload.label',
                    resourceBundle: 'i18n_Static',
                    required: true
                })); 
             }
             
             return uiFields;

    },
    
	isFacetEditable: function isFacetEditable(facetUIFields){
	    var i;
	    
	    facetUIFields = facetUIFields || [];
	    
	    for (i = 0; i < facetUIFields.length; i++) {
	        if (facetUIFields[i].isEnabled) {
	            return true;
	        }
	    }
	    
	    //all ui fields are disabled
	    return false;
	}
};