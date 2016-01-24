/**
 * Define parser
 * @constructor
 * @class Parser
 * @param {string} url
 * @param {boolean} local
 */
var Parser = function Parser(destUrl, callback, opts) {
    opts = opts || {};

    this.callback = callback;
    this.destUrl = destUrl;
    
    this.pcmServiceUrl = "/sap/c4c/odata/v1/" + opts.oDataServiceName;
    this.annotationSuffix = "/AnnotationCollection('x')/Content/$value";
    this.utilsPath = "sap.hcp.c4c.plugin/utils/";
    this.xmlHeaders = opts.xmlHeaders;
    this.oDataServiceName = opts.oDataServiceName;
    this.onXmlError = opts.onXmlError;
    
    if(opts.oDataServiceName === "pcmportal"){
        this.annotationExtensionSuffix = this.utilsPath  + "AnnotationsExtension.xml";
    }
    else{
        this.annotationExtensionSuffix = this.utilsPath  + "AnnotationsExtension_" + opts.oDataServiceName + ".xml";
    }
    this.xmls = {
        annotations: opts.ignoreAnnotations ? "" : (opts.annotationUrl ? opts.annotationUrl : this.destUrl + this.pcmServiceUrl + this.annotationSuffix) ,
        metadata: opts.ignoreMetadata ? "" : (opts.metadataUrl ? opts.metadataUrl : this.destUrl + this.pcmServiceUrl +"/$metadata"),
        annotationsExtension: opts.ignoreannotationsExtension ? "" : (opts.annotationsExtensionURL ? opts.annotationsExtensionURL : require.toUrl(this.annotationExtensionSuffix))
    };

    this.loadXmls();
};

