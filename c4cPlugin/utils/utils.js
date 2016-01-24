var utils = {
    
    i18nModelName: "i18n",
    i18nAnnotationExtensionModelName:'i18n_AnnoExt',
    supportTranslations: [
            "en", //English
            "en-US", //English us
            "fr", //French
            "de", //German
            "pt", //Portuguese
            "zh-CN", //Simplified Chinese
            "ja", //Japanese
            "ru", //Russian
            "es" //Spanish
        ],
    templates: {
        create: {name: "Creator", fileValidator: "view/create.controller.js.tmpl", isGeneratedTemplate: true},
        table: {name: "Table", fileValidator: "view/table.controller.js.tmpl", isGeneratedTemplate: true},
        details: {name: "Details", fileValidator: "view/details.controller.js.tmpl", isGeneratedTemplate: true},
        shared: {name: "Shared", fileValidator: "backend.calls.js", isGeneratedTemplate: false},
        translation: {name: "Translation", fileValidator: "translation.tmpl", isGeneratedTemplate: true},
        massCreator: {name: "MassCreator", fileValidator: "", isGeneratedTemplate: false}
    },
	
	getScripts: function() {
	    return [
		        "sap.hcp.c4c.plugin/utils/common",
		        "sap.hcp.c4c.plugin/utils/parser",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/Field",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/ComboBox",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/InputField",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/ValueHelpField",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/LabelField",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/DateField",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/FileUpload",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/DateTimeField",
		        "sap.hcp.c4c.plugin/utils/UIRenderers/ComplexFields",
		        "sap.hcp.c4c.plugin/utils/UIFactory",
		        "sap.hcp.c4c.plugin/utils/uiUtils"
	    ];
	},
    
    registerHandleBars: function() {
       
        Handlebars.registerHelper('ifCond', function(v1, v2, options) {
          if(v1 === v2) {
            return options.fn(this);
          }
          
          return options.inverse(this);
        });
       
        Handlebars.registerHelper('getI18n', function(str){
                 return '{' + utils.i18nModelName + '>' + str +  '}';
        });
        
        Handlebars.registerHelper('getDefaultQueryPath', function(defaultQuery,selectedBo){
            var res = '';
                if(defaultQuery.type === 'Parameter'){
                    res += selectedBo;
                }else{
                   res += defaultQuery.funcName;
                }
                return res;
       });
       
       Handlebars.registerHelper('hasInteractionLogFacet', function(facets, options){
            var i;
            
            for (i = 0; i < facets.length; i++) {
                if (facets[i].childInteractionLog) {
                    return options.fn(this);
                }
            }
            
            return options.inverse(this);
        });
       
       Handlebars.registerHelper('getControlFilter', function(name, type, func){
           var str,res = '';
           if (name === undefined){
                    str = func.arguments[0];
                    str += '@';
                    str += func.arguments[1];
                }else{
                    str = name;
                }
           
           switch (type) {                          
                   case 'DateTime':   
					res += '<m:DateRangeSelection class="sap-datetimepicker" name="' + str + '"  displayFormat="MM/dd/yyyy" valueFormat="MM/dd/yyyy" change="onFilterChange"/>';
					break;
				case 'Date':
					res += '<m:DateRangeSelection class="sap-datetimepicker" name="' + str + '"  displayFormat="MM/dd/yyyy" valueFormat="MM/dd/yyyy" change="onFilterChange"/>';
					break;
            	default:
					res += '<TextField placeholder="{i18n_Static>starterTableTemplate.dialog.inputPlaceholder}" change="onFilterChange" name="' + str + '"></TextField>';
					break;         
             }              
                 return res ;
       });
       
       Handlebars.registerHelper('getDefaultQueryType', function(defaultQuery){
            
            var res = "'" + defaultQuery.type + "'";    
                return res;
       });

        Handlebars.registerHelper('getRequiredInputs',function(fields,block ){
                var i,
                    res = [];
                    
            	for (i = 0; i<fields.length; i++) {
            	  	if(fields[i].required){
            	  	   res.push('view.byId("'+ fields[i].id + '")');
            	  	}
            	}
              return res.join(",");
           
        });
        
        Handlebars.registerHelper('getRequiredInputsForDetails',function(identification,block ){
                var i,
                    fields = identification.uiFields,
                    res = [];
                    
            	for (i = 0; i<fields.length; i++) {
            	  	if(fields[i].required && fields[i].isEnabled){
            	  	   res.push('view.byId("'+ fields[i].id + '")');
            	  	}
            	}
              return res.join(",");
           
        });
        
        Handlebars.registerHelper('getKey',function(name,func){
            
                var i,res = [];
                
                if (name === undefined){
                    res = func.arguments[0];
                    res += '@';
                    res += func.arguments[1];
                }else{
                    res = name;
                }
            	
              return res;
           
        });
        
       	Handlebars.registerHelper('detailsUpdatableMetadata',function(updatefieldsName,block){
       	     return     JSON.stringify(updatefieldsName);
       	});
       	
		Handlebars.registerHelper('createDataModel', function(fields,block ) {
		    
		        var i;
		        var data = {};
		    	for (i = 0; i < fields.length; i++) {
		    	    data[fields[i].fieldName] = null;
		    	}
		    	return JSON.stringify(data,null,"\r\t");
		    	
		});
		
		Handlebars.registerHelper('eachFields', function(fields,block ) {
			var res = [],i;
			var newline = block.fn(this);	
			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
			var verticalLayoutEnd = '</VBox>';
			for (i = 0; i < fields.length; i++) {
			    res.push(newline);
			    res.push(verticalLayoutStart);    
                res.push(newline);
			    res.push(fields[i].getLabel().getMarkup());
				res.push(newline);
			    res.push(fields[i].getMarkup());
				res.push(newline);
				res.push(verticalLayoutEnd); 
			}
			return res.join('');
		});
		
		Handlebars.registerHelper('createValueHelpMetaData', function(fields, block ) {
		        var i;
		        var data = {};
		    	for (i = 0; i < fields.length; i++) {
		    	    if (fields[i] instanceof ValueHelpField){
		    	        data[fields[i].id]=fields[i].metaData;
		    	        data[fields[i].id].fieldName = fields[i].fieldName;
		    	    }
		    	    if (fields[i] instanceof ComboBox){
		    	        data['combobox'] = data['combobox'] || {};
		    	        fields[i].metaData.id = fields[i].id;
		    	        if(fields[i].metaData.prefixKey){
		    	            delete fields[i].metaData.prefixKey;
		    	        }                        
    	    	        data['combobox'][fields[i].fieldName] = fields[i].metaData;
	    	        }
	    	        if (fields[i] instanceof ComplexFields) {
	    	            for (var j=0, l=fields[i].fields.length; j<l; j++) {
	    	                if (fields[i].fields[j] instanceof ComboBox) {
	    	                    data['combobox'] = data['combobox'] || {};
		    	                fields[i].fields[j].metaData.id = fields[i].fields[j].id;
		    	                if(fields[i].fields[j].metaData.prefixKey){
		    	                    delete fields[i].fields[j].metaData.prefixKey;
		    	                }    
    	    	                data['combobox'][fields[i].fields[j].fieldName] = fields[i].fields[j].metaData;
	    	                }
	    	            }
	    	        }
		    	}
		    	
		    	return JSON.stringify(data, null, "\t");
		});
		
		
		///for details:
		
		Handlebars.registerHelper('detailsValuesHelpMetaData', function(facets, identification, bo) {
		        
	        var i,j,c,l,
	            res = {},
	            facet,
	            uiFields;
	    	
	    	for (i = 0; i < facets.length; i++) {
	    	    facet = facets[i];
	    	    if(facet.boAnnotation !== bo){
	    	        uiFields = facet.uiFields;
	    	    }
	    	    else{
	    	         uiFields = identification.uiFields;
	    	    }
	    	    res[facet.boAnnotation] = {};
	    	   
	    	    for (j = 0; j < uiFields.length; j++) {
	    	        if ((uiFields[j] instanceof ValueHelpField) && uiFields[j].isEnabled ){
    	    	        res[facet.boAnnotation][uiFields[j].fieldName]= uiFields[j].metaData;
    	    	        res[facet.boAnnotation][uiFields[j].fieldName].fieldName = uiFields[j].fieldName;
	    	        }
	    	        if (uiFields[j] instanceof ComboBox){
    	    	        res[facet.boAnnotation].combobox = res[facet.boAnnotation].combobox || {};
    	    	        if(uiFields[j].metaData.prefixKey){
    	    	            delete uiFields[j].metaData.prefixKey;
    	    	        }
    	    	        res[facet.boAnnotation].combobox[uiFields[j].fieldName]= uiFields[j].metaData;
    	    	        res[facet.boAnnotation].combobox[uiFields[j].fieldName].enabled = uiFields[j].isEnabled;
	    	        }
	    	        
	    	        if (uiFields[j] instanceof ComplexFields) {
	    	            for ( c=0, l=uiFields[j].fields.length; c<l; c++) {
	    	                if ( uiFields[j].fields[c] instanceof ComboBox ) {
	    	                    res[facet.boAnnotation].combobox = res[facet.boAnnotation].combobox || {};
	    	                     if(uiFields[j].fields[c].metaData.prefixKey){
    	    	                    delete uiFields[j].fields[c].metaData.prefixKey;
    	    	                }
    	    	                res[facet.boAnnotation].combobox[uiFields[j].fields[c].fieldName]= uiFields[j].fields[c].metaData;
    	    	                res[facet.boAnnotation].combobox[uiFields[j].fields[c].fieldName].enabled = uiFields[j].fields[c].isEnabled;
	    	                }
	    	                else if ( uiFields[j].fields[c] instanceof ValueHelpField ){
    	    	                res[facet.boAnnotation][uiFields[j].fields[c].fieldName] = uiFields[j].fields[c].metaData;
    	    	                res[facet.boAnnotation][uiFields[j].fields[c].fieldName].enabled = uiFields[j].fields[c].isEnabled;
	    	                }
	    	            }
	    	        }
	    	    }
	    	    
	    	    var updateUiFields = facet.updateUiFields;
	    	    if(updateUiFields){
    	    	    for (j = 0; j < updateUiFields.length; j++) {
    	    	        if ((updateUiFields[j] instanceof ValueHelpField) && !res[facet.boAnnotation][updateUiFields[j].fieldName] ){
        	    	        res[facet.boAnnotation][updateUiFields[j].fieldName]= updateUiFields[j].metaData;
        	    	        res[facet.boAnnotation][updateUiFields[j].fieldName].fieldName = updateUiFields[j].fieldName;
    	    	        }
    	    	        if (updateUiFields[j] instanceof ComboBox && ( !res[facet.boAnnotation].combobox || (res[facet.boAnnotation].combobox && !res[facet.boAnnotation].combobox[updateUiFields[j].fieldName]))){
    					    if(updateUiFields[j].metaData.prefixKey){
    	    	                delete updateUiFields[j].metaData.prefixKey;
    	    	            }
        	    	        res[facet.boAnnotation].combobox = res[facet.boAnnotation].combobox || {};
        	    	        res[facet.boAnnotation].combobox[updateUiFields[j].fieldName]= updateUiFields[j].metaData;
        	    	        res[facet.boAnnotation].combobox[updateUiFields[j].fieldName].enabled = updateUiFields[j].isEnabled;
    	    	        }
    	    	        
    	    	        if (updateUiFields[j] instanceof ComplexFields) {
    	    	            for ( c=0, l=updateUiFields[j].fields.length; c<l; c++) {
    	    	                if (updateUiFields[j].fields[c] instanceof ComboBox && (!res[facet.boAnnotation].combobox ||(res[facet.boAnnotation].combobox && !res[facet.boAnnotation].combobox[updateUiFields[j].fields[c].fieldName]))) {
    	    	                    res[facet.boAnnotation].combobox = res[facet.boAnnotation].combobox || {};
    	    	                    if(updateUiFields[j].fields[c].metaData.prefixKey){
    	    	                        delete updateUiFields[j].fields[c].metaData.prefixKey;
    	    	                    }
        	    	                res[facet.boAnnotation].combobox[updateUiFields[j].fields[c].fieldName]= updateUiFields[j].fields[c].metaData; 
        	    	                res[facet.boAnnotation].combobox[updateUiFields[j].fields[c].fieldName].enabled = updateUiFields[j].fields[c].isEnabled;
    	    	                } else if(updateUiFields[j].fields[c] instanceof ValueHelpField  &&  ! res[facet.boAnnotation][updateUiFields[j].fields[c].fieldName]){
    	    	                     res[facet.boAnnotation][updateUiFields[j].fields[c].fieldName]= updateUiFields[j].fields[c].metaData; 
        	    	                 res[facet.boAnnotation][updateUiFields[j].fields[c].fieldName].enabled = updateUiFields[j].fields[c].isEnabled;
    	    	              
    	    	                }
    	    	            }
    	    	        }
                    }
	    	    }
	    	    
	    	}
	    	
	    	return JSON.stringify(res, null, "\t");

    	});
        
		Handlebars.registerHelper('facetsValuesHelpMetaData', function(facets, bo) {
		        
	        var i, j;
	        var data = {},
	            fields, facet;
		        
	        for(j = 0; j < facets.length; j++){
	            
	            facet = facets[j];

                if (facet.boAnnotation !== bo) {	            
                    
    	            data[facet.boAnnotation] = {};
    	            fields = facet.uiFields;
                    
    		    	for (i = 0; i < fields.length; i++) {
    		    	    
    		    	    var field = fields[i];
    
    		    	    if (field instanceof ValueHelpField){
    		    	        
            		    	data[facet.boAnnotation] = data[facet.boAnnotation] || {};
                            
                            data[facet.boAnnotation][field.id] = field.metaData;
    		    	        data[facet.boAnnotation][field.id].fieldName = field.fieldName;
    		    	    }
    		    	}
                }
            }

	    	return JSON.stringify(data, null, "\t");
    	});
		
	    Handlebars.registerHelper('readSubObject', function(facets,bo,block){
	        var res = [],i,
	        strReadSubObject = 'this.readSubObject(oDataServiceModel, collectionApi, \"BO_ANNOTATION\", oJsonModel, counter);',
	        newline = block.fn(this);
	        for (i = 0; i < facets.length; i++) {
	            if(facets[i].boAnnotation !== bo){
	                res.push(strReadSubObject.replace("BO_ANNOTATION",facets[i].boAnnotation));
	                res.push(newline);	
	            }
	        }
           return res.join('');
         });
         
		 Handlebars.registerHelper('toLowerCase', function(str){
                     return str.toLowerCase();
         });
		
		 Handlebars.registerHelper('addStatus', function(status,bo) {
                    var res = '';
                        if (typeof status !== 'undefined' ){
                            res += '<Label text="Status:{ObjectPageModel>/'+ bo + '/Status}" class="detailsToolbarButton"/>';
                        }
                        
                     return res;
         });
         
        Handlebars.registerHelper('addRecordName', function(arr,bo){
                     var res;
                     for (var i =0; i < arr.length; i++){
                        if (arr[i].title === "Name" || arr[i].title === "Subject" ){ 
                            res = '{ObjectPageModel>/'+ bo + '/' + arr[i].path + '}';
                            return res;
                        }
                     }
                     
                     res = '{ObjectPageModel>/'+ bo + '/' + arr[0].path + '}';
                     return res;
        });  
                 
         Handlebars.registerHelper('addIcon', function(boId) {
            var res = '';
            switch (boId) {
                    case "Task":
                        res += '<core:Icon src="sap-icon://task" class="toolbarImage"></core:Icon>';
                        break;
                    case "Appointment":
                        res += '<core:Icon src="sap-icon://appointment" class="toolbarImage"></core:Icon>';
                        break;
                    case "Lead":
                        res += '<core:Icon src="sap-icon://lead" class="toolbarImage"></core:Icon>';
                        break;
                    case "Opportunity":
                        res += '<core:Icon src="sap-icon://tools-opportunity" class="toolbarImage"></core:Icon>';
                        break;
                    case "Partner":
                        res += '<core:Icon src="sap-icon://company-view" class="toolbarImage"></core:Icon>';
                        break;
                    case "PartnerContact":
                        res += '<core:Icon src="sap-icon://my-view" class="toolbarImage"></core:Icon>';
                        break;
                    case "ServiceRequest":
                        res += '<core:Icon src="sap-icon://crm-service-manager" class="toolbarImage"></core:Icon>';
                        break;
                    case "DealRegistration":
                        res += '<core:Icon src="sap-icon://decision" class="toolbarImage"></core:Icon>';
                        break;
                    default :
                    res += '';
                        break;
                }
                
             return res;
         });
     
            Handlebars.registerHelper('eachFacetColumns', function(cols, block){
                    var  calculatedName =[],col,dataBindingDefined,argsLength,
                    i,
                    space = ' ',
                    dataBindingPrefix = '{',
                    dataBindingSuffix= '}',
                    prefixLabel = '<Text text="',
                    suffixLabel = '"/>',
                    objectModelStr = 'ObjectPageModel>',
                    startCell = '<cells>', 
                    endCell = '</cells>',
                    path = '{path:\'ObjectPageModel>',//TODO /?
                    formatDate = '\', formatter:\'.formatDate\'}',
					formatTimeDate = '\', formatter:\'.formatTimeDate\'}',
                    newline = block.fn(this);
                    
                    for(i = 0; i < cols.length; ++i) {
                        col = cols[i];

                        if (cols[i].titleKey.match(/Attachment/)) {
                            if (col.type === 'Link' || col.type === 'Document') {
                                prefixLabel = '<Link text="';
                                suffixLabel = '" press="handle' + col.action + '"></Link>';
                            }
                            if (col.name === 'CategoryCode') {
                                col.name += 'Text';
                            }
                        }
                        calculatedName.push(startCell);
                        calculatedName.push(newline);
                        calculatedName.push(prefixLabel);
                        
                        switch (col.type) {
                            case 'Date': 
                                calculatedName.push(path);
                                calculatedName.push(col.name);
                                calculatedName.push(formatDate);
                                break;
                            case 'DateTime': 
                                calculatedName.push(path);
                                calculatedName.push(col.name);
                                calculatedName.push(formatTimeDate);
                                break;
                            default:
                                if(typeof( col.name) !== "undefined") {
                                    calculatedName.push("{");
                                    calculatedName.push(objectModelStr);
                                    if(typeof (col.alternativePath)  !== "undefined"){
                                        calculatedName.push(col.alternativePath);
                                    }
                                    else{
                                        calculatedName.push(col.name);
                                    }
                                    calculatedName.push("}");
                                } else {
                                    dataBindingDefined = false;
                                    
                                    if(typeof col.func !== "undefined") {
                                        if(col.func.funcName === 'odata.concat' && col.func.arguments.length > 0 ){
                                            argsLength = col.func.arguments.length;
                                            for(j = 0; j < argsLength; j++){
                                                calculatedName.push( dataBindingPrefix);
                                                calculatedName.push(objectModelStr);
                                                calculatedName.push( col.func.arguments[j]);
                                                calculatedName.push(dataBindingSuffix);
                                                if(j < (argsLength - 1) ){
                                                    calculatedName.push(space);
                                                }
                                            }
                                            dataBindingDefined = true;
            				            }
        				            }
        				            
                                    if(!dataBindingDefined){
                                        calculatedName.push('Unknown annotation');
                				    }
                                } 
                                
                                break;
                        }
                        
                        calculatedName.push(suffixLabel);
                        calculatedName.push(newline);
                        calculatedName.push(endCell);
                        calculatedName.push(newline);
                    }
                     
                    return calculatedName.join('');
            });  
            
            Handlebars.registerHelper('eachCreateFields', function(fields,block ) {
    			var res = [],i;
    			var newline = block.fn(this);	
    			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
    			var verticalLayoutEnd = '</VBox>';
    			for (i = 0; i < fields.length; i++) {
    			    res.push(newline);
    			    res.push(verticalLayoutStart);    
                    res.push(newline);
    			    res.push(fields[i].getLabel().getMarkup());
    				res.push(newline);
    			    res.push(fields[i].getMarkup());
    				res.push(newline);
    				res.push(verticalLayoutEnd); 
    			}
    			return res.join('');
    		});
    		
    		Handlebars.registerHelper('eachFacetDialog', function(facet,block ) {
		        var fields=facet.uiFields;
    			var res = [],i;
    			var newline = block.fn(this);	
    			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
    			var verticalLayoutEnd = '</VBox>';
    			for (i = 0; i < fields.length; i++) {
    			    res.push(newline);
    			    res.push(verticalLayoutStart);    
                    res.push(newline);
    			    res.push(fields[i].getLabel().getMarkup());
    				res.push(newline);
    			    res.push(fields[i].getMarkup());
    				res.push(newline);
    				res.push(verticalLayoutEnd); 
    			}
    			return res.join('');
    		});
    		
    		Handlebars.registerHelper('eachUpdateFacetDialog', function(facet,block ) {
		        var fields=facet.updateUiFields;
    			var res = [],i;
    			var newline = block.fn(this);	
    			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
    			var verticalLayoutEnd = '</VBox>';
    			for (i = 0; i < fields.length; i++) {
    			    res.push(newline);
    			    res.push(verticalLayoutStart);    
                    res.push(newline);
    			    res.push(fields[i].getLabel().getMarkup());
    				res.push(newline);
    				if (ComboBox && ((fields[i] instanceof ComboBox) || (fields[i] instanceof ComplexFields))) {
    				    res.push(fields[i].getMarkupWithSelectedValue());
    				    //res.push(fields[i].getMarkup());
    				}
    	            else {
    			        res.push(fields[i].getMarkup());
    				}
    				res.push(newline);
    				res.push(verticalLayoutEnd); 
    			}
    			return res.join('');
    		});
            
            Handlebars.registerHelper('createDetailsDataModel', function(facets){
		    
		        var i,j,k;
		        var data = {},fields,complexField;
		        for(j = 0; j < facets.length; j++){
		             data[facets[j].boAnnotation] = {};
		            
		             fields = facets[j].uiFields;
		            var fieldName,field;
    		    	for (i = 0; i < fields.length; i++) {
    		    	    field = fields[i];
    		    	    fieldName =field.fieldName;
    		    	    
    		    	    if(typeof  fieldName !== "undefined" && fieldName !== "" ){
    		    	        data[facets[j].boAnnotation][fieldName] = null;
    		    	    }
    		    	    else{
    		    	        if(field.fields && field.fields.length > 0 ){
    		    	            for(k = 0; k < field.fields.length; k++){
    		    	                complexField = field.fields[k];
    		    	                data[facets[j].boAnnotation][complexField.fieldName] = null;
    		    	            }
    		    	        }
    		    	    }
    		    	   // data[facets[j].boAnnotation][fields[i].fieldName] = null;
    		    	}

                }
		    	return JSON.stringify(data,null,"\t");
	    	});
       
	    	Handlebars.registerHelper('eachFieldsDetails', function(identification, bo, block ) {
    			var res = [],
    		
    				i,j,dataBindingDefined;
    			var newline = block.fn(this);	
    			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
    			var verticalLayoutEnd = '</VBox>';
    			var dataBindingPrefix='{ObjectPageModel>/'+ bo +'/';
    			var dataBindingSuffix="}";
    			var space =' ';
    			var labels = identification.boIdentification;
    		
    			 
    			for (i = 0; i < labels.length; i++) {
    			    res.push(newline);
    			    res.push(verticalLayoutStart);    
                    res.push(newline);
                    
    				res.push('<Label text="');
    				res.push('{' + utils.i18nModelName + '>' + labels[i].titleKey + '}');
    				res.push('">');
    	            res.push(newline);
    				res.push('</Label>');
    				
    				res.push(newline);
    				
    				var text = '';
    				
    				if (ComboBox && identification.uiFields[i] instanceof ComboBox) {
    				    text = 'Text';
    				}
    				
    				res.push('<Text ');
    				res.push( 'text="');
    				if (typeof labels[i].path !== "undefined") {
    				    switch (labels[i].type) {
    				        case 'DateTime':
                                res.push('{path: \'' + 'ObjectPageModel>/'+ bo +'/');
                                res.push(labels[i].path);
                                res.push('\', formatter:\'.formatTimeDate\'}');
                                break;
                            case 'Date':
                                res.push('{path: \'' + 'ObjectPageModel>/'+ bo +'/');
                                res.push(labels[i].path);
                                res.push('\', formatter:\'.formatDate\'}');
                                break;
                            default:
                                //Label
                                res.push( dataBindingPrefix);
            				    res.push(labels[i].path + text);
                				res.push(dataBindingSuffix);
                				res.push('" tooltip="' + dataBindingPrefix + labels[i].path + text + dataBindingSuffix)
                                break;  
    				    }
    				    
    				} else {
    				     dataBindingDefined=false;
    				     if( typeof labels[i].func !== "undefined"){
    				         if(labels[i].func.funcName === 'odata.concat' && labels[i].func.arguments.length > 0 ){
    				             //res.push( 'text="');
				                var argsLength = labels[i].func.arguments.length;
    				            for(j = 0; j < argsLength; j++){
        				            res.push(dataBindingPrefix);
        				            res.push(labels[i].func.arguments[j]);
        				            res.push(dataBindingSuffix);
    				                if(j < (argsLength - 1)) {
    				                    res.push(space);
        				            }
    				            }
        				        dataBindingDefined=true;
				            }
    				     }
    				     
    				     if (!dataBindingDefined){
    				         res.push( 'Unknown annotation');
    				     }
    				}
    				res.push('">');
    				res.push(newline);
    				res.push('</Text>');
    				res.push(verticalLayoutEnd); 
    
    			}
    			
			    return res.join('');
	    	});
		
		Handlebars.registerHelper('eachFieldsEditDetails', function(identification,bo,block ) {
			var res = [],i;
			var newline = block.fn(this);	
			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
			var verticalLayoutEnd = '</VBox>';
			var fields = identification.uiFields,
			    bindingPrefix = 'EditObjectPageModel>/'+ bo;
			
			for (i = 0; i < fields.length; i++) {
			    res.push(newline);
			    res.push(verticalLayoutStart);    
                res.push(newline);
			    res.push(fields[i].getLabel().getMarkup());
				res.push(newline);
			    res.push(fields[i].getBindedMarkup(bindingPrefix));
				res.push(newline);
				res.push(verticalLayoutEnd); 
			}
			return res.join('');
    			
/*    			
    			var res = [],
    		
    				i,j,dataBindingDefined;
    			var newline = block.fn(this);	
    			var verticalLayoutStart = '<VBox><layoutData><l:GridData span="L4 M6 S12" /></layoutData>';
    			var verticalLayoutEnd = '</VBox>';
    			var dataBindingPrefix='{ObjectPageModel>/'+ bo + '/';
    			var dataBindingSuffix="}";
    			var space =' ';
    			var labels = identification.boIdentification;
    			 
    			for (i = 0; i < labels.length; i++) {
    			    res.push(newline);
    			    res.push(verticalLayoutStart);    
                    res.push(newline);
    				res.push('<Label text="');
    				res.push('{' + utils.i18nModelName + '>' + labels[i].titleKey + '}');
    				res.push('">');
    	            res.push(newline);
    				res.push('</Label>');
    				res.push(newline);
    				res.push('<Input ');
    				res.push( 'value="');
    				if(typeof labels[i].path !== "undefined"){
    				    res.push( dataBindingPrefix);
    				    res.push( labels[i].path);
        				res.push(dataBindingSuffix);
    				}
    				else{
    				     dataBindingDefined=false;
    				     if( typeof labels[i].func !== "undefined"){
    				         if(labels[i].func.funcName === 'odata.concat' && labels[i].func.arguments.length > 0 ){
    				             //res.push( 'text="');
    				             var argsLength = labels[i].func.arguments.length;
        				         for(j = 0; j < argsLength; j++){
        				            res.push( dataBindingPrefix);
        				            res.push( labels[i].func.arguments[j]);
        				            res.push(dataBindingSuffix);
        				             if(j < (argsLength - 1) ){
            				                res.push(space);
            				        }
        				         }
        				         dataBindingDefined=true;
    				         }
    				     }
    				     if(!dataBindingDefined){
    				         //res.push( 'text="Unknown annotation');
    				         res.push( 'Unknown annotation');
    				     }
    				     
    				}
    				res.push('">');
    				res.push(newline);
    				res.push('</Input>');
    				res.push(verticalLayoutEnd); 
    
    			}
    			
			    return res.join(''); */
	    	});
		
	    	//for table
	    	
	    	
	   Handlebars.registerHelper('eachDetailsColumns', function(cols, block){
                
                 var res = [],
                      i,
                      col,
                      openingColumn = '<Column',
                      openingColumnClose = '>',
                      closingColumn = '</Column>',
                      prefixLabel = '<Text text="{' + utils.i18nModelName  + '>',
                      suffixLabel = '}"/>',
                      newline = block.fn(this),
                      minSreen =' minScreenWidth="Tablet"',
                      demandPopin =' demandPopin="true"';
                      
                      
                 for(i = 0; i < cols.length; ++i) {
                col = cols[i];
                
                res.push(openingColumn);
                
                if(i > 1) {
                     res.push(minSreen);
                     res.push(demandPopin);
                }
                res.push(openingColumnClose);
                res.push(newline);
                
                res.push(prefixLabel);
                res.push(col.titleKey);
                res.push(suffixLabel);
                res.push(newline);
                
                res.push(closingColumn);
                res.push(newline);
                 }
                      
                 return res.join('');  
              });  	
	    	
	    	
	    	
	  Handlebars.registerHelper('eachColumns', function(cols, block){
                
                  var res = [],
                      i,
                      col,
                      openingColumn = '<m:Column',
                      openingColumnClose = '>',
                      closingColumn = '</m:Column>',
                      prefixLabel = '<m:Label text="{' + utils.i18nModelName  + '>',
                      tooltipPrefix ='}" tooltip="{' + utils.i18nModelName + '>',
                      suffixLabel = '}"/>',
                      newline = block.fn(this),
                      minSreen =' minScreenWidth="Tablet"',
                      demandPopin =' demandPopin="true"';
                      
                      
                 for(i = 0; i < cols.length; ++i) {
                col = cols[i];
                
                res.push(openingColumn);
                
                if(i > 1) {
                     res.push(minSreen);
                     res.push(demandPopin);
                }
                res.push(openingColumnClose);
                res.push(newline);
                
                res.push(prefixLabel);
                res.push(col.titleKey);
                res.push(tooltipPrefix);
                res.push(col.titleKey);
                res.push(suffixLabel);
                res.push(newline);
                
                res.push(closingColumn);
                res.push(newline);
                 }
                      
                 return res.join('');  
              });


	    Handlebars.registerHelper('getQueryNameKeys', function(queries, block){
	        var res = [],
	        query,
	        i =0,
	        openingItem = '<core:Item key="',
	        textPrefix ='" text="{' + utils.i18nAnnotationExtensionModelName + '>',
	        suffixLabel = '}"/>',
            newline = block.fn(this);
	        for (i=0; queries.length > i; i++){
	            //res += '<core:Item key="{' +utils.i18nAnnotationExtensionModelName + '>' +  queries[i].titleKey + '}"  text="{' + utils.i18nAnnotationExtensionModelName + '>'+ queries[i].titleKey + '}" /> \n'
	            query = queries[i];
	            res.push(openingItem);
	            //res.push(newline);
	            res.push(query.titleKey);
	            res.push(textPrefix);
	            res.push(query.titleKey);
	            res.push(suffixLabel);
	            res.push(newline);
	        }
	        return res.join('');
	        
	    });
	    
	    Handlebars.registerHelper('getBoActionKeys', function(BOactions, block){
	        var res = [],
	        action,
	        i =0,
	        j=0,
	        openingItem = '<Button text="',
	        actionKeyPrefix ='{' + utils.i18nAnnotationExtensionModelName + '>',
	        pressPrefix ='}" press="actionPressed">',
	        customDataItem = '<customData>',
	        coreCustomData = '<core:CustomData key="',
	        valuePrefix = '" value="',
	        valueSuffix = '" />',
	        funcNameItem = 'funcName',
	        objectItem = 'ObjectID',
	        customDataItemSuffix = '</customData>',
	        openingItemSuffix = '</Button>',
	        
            newline = block.fn(this);
            
	        for (i=0; BOactions.length > i; i++){
	            //res += '<core:Item key="{' +utils.i18nAnnotationExtensionModelName + '>' +  queries[i].titleKey + '}"  text="{' + utils.i18nAnnotationExtensionModelName + '>'+ queries[i].titleKey + '}" /> \n'
	            action = BOactions[i];
	            res.push(openingItem);
	            res.push(actionKeyPrefix);
	            //res.push(newline);
	            res.push(action.titleKey);
	            res.push(pressPrefix);
	            res.push(newline);
	            res.push(customDataItem);
	            res.push(newline);
	            res.push(coreCustomData);
	            res.push(funcNameItem);
	            res.push(valuePrefix);
	            res.push(action.funcName);
	            res.push(valueSuffix);
	            res.push(newline);
	            for (j=0; action.parameters.length > j; j++){
	                res.push(coreCustomData);
    	            res.push(action.parameters[j].key);
    	            res.push(valuePrefix);
    	            res.push(action.parameters[j].value);
    	            res.push(valueSuffix);
    	            res.push(newline);
	            }
	            
	            res.push(customDataItemSuffix);
	            res.push(newline);
	            res.push(openingItemSuffix);
	            res.push(newline);
	            
	        }
	        return res.join('');
	    });
	    
	    Handlebars.registerHelper('getDefaultQueryNameKey', function(queries, block){
	        var res = '';
	        var i =0;
	        for (i=0; queries.length > i; i++){
	            if (queries[i].isDefault === true ){
	                res += queries[i].titleKey;
	              }
            }
	        return res;
	        
	    });
	    
	    
	     
		Handlebars.registerHelper('eachCells', function(cols, block){
                     var res = [],
                         i,j,
                         colName,
                         dataBindingDefined,
                         prefixLink = '<m:Link text="',
                         suffixLink = '" press="navigateToDetails">',
                         closingLink = '</m:Link>',
                         openingCustomData = '<m:customData>',
                         closingCustomData = '</m:customData>',
                         prefixCustomData = '<core:CustomData key="',
                         suffixCustomData = '" />',
                         actionKey = 'action',
                         targetObjectKey = 'targetObject',
                         customDataValue = '" value="',
                         prefixLabel = '<m:Label text="',
                         suffixLabel = '"/>',
                         path = '{path:\'',
                         formatDate = '\', formatter:\'.formatDate\'}',
                         formatTimeDate = '\', formatter:\'.formatTimeDate\'}',
                         dataBindingPrefix ='{',
                         dataBindingSuffix='}',
                         tooltipPrefix ='" tooltip="',
                         newline = block.fn(this),
                         space =' ',
                         calculatedName,
                         argsLength,
                         col;
                        
                     
                     for(i = 0; i < cols.length; ++i) {
                        col = cols[i];
                        calculatedName = [];
                         
                        if(typeof( col.name) !== "undefined") {
                             calculatedName.push("{");
                             calculatedName.push(col.name);
                             calculatedName.push("}");
                        } else {
                            dataBindingDefined=false;
                            
				            if(typeof col.func !== "undefined") {
				                if(col.func.funcName === 'odata.concat' && col.func.arguments.length > 0 ){
    				                argsLength = col.func.arguments.length;
            				        for(j = 0; j < argsLength; j++){
            				            calculatedName.push( dataBindingPrefix);
            				            calculatedName.push( col.func.arguments[j]);
            				            calculatedName.push(dataBindingSuffix);
            				            if(j < (argsLength - 1) ){
            				                calculatedName.push(space);
            				            }
            				        }
            				         
        				            dataBindingDefined=true;
    				            }
				            }
				            
        				    if(!dataBindingDefined){
        				         calculatedName.push('Unknown annotation');
        				    }
                        }
                        
                        colName = calculatedName.join('');
                        
                        res.push(newline);
                        switch (col.type) {
                            
                            case 'Link':   
                                res.push(prefixLink);
                                res.push(colName);
                                res.push(tooltipPrefix);
                                res.push(colName);
                                res.push(suffixLink);
                                res.push(newline);
                                //custom data
                                res.push(openingCustomData);
                                res.push(newline);
                                    //action
                                    res.push(prefixCustomData);
                                    res.push(actionKey);
                                    res.push(customDataValue);
                                    res.push(col.action);
                                    res.push(suffixCustomData);
                                    res.push(newline);
                                    //targetObject
                                    res.push(prefixCustomData);
                                    res.push(targetObjectKey);
                                    res.push(customDataValue);
                                    res.push(col.targetObject);
                                    res.push(suffixCustomData);
                                    res.push(newline);
                                res.push(closingCustomData);
                                res.push(newline);
                                res.push(closingLink);
                                break;
                                
                            case 'Date': 
                                res.push(prefixLabel);
                                res.push(path);
                                res.push(col.name);
                                res.push(formatDate);
                                res.push(tooltipPrefix);
                                res.push(path);
                                res.push(col.name);
                                res.push(formatDate);
                                res.push(suffixLabel);
                                break;
                                
                            case 'DateTime': 
                                res.push(prefixLabel);
                                res.push(path);
                                res.push(col.name);
                                res.push(formatTimeDate);
                                res.push(tooltipPrefix);
                                res.push(path);
                                res.push(col.name);
                                res.push(formatTimeDate);
                                res.push(suffixLabel);
                                break;  
                                
                            default:
                                //Label
                                res.push(prefixLabel);
                                res.push(colName);
                                res.push(tooltipPrefix);
                                res.push(colName);
                                res.push(suffixLabel);
                                break;    
                        }
                     }
                     
                     return res.join('');
                });                
                 
                Handlebars.registerHelper('getQueries', function(queries){
                     var res = 'queries: [\n',
                         i,j,
                         counter = 0,
                         operator = 'EQ',
                         query,
                         queryId,
                         line = '',
                         functionImportLine = '',
                         parametersArray = [],
                         functionImportArray = [],
                         filterArray = [],
                         filter = '';
                       //  queryUrl = "c4c/sap/c4c/odata/v1/pcmportal";
                    //  queries = [{name: "all", key : "" , isDefault : true}];
                        
                     for(i = 0; i < queries.length; i++) {
                         query = queries[i];
                        //  queryId = query.isDefault ? "defaultQuery" : ("queryId" + ++counter);
                         if(query.type === "Parameter"){
                            parametersArray.push(query);
                        }else {
                            functionImportArray.push(query);
                        }
                     }
                     for(i = 0; i < parametersArray.length; i++){
                         query = parametersArray[i];
                         filter = "[";
                         for( j = 0; j <  query.parameters.length; j++){
                                 filter += '{key :"' + query.parameters[j].key + '", operator :  "' + operator + '" ,  value :"\'' +query.parameters[j].value + '\'"}' + (j + 1 === query.parameters.length ? '\n' : ',\n');
                             }
                         filter += "]";
                         line +=  '{name : "' + query.titleKey + '", type: "' + query.type + '", isDefault: "' + query.isDefault + '", filter : ' + filter + '}' + (i + 1 === parametersArray.length ? '\n' : ',\n');
                     }
                     res += line;
                     if (functionImportArray.length === 0){
                         res += '\n';
                     }else {
                         res += ',\n';
                     }
                    //  line = '';
                     for(i = 0; i < functionImportArray.length; i++){
                         query = functionImportArray[i];
                         filter = "[";
                         for( j = 0; j <  query.parameters.length; j++){
                                //  filter += '{key :"' + query.parameters[j].key + '", operator :  "' + operator + '" ,  value :"' +query.parameters[j].value + '"}' + (j + 1 === query.parameters.length ? '\n' : ',\n');
                            filter += query.parameters[j].key  + '=' + query.parameters[j].value + (j + 1 === query.parameters.length ? '\n' : ',\n');
                             
                         }
                         
                         filter += "]";
                         functionImportLine +=  '{name : "'  + query.titleKey + '", funcName : "' + query.funcName + '", type: "' + query.type + '", isDefault: "' + query.isDefault + '", filter : ' + filter + '}' + (i + 1 === functionImportArray.length ? '\n' : ',\n');
                     }
                     res += functionImportLine;
                     res += ']';
                     
                     return res;
                 });
	},
   
   createFacetsDialogs : function (templateZip, facets, selectedBO, appPath){
		appPath = appPath ? appPath + "/" : "";
        var i,
			tmplFile,
			newName,
			fileContent,	
			tmplAddDialogName = appPath + "view/dialog/facetAdd.fragment.xml.tmpl",
			tmplUpadateDialogName = appPath + "view/dialog/facetUpdate.fragment.xml.tmpl",
			interactionLogName = appPath + "view/interactionLog.fragment.xml.tmpl",       
			interactionLogExist = false;
        
        for(i = 0; i < facets.length; i++){            
            if(facets[i].annotationTerm === "UI.Identification" || facets[i].annotationTerm === "UI.InteractionLog"){
                facets[i].boParentCollection = selectedBO;
                if (facets[i].annotationTerm === "UI.InteractionLog") {
                    interactionLogExist = true;  
                }
            } else {
                if(facets[i].annotationTerm === "UI.LineItem" && facets[i].isCreatable){
                    //copy Create facet 
                    tmplFile = templateZip.files[tmplAddDialogName];
                    newName = tmplAddDialogName.replace("facetAdd",facets[i].boAnnotation + "Add");
                    fileContent = tmplFile.asText().replace(/FACET_INDEX/g,i);
                    templateZip.file(newName,fileContent,tmplFile.options);
                }
               if(facets[i].annotationTerm === "UI.LineItem" && facets[i].isUpdatable){
                    //copy Update facet
                    tmplFile = templateZip.files[tmplUpadateDialogName];
                    newName = tmplUpadateDialogName.replace("facetUpdate",facets[i].boAnnotation + "Update");
                    fileContent = tmplFile.asText().replace(/FACET_INDEX/g,i);
                    templateZip.file(newName,fileContent,tmplFile.options);
                } 
            }
        }
        
		//remove files
        templateZip.remove(tmplAddDialogName);
        templateZip.remove(tmplUpadateDialogName);
        if (!interactionLogExist) {
            templateZip.remove(interactionLogName);
        }
        
        return templateZip;
    },	
    
    getFormatterConnections: function(aDestinations) {
    		var aFormattedDestinations = [],
    		    aFilteredDestination = [],
    		    CATALOG_GENERIC = "odata_gen";
    		
    		if (aDestinations) {
    			aFilteredDestination = aDestinations.filter(function(oValue) {
    				return  oValue.wattUsage === CATALOG_GENERIC;
    			});
    			
    			aFilteredDestination.forEach(function(oConnection) {
    				var sUrl = null;
    				sUrl = oConnection.url;
    				aFormattedDestinations.push({
    					url: sUrl,
    					name: oConnection.description,
    					type: oConnection.wattUsage,
    					destination: oConnection
    				});
    			});
    		}
    		
    		return aFormattedDestinations;
	},
	
	createCurrentBOModel:function(bo){
	     var currentBO = {
	        //uiFields: uiFields,
	        boId:bo.id, 
	        titleName: bo.titleName, 
	        titleSingularName: bo.titleSingularName, 
	        selectedBO: bo.name
	    };
	    return currentBO;
	},
	
	createModelForCreateTemplate:function(bo,parser,currentBO){
	    var uiFields = uiUtils.getUiFields(bo, parser);
	    if(typeof currentBO === "undefined"){
	        currentBO = utils.createCurrentBOModel(bo);
	    }
	   /* var currentBO = {};
	    var currentBO = {
	        //uiFields: uiFields,
	        boId:bo.id, 
	        titleName: bo.titleName, 
	        titleSingularName: bo.titleSingularName, 
	        selectedBO: bo.name
	    };*/
	    currentBO.create = {uiFields : uiFields};
	    return currentBO;
	},
	
	createModelForTableTemplate:function(bo,parser,currentBO){
	     if(typeof currentBO === "undefined"){
	        currentBO = utils.createCurrentBOModel(bo);
	    }
	    var selectedBoAnnotation = parser.getBusinessObject(bo.id);
        var selectedBOTable = parser.getTableColumns(parser,selectedBoAnnotation);
        var selectedBOQueries = parser.getQueries(bo.id);
        var defaultQuery ="";
        
        if (selectedBOQueries.length  === 0){
                selectedBOQueries.push({titleKey: 'CHP.Default.UI.Query.UI.Filter.All', type: 'Parameter', parameters: [], isDefault: true});
                defaultQuery = {titleKey: 'CHP.Default.UI.Query.UI.Filter.All', type: 'Parameter', parameters: [], isDefault: true};
        }else{
            for (var i = 0; i < selectedBOQueries.length; i++) {
		        if (selectedBOQueries[i].isDefault === true) {
			        defaultQuery = selectedBOQueries[i];
    		    } 
    		}
        }
        
        currentBO.queries = selectedBOQueries;
        currentBO.columns = selectedBOTable.columns;
	    currentBO.defaultQuery = defaultQuery;
	    
	    return currentBO;
	},
	createModelForDetailsTemplate : function(bo,parser,currentBO) {
	    if(typeof currentBO === "undefined"){
	        currentBO = utils.createCurrentBOModel(bo);
	    }
	    
	    var selectedBoAnnotation = parser.getBusinessObject(bo.id),
                headerInfo = parser.getHeaderInfo(selectedBoAnnotation),
                facetsInfo = parser.getFacetsInfo(selectedBoAnnotation),
                identificationInfo = parser.getIdentificationInfo(selectedBoAnnotation),
                uiFieldsForIdentification = uiUtils.getUiFields(bo, parser,identificationInfo,true),
                boActions = parser.getBOAction(bo.id),
                i,
                facetUIFields;
                var updatableFieldsName = parser.getUpdatableFieldsName(bo.id);
              
        for(i = 0;i < facetsInfo.length; i++){
            if (facetsInfo[i].annotationTerm === "UI.LineItem"){
                facetUIFields = uiUtils.getUiFieldsForUILine(facetsInfo[i].boAnnotation,parser,facetsInfo[i].childTable.columns,false, facetsInfo[i].isAttachable);
                facetsInfo[i].updateUiFields = uiUtils.getUiFieldsForUILine(facetsInfo[i].boAnnotation,parser,facetsInfo[i].childTable.columns,true);
            } else if (facetsInfo[i].annotationTerm === "UI.InteractionLog") {
                //Only one interactionLog facet
                currentBO.interactionLog = {data: facetsInfo[i].childInteractionLog, boAnnotation: facetsInfo[i].boAnnotation};
            } else {
                facetUIFields = uiUtils.getUiFields({id:facetsInfo[i].boAnnotation},parser,identificationInfo,true);
                facetsInfo[i].isFacetEditable = uiUtils.isFacetEditable(facetUIFields);
            }
            
            facetsInfo[i].uiFields = facetUIFields;
            
        }
        
        currentBO.updatableFieldsName = updatableFieldsName;
        currentBO.header = headerInfo;
        currentBO.facets = facetsInfo;
        currentBO.identification = {boIdentification:identificationInfo,uiFields:uiFieldsForIdentification};
        currentBO.boActions = boActions;
	    
	    return currentBO;
	},
	
	addDataToSimpleModelTemplate : function(currentBO,model){
	    //currentBO.applicationPath = model.applicationPath;
	     currentBO.applicationPath = utils.getRelativeApplicationPath(model.componentPath , model.pathToDestination);
	},
	getRelativeApplicationPath : function(componentPath,appPath){
            var index = appPath.length;
            var applicationPath = componentPath.substring(index);
            return applicationPath;
    },
   
	 getBoForMassCreator : function(boName,parser){
        var boAnnotation =parser.getBusinessObject(boName);
        var headerInfo =parser.getHeaderInfo(boAnnotation);
        var bo ={
                    name: boName + "Collection",
                    titleName: headerInfo.title,
                    titleSingularName: headerInfo.singularTitle,
                    id: boName
        };
        return bo;
    },
    
    //translation
    addAnnotationExtensionTranslationToModel: function(scope,translationsObj) {
		    var viewModel = scope.getModel(),
		       // modelData = viewModel.getData(),
		        annotationExtTranslations = {};
		    //var  modelData = viewModel.getData(),   
		   /* if (modelData && modelData.annotationExtTranslations) {
		        annotationExtTranslations = modelData.annotationExtTranslations;
		    }     */
		    annotationExtTranslations = translationsObj;
		    
		    viewModel.setData({annotationExtTranslations: annotationExtTranslations}, true);
	},
	getAnnotationExtensionTranslation: function(scope,url) {
	    //var that = this;
	    
	    var parserExtension =  new Parser(url, function() {
	      // scope.addAnnotationExtensionTranslationToModel.call(scope, this, parserExtension.getAnnotationExtensionTranslations()); 
	       utils.addAnnotationExtensionTranslationToModel(scope,parserExtension.getAnnotationExtensionTranslations()); 
	    }, {
	        ignoreMetadata: true,
	        ignoreannotations: true,
	        oDataServiceName: scope.oDataBackendServiceName
	    });
	},
	addTranslationToModel: function(scope,lang, translationsObj) {
		    var viewModel = scope.getModel(),
		        modelData = viewModel.getData(),
		        translations = {};
		        
		    if (modelData && modelData.translations) {
		        translations = modelData.translations;
		    }     
		    
		    translations[lang] = translationsObj;
		    
		    viewModel.setData({translations: translations}, true);
	},
	getTranslation: function(scope,lang,url) {
		    scope.parsers[lang] =  new Parser(url, function() {
    		    utils.addTranslationToModel(scope, lang, scope.parsers[lang].getTranslations()); 
    		    scope.numOfTranslationsLoaded++;
    		    if (scope.numOfTranslationsLoaded === utils.supportTranslations.length) {
    		          scope.onReceiveAllTranslation.bind(scope)();
    		    }
    		 }, {
		        xmlHeaders: {
		            'Accept-Language': lang
		        },
		        ignoreMetadata: true,
		        ignoreannotationsExtension: true,
		        oDataServiceName: scope.oDataBackendServiceName,
		        onXmlError: function() {
		            scope.numOfTranslationsLoaded++;
		        }
		    });
	},
	getAllTranslations: function(scope,url) {
	    var i;
	    for (i = 0; i < utils.supportTranslations.length; i++) {
	        utils.getTranslation(scope,utils.supportTranslations[i],url);
	    }
	    utils.getAnnotationExtensionTranslation(scope,url);
	},
	 convertMapToProperties: function(translationsObj) {
        var key,
            res = [];
        
        for (key in translationsObj) {
            if (translationsObj.hasOwnProperty(key)) {
                res.push(key + "=" + (translationsObj[key] || key));
            }
        }
        
        return res.join("\r\n");
    },
      createResourceBundles : function (templateZip, model){
                var TMPL_NAME = "translation.tmpl",
                    FILE_NAME = "bundle",
                    MESSAGES = "messages",
                    DEFAULT_LANG = "en",
                    LANG_SEPARATOR = "_",
                    PROPERTIES_EXTENSION = ".properties",
                    ROOT_FOLDER = "i18n",
                    ANNOTATION_FOLDER = "annotations",
                    ANOTATION_EXT_FOLDER = "annotationsExtension",
                    STATIC_FOLDER = "static",
                    translations = model.translations || [],
                    annotationExtensionTranslation = model.annotationExtTranslations || {},
                    lang,
                    tmplFile = templateZip.files[TMPL_NAME];
                
                    
                //create all translation files    
                for (lang in translations) {
                    if (translations.hasOwnProperty(lang)) {
                       templateZip.file(ROOT_FOLDER + "/" + ANNOTATION_FOLDER + "/" + FILE_NAME + LANG_SEPARATOR + lang.replace(/-/g, "_") + PROPERTIES_EXTENSION,
                                        templateZip.utf8encode(utils.convertMapToProperties(translations[lang])), 
                                        tmplFile.options);
                    }
                }
                
                //create default translation file
                templateZip.file(ROOT_FOLDER + "/" + ANNOTATION_FOLDER + "/" + FILE_NAME + PROPERTIES_EXTENSION,
                                 templateZip.utf8encode(utils.convertMapToProperties(translations[DEFAULT_LANG])), 
                                 tmplFile.options);
                 
                templateZip.remove(TMPL_NAME);
               
               
                var defaultStaticFile = templateZip.files[ROOT_FOLDER + "/" + STATIC_FOLDER + "/" + FILE_NAME + "/" + MESSAGES + PROPERTIES_EXTENSION];
                var defaultAnnotationExtFile = templateZip.files[ROOT_FOLDER + "/" + ANOTATION_EXT_FOLDER + "/" + MESSAGES + PROPERTIES_EXTENSION];
                
                //duplicate Static messages.properties for _en
                templateZip.file(ROOT_FOLDER + "/" + STATIC_FOLDER + "/" + FILE_NAME + "/" + MESSAGES + LANG_SEPARATOR + DEFAULT_LANG + PROPERTIES_EXTENSION,
                                defaultStaticFile._data,
                                tmplFile.options
                ); 
                
                //duplicate AnnotationsExtension messages.properties for _en
                templateZip.file(ROOT_FOLDER + "/" + ANOTATION_EXT_FOLDER + "/" + MESSAGES + LANG_SEPARATOR + DEFAULT_LANG + PROPERTIES_EXTENSION,
                                defaultAnnotationExtFile._data,
                                tmplFile.options
                ); 
                 
                 
                return templateZip;
            },
            
            //for Starter of massCreator
    isGenerateCurrentBO :function (type,model,generateBos){
	    var generate = false;
	    if(type === "Creator"){
	        generate = generateBos[model.boId].create;
	    }
	    else if(type === "Table"){
	      generate = generateBos[model.boId].table;
	    }else if(type === "Details"){
	        generate = generateBos[model.boId].details;
	    }
	    return generate;
	},
    
    regenerateModel :function regenerateModel (templateType,projectZip, model){
	    if(templateType === "MassCreator"){
	        return model;
	    }
	    var newModel = jQuery.extend(true, {}, model);
	    var i,currentBOModel;
	    for(i = 0;i < newModel.contentModel.avilableBO.length;i++){
    	     currentBOModel = newModel.contentModel.avilableBO[i];
    	     var appPath = "/" + currentBOModel.boId + "/" + currentBOModel.boId + templateType;
    	     currentBOModel.applicationPath = appPath;
	    }
	    return newModel;
	},
	getTemplateType :function getTemplateType(templateZip){
        var name = utils.templates.massCreator.name,
            i;
            
        for (i in utils.templates) {
            if (utils.templates.hasOwnProperty(i)) {
                if (typeof templateZip.files[utils.templates[i].fileValidator] !== "undefined") {
                    name = utils.templates[i].name;
                    break;
                }
            }
        }
        
        return name;
    },
    createTranslation :function(templateZip,model){
	     if(!model.generateTranslations){
	         var newZip = new JSZip();
	         return  newZip;
	     }
	     var newTemplateZip = utils.createResourceBundles(templateZip, model);
	     return  newTemplateZip;
	},
	addSharedConentForComponent :function (currentModel,templateType,currentObject,newZip){
	    var newName = "/" + currentModel.boId + "/" + currentModel.boId + templateType + "/" + currentObject.name;
        newZip.file(newName,currentObject._data,currentObject.options);
	},
	createSharedResources: function createSharedResources(projectZip, model) {
	    var newZip = new JSZip();
	    var originalFiles = projectZip.files;
	    var maxNumber = model.contentModel.avilableBO.length;
	    var i,file,hasCreate,hasTable,hasDetails;
	    for(i = 0;i < maxNumber;i++){
            var currentModel = model.contentModel.avilableBO[i];
            hasCreate = utils.isGenerateCurrentBO("Creator",currentModel,model.generateBos);
            hasTable = utils.isGenerateCurrentBO("Table",currentModel,model.generateBos);
            hasDetails = utils.isGenerateCurrentBO("Details",currentModel,model.generateBos);
            if(hasCreate || hasTable || hasDetails){
                for(file in originalFiles) {
                    //create all files:
                    var currentObject = originalFiles[file];
                    if(!currentObject.options.dir){
                            if(hasCreate){
                                utils.addSharedConentForComponent(currentModel,"Creator",currentObject,newZip);
                            }
                            if(hasTable){
                                utils.addSharedConentForComponent(currentModel,"Table",currentObject,newZip);
                            }
                            if(hasDetails){
                                utils.addSharedConentForComponent(currentModel,"Details",currentObject,newZip);
                            }
                    }
                }
            }
        }
	    return newZip;
	},
	
	regenerateZip :function regenerateZip(rootName,projectZip, model) {
	    var newZip = new JSZip();
	    if (rootName === "MassCreator"){
	        return newZip;
	    }
	    var i,file,newName,fileContent;
	    var generateCurrentBO;
	    var originalFiles = projectZip.files;
	    var maxNumber = model.contentModel.avilableBO.length;
	    
        for(i = 0; i < maxNumber; i++){
            var currentModel = model.contentModel.avilableBO[i];
            var replacedText = "avilableBO.[" + i + "]";
            generateCurrentBO = utils.isGenerateCurrentBO(rootName,currentModel,model.generateBos);
            if(generateCurrentBO){
                for(file in originalFiles) {
                    //create all files:
                    var currentObject =originalFiles[file];
                    newName = currentModel.applicationPath + "/" + currentObject.name;
                    if(!currentObject.options.dir){
                        if(currentObject.name.indexOf(".tmpl") > 0){
                            fileContent = currentObject.asText().replace(/currentBO/g,replacedText);
                            newZip.file(newName,fileContent,currentObject.options);
                        }
                        else{
                            newZip.file(newName,currentObject._data,currentObject.options);
                        }
                    }
                }
                
                if (rootName === "Details" ){
                        newZip = utils.createFacetsDialogs(newZip, currentModel.facets, currentModel.selectedBO, currentModel.applicationPath);
                } 
            }
        }
        
		return newZip;
	}
};
