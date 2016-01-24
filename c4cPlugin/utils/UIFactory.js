var UIFactory = function(annotationParser, bo){
   
    var requiredFields = annotationParser.convertAnnotationToMap(annotationParser.getEntityTypeBO(bo, {type: "Nullable", value: "false"}).properties);
    var fieldsTypes = annotationParser.convertAnnotationToMap(annotationParser.getEntityTypeBO(bo).properties, {value: "Type"});
    var identificationExtensionFields = annotationParser.getIdentificationInfoExtensionFields(bo);
    
    var isFieldReuqired = function isFieldReuqired(field) {
        return !!requiredFields[field.path];
    };
    
    var getFieldType = function(field) {
        return fieldsTypes[field.path];
    };
   
    var getComplexFields = function(businessEntity, complexField) {
        var args, 
            i,
            fields = [],
            field;
            
         args = complexField.func.arguments;
         for (i = 0; i < args.length; i++) {
            field = this.getField(businessEntity, {
                path: args[i],
                title: args[i]
            });
            fields.push(field);
         }
         
         return fields;
    };
   
    var getField = function getField(businessEntity, field){
        var fieldControl,
            valueHelp,
            complexFields,
            comboBox;
        
        if (field.func) {
             complexFields = getComplexFields.call(this, businessEntity, field);
             fieldControl = new ComplexFields(field, complexFields);
        } else if (field.fieldName === 'Attachment') {
            fieldControl = new FileUpload(field); 
        } else {
            field.required = isFieldReuqired(field);
            valueHelp = annotationParser.getValueHelpParams(businessEntity, (field.path ? field.path.replace("/content","") : ""));
            if (valueHelp && !valueHelp.comboBox){
                fieldControl = new ValueHelpField(valueHelp, field);
            } else if (valueHelp && valueHelp.comboBox) {
                fieldControl = new ComboBox(valueHelp, field);  
            } else {
                var fieldType = getFieldType(field);
                var fieldExtension = identificationExtensionFields[field.path || annotationParser.convertFuncParamsToName(field.func.arguments)];
                switch (fieldType) {
                    case "Edm.DateTime":
                    case "Edm.DateTimeOffset":  
                        if (fieldExtension && fieldExtension.type === "DateTime") {
                            //type DateTime exist in the annotation extension
                           fieldControl = new DateTimeField(field);
                        } else {
                            //type DateTime is not exist in the annotation extension
                            fieldControl = new DateField(field);
                        }
                        break;
                    default:  
                        field.fieldType = fieldType;
                        fieldControl = new InputField(field); 
                        break;
                }
            }
        }
        
        return fieldControl;
    };

    return {getField:getField};
};