Parser.prototype = {

    /**
     * Define constructor
     * @member Parser
     */
    constructor: Parser,
    
    loadXmls: function() {
        var param;
        this.xmlsCompleted = 0;
        
        for (param in this.xmls) {
            if (this.xmls.hasOwnProperty(param) && this.xmls[param]) {
                this.loadXml(this.xmls[param], param);
            }
        }
    },
    
    finishLoad: function() {
       this.xmlsCompleted++;
       if (this.xmlsCompleted === this.getObjectLength(this.xmls)) {
          this.defineGlobalAlias(); 
          this.defineAnnotationsTarget();
          if (typeof this.callback === "function") {
              this.callback();
          }
       }
    },
    
    loadXml: function loadXml(url, xmlParam) {
        //this.xmlHeaders
        $.ajax({
            url: url,
            headers: this.xmlHeaders,
            dataType: 'xml',
            success: function(xml){
               this[xmlParam] = xml;
               this.finishLoad();
            }.bind(this) ,
            error: this.errorHandler.bind(this)
        });
    },
    
    getObjectLength: function getObjectLength(obj) {
        var i,
            length = 0;
        for (i in obj) {
            if (obj.hasOwnProperty(i) && obj[i]) {
                length++;
            }
        }
        
        return length;
    },
    
     /**
     * Define edmx:Include Alias
     * @member Parser
     */
    defineGlobalAlias: function defineGlobalAlias() {

        /**
         * Store alias
         * @member Parser
         * @type {string}
         */
        this.alias = this.getAttr(
            this.getValue(
                this.annotations,
                'Include[Alias]:last'
            ),
            'Alias'
        );
    },

    /**
     * Define targets
     * @member Parser
     */
    defineAnnotationsTarget: function defineAnnotationsTarget() {

        /**
         * Store targets
         * @member Parser
         * @type {Array}
         */
        this.targets = this.getValue(
            this.annotations,
            'Annotations[Target^="' + this.alias + '."]:not(Annotations[Target*="/"])'
        ) || [];
    },

    /**
     * Get records
     * @member Parser
     * @param scope
     * @param {string} type
     * @param {string} term
     * @param {Array} collectors
     * @returns {Array}
     */
    getRecords: function getRecords(scope, type, collectors, term) {
        if (!term) {
            term = "UI";
        }
        collectors = collectors || [];
        collectors.length ? collectors.unshift('') : collectors;

        return this.getValue(
            scope,
                'Annotation[Term="' + term + '.' + type + '"]' + collectors.join(' > ')
        );
    },
 
    /**
     * Get value
     * @member Parser
     * @param scope
     * @param {string} type
     * @returns {*|jQuery}
     */
    getValue: function getValue(scope, type) {
        return $(scope).find(type);
    },

    /**
     * Get attribute
     * @member Parser
     * @param scope
     * @param {string} attr
     * @returns {string}
     */
    getAttr: function getAttr(scope, attr) {
        return $(scope).attr(attr);
    },

    /**
     * Get property
     * @member Parser
     * @param scope
     * @param {string} type
     * @param {string} property
     * @returns {*|jQuery}
     */
    getProperty: function getProperty(scope, type, property) {
        return $(scope).find('[Property="' + type + '"]').attr(
            typeof(property) === 'undefined' ? 'String' : property
        );
    },

    /**
     * Get BO
     * @member Parser
     * @param {string} type
     * @returns {*|jQuery}
     */
    getBusinessObject: function getBusinessObject(type) {
        return this.getValue(
            this.annotations,
            "Annotations[Target='" + this.alias + "." + type + "']"
        );
    },
    
    getBusinessObjectName: function getBusinessObjectName(scope, bo) {
        var target = scope.getAttr(bo, "Target");
        return target.slice(this.alias.length + '.'.length);
    },

    /**
     * Get header info
     * @member Parser
     * @param bo
     * @returns {{title: *, description: *, image: *}}
     */
    getHeaderInfo: function getHeaderInfo(bo) {

        /**
         * Get header info
         * @type {Array}
         */
        var header = this.getRecords(bo, 'HeaderInfo', ['Record']);
        var statusAnnotation= $(header).find('[Property="Description"]');
        var status =this.getProperty(statusAnnotation,"Value", "Path");

        return {
            name: this.getProperty(header, 'TypeName'),
            title: this.getPluralKeyByScope(header),
            description: this.getPluralKeyByScope(header),
            singularTitle: this.getPluralKeyByScope(header, 'TypeName'),
            image: this.getProperty(header, 'ImageUrl'),
            status:status
        };
    },

    /**
     * Get Table data
     * @member Parser
     */
    getTableData: function getTableData() {

        /**
         * Define scope
         * @type {Parser}
         */
        var scope = this,
            columns, items = [],
            column, headerInfo;

        this.targets.each(function () {

            columns = [];

            headerInfo = scope.getHeaderInfo(this);

            //Table Columns
            scope.getRecords(this, 'LineItem', ['Collection', 'Record']).each(function () {


                //<Record> in <Annotation>
                column = {};

                scope.getValue(this, 'PropertyValue').each(function () {

                    var propertyPath = scope.getAttr(this, 'Path');

                    if (propertyPath !== undefined) {

                        //Technical name
                        column.name = propertyPath;

                    } else {

                        //Pretty name
                        column.prettyName = scope.getAttr(this, "String");
                        column.type = scope.getAttr(this, "Property");
                    }
                });

                columns.push(column);
            });

            items.push({
                name: scope.getAttr(this, 'Target').replace(scope.alias + ".", "") + "Collection",
                columns: columns,
                titleName: headerInfo.title,
                id: scope.getAttr(this, 'Target')
            });
        });

        return items;
    },
    
    isAttachable: function isAttachable(bo) {
        var $bo = this.getValue(
            this.metadata,
            'EntityType[Name="' + bo + '"]'
        );
            
        var binary = this.getAttr(
            this.getValue(
                $bo, 'Property[Name="Binary"]'
            ), 'sap:creatable') === "true";
            
        var mimetype = this.getAttr(
            this.getValue(
                $bo, 'Property[Name="MimeType"]'
            ), 'sap:creatable') === "true";
            
        return binary && mimetype;    
    },

    getTableColumns: function getTableColumns(scope, bo) {
        var items ,
            columns = [],
            headerInfo = scope.getHeaderInfo(bo), 
            column,
            boName = scope.getBusinessObjectName(scope, bo),
            tableExtensionFields = scope.getTableExtensionFields(boName),
            fieldsType = this.convertAnnotationToMap(this.getEntityTypeBO(boName).properties, {value: "Type"}),
            type,
            tableField;

        //Table Columns
        scope.getRecords(bo, 'LineItem', ['Collection', 'Record']).each(function () {
            if(scope.getAttr(this,'Type') === "UI.DataField"){
                //<Record> in <Annotation>
                column = {
                    prettyName:  scope.getProperty(this, "Label"),//TODO needed?
                    titleKey:scope.getLabelKeyByScope(this,null,true)
                };
                
                var path = scope.getProperty(this, "Value", "Path");
                if (typeof path !== 'undefined') {
                    column.name  = scope.getProperty(this, "Value", "Path");
                }
                else {
                   column.func = scope.getFunctionInfo(this);
                }
               
                column.type = "Label";
                type = fieldsType[column.name];
                tableField = tableExtensionFields[column.name || scope.convertFuncParamsToName(column.func.arguments)];
                
                if (tableField) {
                    if(tableField.type === "Link"){
                        column.type = tableField.type;
                        column.action = tableField.action;
                        column.targetObject = tableField.targetObject;
                    }
                    if(tableField.alternativePath){
                       column.alternativePath = tableField.alternativePath;
                    }
                }
                
                column.type = scope.getDateType(type, tableField) || column.type;
                
                /*if (type ==="Edm.DateTime" || type === "Edm.DateTimeOffset") {
                    if (tableField && tableField.type === "DateTime") {
                        //type DateTime exist in the annotation extension
                        column.type = "DateTime";
                    } else {
                        //type DateTime is not exist in the annotation extension
                        column.type = "Date";
                    }
                }
                */
                columns.push(column);
            }
        });

        items = {
            name: scope.getAttr(bo, 'Target').replace(scope.alias + ".", "") + "Collection",
            columns: columns,
            titleName: headerInfo.title,
            id: scope.getAttr(bo, 'Target')
        };
        return items;
    },
    
    getDateType: function getDateType(metadataType, extensionField) {
        var type;
        
        if (metadataType ==="Edm.DateTime" || metadataType === "Edm.DateTimeOffset") {
            if (extensionField && extensionField.type === "DateTime") {
                //type DateTime exist in the annotation extension
                type = "DateTime";
            } else {
                //type DateTime is not exist in the annotation extension
                type = "Date";
            }
        }
        
        return type  ;
    },

    /**
     * Get header info
     * @member Parser
     * @param bo
     * @returns {Array}
     */
    getFacetsInfo: function getFacetsInfo(bo) {

        /**
         * Get scope
         * @type {Parser}
         */
        var scope = this,
            facets = [],
            creatableFacets = this.getCreatableFacets(),
            deletableFacets = this.getDeletableFacets(),
            updatableFacets = this.getUpdatableFacets(),
            isAttachable = this.isAttachable.bind(this),
            boName = this.getBusinessObjectName(this, bo),
            interactionLogs = this.getAnnotationExtensionRecords(boName, "UI.InteractionLog"),
            interactionLogsMap = {};
            
        interactionLogs.each(function(){
            var type = scope.getAttr(interactionLogs, "Type");
            interactionLogsMap[type] = this;
        });    

        this.getRecords(bo, 'Facets', ['Collection', 'Record']).each(function () {
            var facetTargetPath = scope.getProperty(this, "Target", "AnnotationPath");

            var index = facetTargetPath.indexOf("/@");

            var annotationTerm = facetTargetPath.substring(index + 2);
            var boAnnotation = facetTargetPath.substring(0, index);
            var facetBo = scope.getBusinessObject(boAnnotation);
            
            if (interactionLogsMap[boAnnotation]) {
                annotationTerm = "UI.InteractionLog";  
            }
            
            var facet = {
                label: scope.getLabelKeyByScope(this,null,true),//scope.getProperty(this, "Label"),
                "annotationTerm": annotationTerm,
                "boAnnotation": boAnnotation,
                isCreatable: creatableFacets[boAnnotation],
                isDeletable: deletableFacets[boAnnotation],
                isAttachable: isAttachable(boAnnotation),
                isUpdatable:updatableFacets[boAnnotation]
            };
            
            if (annotationTerm === "UI.InteractionLog") {
                var childInteractionLog = scope.getPropertyValueMap(scope, interactionLogsMap[boAnnotation]);
                facet.childInteractionLog = childInteractionLog;
            } else if (annotationTerm === "UI.LineItem") {
                var childTable = scope.getTableColumns(scope, facetBo);
                facet.childTable = childTable;
            }
            else if(annotationTerm === "UI.Identification"){

                var childForm = scope.getIdentificationInfo(facetBo);
                facet.childForm = childForm;
            }
            
            facets.push(facet);
        });

        return facets;
        // return {
        //     facets:facets
        // };
    },
    
    getPropertyValueMap: function getPropertyValueMap(scope, $record) {
        var map = {};
        
        scope.getValue($record, 'PropertyValue').each(function(){
            map[scope.getAttr(this, 'Property')] = scope.getAttr(this, 'Value');
        });
        
        return map;
    },
    
    getCreatableFacets: function getCreatableFacets() {
        var scope = this,
            creatableFacets = {};
        
        this.getValue(
            this.metadata,
            'EntityContainer EntitySet'
        ).each(function(){
            if (scope.getAttr(this, 'sap:creatable') === "true") {
                creatableFacets[scope.getAttr(this, 'Name').replace(/Collection/, '')] = true;
            }
        });
        
        return creatableFacets;
    },

    getDeletableFacets: function getDeletableFacets() {
        var scope = this,
            deletableFacets = {};
        
        this.getValue(
            this.metadata,
            'EntityContainer EntitySet'
        ).each(function(){
            if (scope.getAttr(this, 'sap:deletable') === "true") {
                deletableFacets[scope.getAttr(this, 'Name').replace(/Collection/, '')] = true;
            }
        });
        
        return deletableFacets;
    },


    getUpdatableFacets: function getUpdatableFacets() {
        var scope = this,
            updatableFacets = {};
        
        this.getValue(
            this.metadata,
            'EntityContainer EntitySet'
        ).each(function(){
            if (scope.getAttr(this, 'sap:updatable') === "true") {
                updatableFacets[scope.getAttr(this, 'Name').replace(/Collection/, '')] = true;
            }
        });
        
        return updatableFacets;
    },
    getUpdatableFieldsName:function(boId){

        var props = this.getEntityTypeBO(boId, {type: "sap\\:updatable", value: "true"}).properties;
        var arr = ["ObjectID"];
        var i;
        for(i=0;i<props.length;i++) {
            arr.push($(props[i]).attr('Name'));
        }
        return arr;
    },
    getIdentificationInfo: function getIdentificationInfo(bo) {

        var scope = this,
            generalInfo = [],
            boName = scope.getBusinessObjectName(scope, bo),
            identificationExtensionFields = scope.getIdentificationInfoExtensionFields(boName),
            fieldsType = this.convertAnnotationToMap(this.getEntityTypeBO(boName).properties, {value: "Type"}),
            fieldExtension,
            type;

        this.getRecords(bo, 'Identification', ['Collection', 'Record']).each(function () {
            if(scope.getAttr(this,'Type') === "UI.DataField"){
                var dataField = {
                    title: scope.getProperty(this, "Label"),
                    titleKey :scope.getLabelKey(scope.getValue(this,"PropertyValue[Property=Label]"))
                };
                var path = scope.getProperty(this, "Value", "Path");
                if (typeof(path) !== 'undefined') {
                    dataField.path = path;
                }
                else {
                    dataField.func = scope.getFunctionInfo(this);
                    ////TODO apply function
                }
                
                dataField.type = "Label";
                type = fieldsType[dataField.path];
                fieldExtension = identificationExtensionFields[dataField.path || scope.convertFuncParamsToName(dataField.func.arguments)];
                
                dataField.type = scope.getDateType(type, fieldExtension) || dataField.type;
                
               /* if (type ==="Edm.DateTime" || type === "Edm.DateTimeOffset") {
                    if (fieldExtension && fieldExtension.type === "DateTime") {
                        //type DateTime exist in the annotation extension
                        dataField.type = "DateTime";
                    } else {
                        //type DateTime is not exist in the annotation extension
                        dataField.type = "Date";
                    }
                }
                */
                generalInfo.push(dataField);
            }
        });

        return generalInfo;
    },
    
    getFunctionInfo:function getFunctionInfo(scope){
        var func,funcArgs =[],functionName;

        var funcAnnotation = $(scope).find('[Property="Value"]>Apply');
        functionName = funcAnnotation.attr("Function");
        $(funcAnnotation).find("Path").each(function () {
	        funcArgs.push($(this).text());
        });
        
        func ={
            funcName:functionName,
            arguments:funcArgs
        };
        return func;
    },
    
    convertFuncParamsToName: function convertFuncParamsToName(args) {
        var i,
            name = '';
            
        if (!args || args.length === 0) {
            return name;
        }    
        
        for (i = 0; i < args.length; i++) {
            name += (args[i] + '.');
        }
        
        name = name.slice(name.length - 1);
        
        return name;
    },
    
    getAvailableBO: function getAvailableBO(type) {

        /**
         * Define scope
         * @type {Parser}
         */
        var scope = this,
            items = [],
            headerInfo,
            leadBos = this.getLeadBos();
            

        this.targets.each(function () {
            var isVisible,
                target = scope.getAttr(this, 'Target').replace(scope.alias + ".", ""),
                availablePatterns = scope.getAvailablePatterns(target, leadBos);
               
            if (!type) {
               isVisible = true; 
            } else {
                if (type === "massCreator" || type === "pcmSolution") {
                  isVisible = availablePatterns["create"]; //at least create
                } else {
                  isVisible = availablePatterns[type];  
                }
                
            }  
            
            if(isVisible){
                headerInfo = scope.getHeaderInfo(this);
                items.push({
                    name: target + "Collection",
                    titleName: headerInfo.title,
                    titleSingularName: headerInfo.singularTitle,
                    id: target
                });
            }
        });

        return items;
    },
    
    /**
     * Get Available patterns (e.g. create, details, table...) for a specific bo
     * @param boId - id of the business object  
     * [@param leadBos] optional - lead business objects
     */
    getAvailablePatterns: function getAvailablePatterns(boId, leadBos) {
        var $bo = this.getBusinessObject(boId),
            identification = this.getRecords($bo, 'Identification', ['Collection', 'Record']),
            lineItem = this.getRecords($bo, 'LineItem', ['Collection', 'Record']),
            isIdentificationDefined = identification.length > 0,
            isLineItemDefined = lineItem.length > 0;
            
        leadBos = leadBos || this.getLeadBos();   
            
        return {
            create: isIdentificationDefined,
            details: isIdentificationDefined,
            table: isLineItemDefined && (!!leadBos[boId])
        }; 
    },
    
    /**
     * Get tree of bos and its pattern
     */
    getBosTree: function getBosTree() {
        var tree = {},
            allBos = this.getAvailableBO("massCreator"),
            leadBos = this.getLeadBos(),
            i,
            bo;
            
        for (i = 0; i < allBos.length; i++) {
            bo = allBos[i];
            tree[bo.id] = this.getAvailablePatterns(bo.id, leadBos);
        }    
        
        return tree;
    },

    /**
     * Get entity type $metadata
     * @param name
     * @param {{type: string, value: string}} [opts]
     * @returns {{key: string, properties: (*|jQuery)}}
     */
    getEntityTypeBO: function getEntityTypeBO(name, opts) {

        var $bo = this.getValue(
                this.metadata,
                'EntityType[Name="' + name + '"]'
            ),
            key = this.getAttr(
                this.getValue($bo, 'Key > PropertyRef'),
                'Name'
            ),
            filterBy = 'Property';

        if (opts) {
            filterBy += '[' + opts.type + '="' + opts.value + '"]';
        }

        var $properties = this.getValue($bo, filterBy);

        return {
            key: key,
            properties: $properties
        };
    },
    
    /**
     * convert part of annotation/meta data to map
     * @member Parser
     * @param {annotation}  part of annotation
     * @param {key: string, value:string}  [opts]
     * @returns {Object}
     */
    convertAnnotationToMap: function convertAnnotationToMap($annotation, opts) {
        opts = opts || {};
        
        var map = {},
            key = opts.key || "Name",
            value = opts.value;
            
        $annotation.each(function () {
            map[$(this).attr(key)] = (value ? $(this).attr(value) : $(this));
        });
        
        return map;
    },
    
    /**
     * Get records
     * @member Parser
     * @param entityTarget {string}  the  business entity.
     * @param fieldName {string} fieldName the valueHelp field.
     * @returns {Object}
     */
    getValueHelpParams: function getValueHelpParams(entityTarget, fieldName) {

        var i, viewParams = {}, inFields = [], outFields = [],filterable = [],
            valueHelpAnnotations = this.getBusinessObject(entityTarget + "/" + fieldName);
        if (valueHelpAnnotations.length === 0) {
            return false;
        }
        
        var records = this.getRecords(valueHelpAnnotations, 'ValueList', [ 'Record'], 'Common');
        var params = $(records).find("[Property='Parameters']> Collection > Record");
        var prefixKey = this.getLabelKey(records);
        prefixKey = prefixKey.replace("/",".");
        var resolvers = {
            handleValueListParameterIn: function (record) {
                var remotePath = this.getProperty(record, 'ValueListProperty');
                if (!viewParams[remotePath]) {
                    viewParams[remotePath] = null;
                }
            },
            handleValueListParameterOut: function (record) {

                var remotePath = this.getProperty(record, 'ValueListProperty');
                if (!viewParams[remotePath]) {
                    viewParams[remotePath] = [this.getProperty(record, 'LocalDataProperty', 'PropertyPath')];
                } else {
                    viewParams[remotePath][viewParams[remotePath].length++] = this.getProperty(record, 'LocalDataProperty', 'PropertyPath');
                }

            },
            handleValueListParameterInOut: function (record) {

                var remotePath = this.getProperty(record, 'ValueListProperty');
                if (!viewParams[remotePath]) {
                    viewParams[remotePath] = [this.getProperty(record, 'LocalDataProperty', 'PropertyPath')];
                } else {
                    viewParams[remotePath][viewParams[remotePath].length++] = this.getProperty(record, 'LocalDataProperty', 'PropertyPath');
                }

            },
            handleValueListParameterDisplayOnly: function (record) {
                var remotePath = this.getProperty(record, 'ValueListProperty');
                if (!viewParams[remotePath]) {
                    viewParams[remotePath] = null;
                }
            }
        };


        for (i = 0; i < params.length; i++) {

            var resolveFunction = resolvers[$(params[i]).attr("Type").replace("Common.", "handle")];
            resolveFunction.call(this, params[i]);
        }


        var colPath = this.getProperty(records, 'CollectionPath');
        var colRoot = this.getProperty(records, 'CollectionRoot');
        var searchSupported = this.getProperty(records, 'SearchSupported');

        if (colRoot) {
            colPath = colRoot + colPath;
        }

        var filterableProps =  this.getEntityTypeBO(colPath, {type: "sap\\:filterable", value: "true"}).properties;
        
        var comboBoxSet = $(this.metadata).find('EntityContainer EntitySet[sap\\:semantics="fixed-values"][Name="' + colPath + 'Collection"]'),
            isComboBox = false;
        
        if (comboBoxSet.length > 0) {
            var comboName = fieldName.replace(/Collection/, '').replace(entityTarget, '');
            var comboProps = this.getEntityTypeBO(entityTarget, {type: "Name", value: comboName}).properties;
            isComboBox = true;
            
            this.comboBoxCollection = this.comboBoxCollection || [];
            this.comboBoxCollection.push(comboName);
        }
         
        $.each(filterableProps,function(){

           filterable.push($(this).attr("Name"));

        });

        return {
            CollectionPath: colPath,
            searchSupported: !!searchSupported,
            viewParams: viewParams,
            filterable:filterable,
            comboBox: isComboBox,
            BusinessObject:entityTarget+"Collection",
            prefixKey:prefixKey,
            getColumns: function getColumns() {
                var columns = [], i = null;
                for (i in viewParams) {

                    if (!viewParams.hasOwnProperty(i)) {
                        return;
                    }

                    columns[columns.length++] = i;

                }
                return columns;
            },
            getOutParams: function getOutParams() {
                var localPath = [], i = null;
                for (i in viewParams) {
                    if (!viewParams.hasOwnProperty(i)) {
                        return;
                    }
                    if (viewParams[i]) {
                        localPath = localPath.concat(viewParams[i]);
                    }
                }
                return localPath;
            }
        }
    },
    
    /**
     * Get Lead Bos
     * @member Parser
     * @returns {Array}
     */
     getLeadBos: function getLeadBos() {
        var scope = this,
            boName,
            leadBos = {};
         
        this.getValue(
            this.isLeadBoExist(),
            'Annotations[Target^="' + this.alias + '."]'
        ).each(function(){
            boName = scope.getAttr(this, 'Target').replace(scope.alias + ".", "");
            scope.getValue(this, 'Annotation[Term="UI.LeadBO"] Record').each(function(){
                scope.getValue(this, "PropertyValue").each(function(){
                    if (scope.getAttr(this, "Property") === "IsLeadBO") {
                        if (scope.getAttr(this, "Value") === "TRUE") {
                           leadBos[boName] = true;
                        }
                    }
                });
            });
        });
        
        return leadBos;
     },
     
     isLeadBoExist : function isLeadBoExist(){
        var records = this.getValue(
            this.annotations,
            'Annotation[Term="UI.LeadBO"] Record'
        );
        if (records.length === 0 ){
            return this.annotationsExtension;
        }else {
            return this.annotations;
        }
     },
     
     getAnnotationExtensionRecords: function getAnnotationExtensionRecords(boName, term) {
         return this.getValue(
            this.annotationsExtension,
            'Annotations[Target="' + this.alias + '.' + boName + '"] Annotation[Term="' + term + '"] Collection Record'
        );
     },
     
     getFunctionParameters: function($scope) {
         var scope = this;
         var parameters = [];
         this.getValue($scope, 'Parameter').each(function(){
                parameters.push({
                    key: scope.getAttr(this, 'Name'),
                    value: scope.getAttr(this, 'Value')
                });
         });
         
         return parameters;
     },
     
     getQueries: function getQueries(boName) {
         var queries = [],
             $type,
             queryType,
             funcName,
             titleKey,
             scope = this;
         
         this.getAnnotationExtensionRecords(boName, "UI.Query").each(function(){
            $type = scope.getValue(this, 'PropertyValue[Property="Type"]');
            
            queryType = scope.getAttr($type, 'Value');
            funcName = (queryType === 'FunctionImport' ? scope.getAttr($type, 'Name') : '');
            titleKey = scope.getLabelKeyByScope(this,null, false);
            
            queries.push({
                name: scope.getProperty(this, "Label"),
                titleKey: titleKey,
                type: queryType,
                funcName: funcName,
                parameters: scope.getFunctionParameters($type),
                isDefault: scope.getProperty(this,"Default", "Value") === "TRUE"
            });
        });
        
        return queries;
     },
     
     getBOAction: function getBOAction(boName) {
        var actions = [],
            $func,
            parameters,
            scope = this;
        
        this.getAnnotationExtensionRecords(boName, "UI.BOAction").each(function(){
            $func = scope.getValue(this, 'PropertyValue[Property="FunctionImport"]');
            parameters = scope.getFunctionParameters($func);
            
            actions.push({
                name: scope.getProperty(this, "Label"),
                funcName: scope.getProperty(this, "FunctionImport", "Name"),
                type: scope.getAttr($func, 'Property'),
                parameters: parameters,
                titleKey:scope.getLabelKeyByScope(this,null,false)
            });
        });
        
        return actions;
     },
     
     getTableExtensionFields: function getTableExtensionFields(boName) {
        var tableFields = {},
            path,
            name,
            func,
            scope = this;
         
        this.getAnnotationExtensionRecords(boName, "UI.LineItem").each(function(){
            
            path = scope.getProperty(this, "Value", "Path");
            name = undefined;
            func = undefined;
            if(typeof path !== 'undefined'){
                name  = path;
            }
            else{
               func = scope.getFunctionInfo(this);
            }
            
            tableFields[name || scope.convertFuncParamsToName(func.arguments)] = {
                prettyName: scope.getProperty(this, "Label"),
                name: name,
                func: func,
                type: scope.getProperty(this, "DisplayType", "Value"),
                action: scope.getProperty(this, "Action", "Value"),
                targetObject: scope.getProperty(this, "TargetObject", "Value")
            };
            
             var alternativePath = scope.getProperty(this, "Value", "AlternativePath");
             if(typeof alternativePath !== "undefined"  && tableFields[name] ) {
                 tableFields[name].alternativePath = alternativePath;
             }
        });
        
        return tableFields;
     },
     
     getIdentificationInfoExtensionFields: function getIdentificationInfoExtensionFields(boName) {
        var tableFields = {},
            path,
            name,
            func,
            scope = this;
         
        this.getAnnotationExtensionRecords(boName, "UI.Identification").each(function(){
            
            path = scope.getProperty(this, "Value", "Path");
            name = undefined;
            func = undefined;
            if(typeof path !== 'undefined'){
                name  = path;
            }
            else{
               func = scope.getFunctionInfo(this);
            }
            
            tableFields[name || scope.convertFuncParamsToName(func.arguments)] = {
                prettyName: scope.getProperty(this, "Label"),
                name: name,
                func: func,
                type: scope.getProperty(this, "DisplayType", "Value")
            };
        });
        
        return tableFields;
     },
    
    /**
     * Define error handler
     * @member Parser
     */
    errorHandler: function errorHandler() {
        if (typeof this.onXmlError === "function") {
            this.onXmlError(arguments);
        } else {
            throw new Error('Unable to get Annotations XML', arguments);
        }
    },
    
    /**
     * Convert annotation's file into ui5 key /value map.
     * @returns {Object}
     */
    getTranslations: function () {

        var $annotation = this.annotations,
            keys = {},
            i,
            stringsArr = $($annotation).find("[String][Property='Label']"),
            pathForPlural,
            pathForLabel,
            typeNamePlural,
            pathForValueList,
            valueList,
            isValueListLabel;
        
        for (i = 0; i < stringsArr.length; i++) {
            pathForLabel = this.getLabelKey($(stringsArr[i]), true);
            isValueListLabel = this.isValueListLabel(pathForLabel.path);
            if(!isValueListLabel){
                keys[pathForLabel.path] = pathForLabel.value;
            }
        }

        typeNamePlural = $($annotation).find("[Property='TypeName'],[Property='TypeNamePlural']");
        for (i = 0; i < typeNamePlural.length; i++) {
            pathForPlural = this.getPluralKey($(typeNamePlural[i]), true);
            keys[pathForPlural.path] = pathForPlural.value;
        }
        
        valueList =  $($annotation).find("[String][Property='ValueListProperty']");
        for (i = 0; i < valueList.length; i++) {
            pathForValueList = this.getLabelKeyForValueList($(valueList[i]), true);
            keys[pathForValueList.path] = pathForValueList.value;
        }

        return keys;
    },
    
    getAnnotationExtensionTranslations: function () {

        var $annotation = this.annotationsExtension,
            keys = {},
            i,
            stringsArr = $($annotation).find("[String][Property='Label']");
        
        for (i = 0; i < stringsArr.length; i++) {
            pathForLabel = this.getAnnotationExtLabelKey($(stringsArr[i]), true);
            keys[pathForLabel.path] = pathForLabel.value;
        }
            delete keys[undefined];
        return keys;
    },
    
    getPluralKey: function($typeNamePlural, returnValue) {
        var path,
            keys = {"path": null, "value": null};
        
        path = this.resolveParents($typeNamePlural.parents());
        path = path.join(".");

        var pathValue = $typeNamePlural.parent().find("[Property='Value']").attr("Path");
        pathValue = pathValue?("." + pathValue):"";

        path += "." + $typeNamePlural.attr("Property") + pathValue;
        keys.value = $typeNamePlural.attr("String");
        keys.path = path;
        
        if (returnValue) {
            return keys;
        }
        
        return keys.path;
    },
    
    isValueListLabel:function (labelPath){
       if((labelPath.indexOf("/")>-1) && labelPath.indexOf("Common.ValueList.Common")>-1){
           return true;
       }
       else{
           return false;
       }
    },

    /**
     * Calculates element path keys. by looking all elm parents.
     * @returns {Array}
     */
    resolveParents: function (parents) {
        var getPathKey = {
            Annotations: "Target",
            Annotation: "Term",
            Record: "Type"
        };

        var pathKey = [];
        var tag, tagValue;
        for (var i = 0; i < parents.length; i++) {
            tag = $(parents[i]).prop("tagName");
            if (getPathKey[tag]) {
                tagValue = $(parents[i]).attr(getPathKey[tag]);
                if (tagValue !== undefined) {
                    pathKey.push(tagValue);
                }
            }
        }
        return pathKey.reverse();

    },
    /**
     * Get dom element and returns it's full key path. (for reading transaltions later on)'
     * @returns {String}
     */
    getLabelKey: function ($label, returnValue) {
        var keys = {"path": null, "value": null};
        var path = this.resolveParents($label.parents());
        path = path.join(".");
        var propertyPath, propertyPathTarget,propertyPathApplyFunc;
        propertyPath = $label.parent().find("[Path]").attr("Path");
        propertyPathTarget = $label.parent().find("[Property='Target']").attr("AnnotationPath");
        propertyPathApplyFunc =  $label.parent().find("Apply[Function='odata.concat']").find("Path");
        if (propertyPath) {
            path += "." + propertyPath.replace("/@", ".").replace("/", "");
            keys.path = path;
        } else if (propertyPathTarget) {
            path += "." + propertyPathTarget.replace("/@", ".");
            keys.path = path;
        }else if(propertyPathApplyFunc){
        
            $.each(propertyPathApplyFunc,function(){
              path +="."+ $(this).text();
            });
              keys.path = path;
            
        }
        keys.value = $label.attr("String");

        if (returnValue) {
            return keys;
        }

        return  keys.path;
    },
    
    getLabelKeyForValueList:function($label, returnValue){
        var keys = {"path": null, "value": null};
        var path = this.resolveParents($label.parent().parents());
        path = path.join(".");
        path = path.replace("/",".");
       path = path + "." + $label.attr("String");
       var $labelTranslation = $label.parent().find("[Property='Label']");
        keys.path = path;
        if($labelTranslation && $($labelTranslation).length){
            keys.value = $labelTranslation.attr("String");
        }
        else{
            keys.value = $label.attr("String");
        }

        if (returnValue) {
            return keys;
        }
 
        return  keys.path;
        
    },
    
     /**
     * Get dom element and returns it's full key path with it's String at the end. (for reading annotation Extension transaltions)'
     * @returns {String}
     */
    getAnnotationExtLabelKey: function ($label, returnValue) {
        var keys = {"path": null, "value": null};
        var path = this.resolveParents($label.parents());
        path = path.join(".");
        if (path.indexOf('UI.LineItem') > -1 || path.indexOf('UI.Identification') > -1){
            returnValue = false
        }
        var propertyPath, propertyPathTarget,propertyPathApplyFunc;
        propertyPath = $label.parent().find("[String]").attr("String");
        //propertyPathTarget = $label.parent().find("[Property='Target']").attr("AnnotationPath");
        //propertyPathApplyFunc =  $label.parent().find("Apply[Function='odata.concat']").find("Path");
        if (propertyPath) {
            path += "." + propertyPath.replace(/ /g, '').replace("/@", ".").replace("/", "");
            keys.path = path;
        } /*else if (propertyPathTarget) {
            path += "." + propertyPathTarget.replace("/@", ".");
            keys.path = path;
        }else if(propertyPathApplyFunc){
        
            $.each(propertyPathApplyFunc,function(){
              path +="."+ $(this).text();
            });
              keys.path = path;
            
        }*/
        keys.value = $label.attr("String");

        if (returnValue) {
            return keys;
        }

        return  keys.path;
    },
    
    getLabelKeyByScope: function($record, prop,isAnnotation) {
        prop = prop || "Label";
        if (isAnnotation){
            return this.getLabelKey(this.getValue($record, "PropertyValue[Property=" + prop + "]"));
        }else {
            return this.getAnnotationExtLabelKey(this.getValue($record, "PropertyValue[Property=" + prop + "]"));
        }
        //return this.getLabelKey(this.getValue($record, "PropertyValue[Property=" + prop + "]"));
    },
    
    getPluralKeyByScope: function($record, prop) {
        prop = prop || "TypeNamePlural";
        return this.getPluralKey(this.getValue($record, "PropertyValue[Property=" + prop + "]"));
    }
};
