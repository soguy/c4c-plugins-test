(function () {

    var parser = new Parser(null, startTests, mockUrls);

    function startTests() {

        /*-------------------Value Help Test---------------------*/

        QUnit.module("Parser- Value Help Tests");

        QUnit.test("Display only param", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName');
            assert.equal(typeof results.viewParams.AccountId, "undefined", "Passed!"); //display field only
        });

        QUnit.test("IN/OUT params", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName');
            assert.equal(results.viewParams.AccountName[0], "AccountNameLocal", "Passed!");
        });

        QUnit.test("In params with out params mapping", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName');
            assert.equal(results.viewParams.AccountIDSuper[0], "local1", "Passed!");
        });


        QUnit.test("Test filed not found", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName2');
            assert.equal(results, false, "Passed!");
        });


        QUnit.test("Verify table columns ", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName');
            assert.deepEqual(results.getColumns(), ["AccountName", "AccountID", "AccountIDSuper"], "Passed!");
        });

        QUnit.test("Verify out params ", function (assert) {
            var results = parser.getValueHelpParams('Opportunity', 'AccountName');
            assert.deepEqual(results.getOutParams(), ["AccountNameLocal", "local1", "local2"], "Passed!");
        });

        /*-------------------Parser - table Test---------------------*/
        QUnit.module("Parser - table Test");

        QUnit.test("Verify Table Columns", function (assert) {
            var selectedBoAnnotation = parser.getBusinessObject("Opportunity"),
                columns = parser.getTableColumns(parser, selectedBoAnnotation).columns,
                i;

            for (i = 0; i < columns.length; i++) {
                if (columns[i].name === "OpportunityName") {
                    assert.equal(columns[i].prettyName, "Name", "Passed!");
                    assert.equal(columns[i].type, "Link", "Passed!");
                    assert.equal(columns[i].action, "Details", "Passed!");
                    assert.equal(columns[i].targetObject, "Opportunity", "Passed!");
                } else {
                    assert.equal(columns[i].type, "Label", "Passed!");
                    assert.equal(typeof columns[i].action, "undefined", "Passed!");
                    assert.equal(typeof columns[i].targetObject, "undefined", "Passed!");
                }
            }
        });

        /*-------------------Parser- Annotation Extention Test---------------------*/

        QUnit.module("Parser- Annotation Extension");

        QUnit.test("Verify Lead Bos", function (assert) {
            assert.equal(parser.getLeadBos()["Opportunity"], true, "Passed!");
            assert.equal(!!parser.getLeadBos()["OpportunityOverview"], false, "Passed!");
        });

        QUnit.test("Verify queries", function (assert) {
            assert.equal(parser.getQueries('Opportunity')[0].name, "All Opportunities", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].type, "Parameter", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].parameters[0].key, "Parameter1", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].parameters[0].value, "Value1", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].parameters[1].key, "Parameter2", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].parameters[1].value, "Value2", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[0].isDefault, true, "Passed!");

            assert.equal(parser.getQueries('Opportunity')[1].name, "My Opportunities", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[1].type, "FunctionImport", "Passed!");
            assert.equal(parser.getQueries('Opportunity')[1].funcName, "Get_My_Opportunities", "Passed!");
            assert.equal(!!parser.getQueries('Opportunity')[1].isDefault, false, "Passed!");
        });

        QUnit.test("Verify BO Action", function (assert) {
            assert.equal(parser.getBOAction('Opportunity')[0].name, "Set as Open", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[0].type, "FunctionImport", "Passed!");

            assert.equal(parser.getBOAction('Opportunity')[0].parameters[0].key, "ObjectID", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[0].parameters[0].value, "val1", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[0].funcName, "Reopen", "Passed!");


            assert.equal(parser.getBOAction('Opportunity')[1].name, "Set as In Process", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[1].type, "FunctionImport", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[1].parameters[0].key, "ObjectID", "Passed!");
            assert.equal(parser.getBOAction('Opportunity')[1].parameters[0].value, "val2", "Passed!");
        });

        QUnit.test("Verify LineItem DataField", function (assert) {
            assert.equal(parser.getTableExtensionFields('Opportunity').OpportunityName.prettyName, "Name", "Passed!");
            assert.equal(parser.getTableExtensionFields('Opportunity').OpportunityName.name, "OpportunityName", "Passed!");
            assert.equal(parser.getTableExtensionFields('Opportunity').OpportunityName.type, "Link", "Passed!");
            assert.equal(parser.getTableExtensionFields('Opportunity').OpportunityName.action, "Details", "Passed!");
            assert.equal(parser.getTableExtensionFields('Opportunity').OpportunityName.targetObject, "Opportunity", "Passed!");

            assert.equal(parser.getTableExtensionFields('Appointments').SubjectName.prettyName, "Subject", "Passed!");
            assert.equal(parser.getTableExtensionFields('Appointments').SubjectName.name, "SubjectName", "Passed!");
            assert.equal(parser.getTableExtensionFields('Appointments').SubjectName.type, "Link", "Passed!");
            assert.equal(parser.getTableExtensionFields('Appointments').AppointmentStartDateTime.prettyName, "Start Date/Time", "Passed!");
            assert.equal(parser.getTableExtensionFields('Appointments').AppointmentStartDateTime.name, "AppointmentStartDateTime", "Passed!");
            assert.equal(parser.getTableExtensionFields('Appointments').AppointmentStartDateTime.type, "DateTime", "Passed!");

        });
        QUnit.module("Parser- Translation");
        QUnit.test("Verify Translation fields count", function (assert) {
            assert.equal($.map(parser.getTranslations(), function () {
                return this
            }).length, 234, "Passed!");
        });


        QUnit.test("Verify getTranslation Key and Value", function (assert) {
            var translations = parser.getTranslations();
            assert.equal(translations["CHP.Opportunity.UI.Identification.UI.DataField.OpportunityName"], "Name", "Passed!");

        });


        QUnit.test("Verify Translation key and value", function (assert) {
            var OpportunityLabel = $(parser.annotations).find("Annotations[Target='CHP.Opportunity'] Annotation[Term='UI.Identification'] Record PropertyValue[Property='Label'][String='Name']");
            var OpportunityLabelTranslatedObject = parser.getLabelKey(OpportunityLabel, true);

            assert.equal(OpportunityLabelTranslatedObject.path, "CHP.Opportunity.UI.Identification.UI.DataField.OpportunityName", "Verfiy key");
            assert.equal(OpportunityLabelTranslatedObject.value, "Name", "Verify value");

            parser.getLabelKey($(parser.annotations).find("Annotations[Target='CHP.OpportunityItem'] Annotation[Term='UI.LineItem'] Record PropertyValue[Property='Label'][String=Quantity]"), true);
        });
        QUnit.test("Verify Translation key and value (Path form AnnotationPath)", function (assert) {
            var $productsLabel = $(parser.annotations).find("Annotations[Target='CHP.Lead'] Annotation[Term='UI.Facets']  Record PropertyValue[Property='Label'][String=Products]");
            var productsLabelTranslatedObject = parser.getLabelKey($productsLabel, true);
            assert.equal(productsLabelTranslatedObject.path, "CHP.Lead.UI.Facets.UI.RefenceFacet.LeadItem.UI.LineItem", "Verfiy key");
            assert.equal(productsLabelTranslatedObject.value, "Products", "Verify value");

        });

        QUnit.test("Verify Translation key and value (Path form Function odata.concat)", function (assert) {
            var $quantityLabel = $(parser.annotations).find("Annotations[Target='CHP.OpportunityItem'] Annotation[Term='UI.LineItem'] Record PropertyValue[Property='Label'][String=Quantity]");
            var quantityLabelTranslatedObject = parser.getLabelKey($quantityLabel, true);
            assert.equal(quantityLabelTranslatedObject.path, "CHP.OpportunityItem.UI.LineItem.UI.DataField.Quantity.QuantityUnitofMeasure", "Verfiy key");
            assert.equal(quantityLabelTranslatedObject.value, "Quantity", "Verify value");

        });
        
        QUnit.test("Verify Translation key and value (plural path)", function (assert) {
            var $plural = $(parser.annotations).find("Annotations[Target='CHP.Partner'] Annotation[Term='UI.HeaderInfo'] Record PropertyValue[Property='TypeNamePlural']");
            var pluralTranslatedObject = parser.getPluralKey($plural, true);
            assert.equal(pluralTranslatedObject.path, "CHP.Partner.UI.HeaderInfo.TypeNamePlural.Name", "Verfiy key");
            assert.equal(pluralTranslatedObject.value, "Partners", "Verify value");
        });

        QUnit.test("Verify Translation key and value (plural path with no PropertyValue)", function (assert) {
            var $plural = $(parser.annotations).find("Annotations[Target='CHP.Lead'] Annotation[Term='UI.HeaderInfo'] Record PropertyValue[Property='TypeNamePlural']");
            var pluralTranslatedObject = parser.getPluralKey($plural, true);
            assert.equal(pluralTranslatedObject.path,  "CHP.Lead.UI.HeaderInfo.TypeNamePlural", "Verfiy key");
            assert.equal(pluralTranslatedObject.value, "Leads", "Verify value");
        });



        QUnit.module("Parser - getIdentificationInfo");
        QUnit.test("Verify getIdentificationInfo method", function (assert) {
            var identificationInfo = parser.getIdentificationInfo(parser.getBusinessObject("Opportunity"));
            assert.equal(identificationInfo.length, 15, 'Passed!!');
            $.each(identificationInfo, function () {
                if (this.path == 'OpportunityName') {
                    assert.equal(this.titleKey, "CHP.Opportunity.UI.Identification.UI.DataField.OpportunityName", 'Passed!!');
                }
            })
        });
        
        QUnit.module("Parser - getHeaderInfo");
        QUnit.test("Verify getHeaderInfo method", function (assert) {
            var headerInfo = parser.getHeaderInfo(parser.getBusinessObject("Opportunity"));
            assert.equal(headerInfo.title, "CHP.Opportunity.UI.HeaderInfo.TypeNamePlural.OpportunityName", 'Passed!!');
            assert.equal(headerInfo.description, "CHP.Opportunity.UI.HeaderInfo.TypeNamePlural.OpportunityName", 'Passed!!');
            assert.equal(headerInfo.singularTitle, "CHP.Opportunity.UI.HeaderInfo.TypeName.OpportunityName", 'Passed!!');
        }); 
        
        QUnit.module("Parser - getFacetsInfo");
        QUnit.test("Verify getFacetsInfo method", function (assert) {
            var facetsInfo = parser.getFacetsInfo(parser.getBusinessObject("Opportunity"));
            assert.equal(facetsInfo[0].label, "CHP.Opportunity.UI.Facets.UI.RefenceFacet.OpportunityItem.UI.LineItem", 'Passed!!');
        }); 
        
        QUnit.module("Parser - getCreatableFacets");
        QUnit.test("Verify getCreatableFacets method", function (assert) {
            var creatableFacets = parser.getCreatableFacets();
            assert.equal(creatableFacets['AccountAddress'], true, 'Passed!!');
            assert.equal(!!creatableFacets['AppointmentAddress'], false, 'Passed!!');
        }); 
        
        QUnit.module("Parser - getAvailableBO");
        QUnit.test("Verify getAvailableBO method", function (assert) {
            var availableBos = parser.getAvailableBO("create");
            assert.equal(availableBos[0].id, "Partner", 'Passed!!');
            
            availableBos = parser.getAvailableBO("details");
            assert.equal(availableBos[0].id, "Partner", 'Passed!!');
            
            availableBos = parser.getAvailableBO("table");
            assert.equal(availableBos.length, 4, 'Passed!!');
            assert.equal(availableBos[0].id, "Opportunity", 'Passed!!');
            assert.equal(availableBos[1].id, "Lead", 'Passed!!');
            assert.equal(availableBos[2].id, "Appointments", 'Passed!!');
            assert.equal(availableBos[3].id, "Task", 'Passed!!');
            
            availableBos = parser.getAvailableBO("massCreator");
            assert.equal(availableBos.length, 5, 'Passed!!');
        }); 
        
        QUnit.module("Parser - getBosTree");
        QUnit.test("Verify getBosTree method", function (assert) {
            var bosTree = parser.getBosTree();
            assert.ok(bosTree.Task.create, 'Passed!!');
            assert.ok(bosTree.Task.table, 'Passed!!');
            assert.ok(bosTree.Task.details, 'Passed!!');
            
            assert.ok(bosTree.Opportunity.create, 'Passed!!');
            assert.ok(bosTree.Opportunity.table, 'Passed!!');
            assert.ok(bosTree.Opportunity.details, 'Passed!!');
            
            assert.ok(bosTree.Partner.create, 'Passed!!');
            assert.ok(!bosTree.Partner.table, 'Passed!!');
            assert.ok(bosTree.Partner.details, 'Passed!!');
        });
        
        
        
    }
})();

