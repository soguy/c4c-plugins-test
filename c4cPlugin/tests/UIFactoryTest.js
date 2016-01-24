(function(){

    var parser =new Parser(null, startTests, mockUrls);
    
    function startTests() {
        var factoryInstance;
      
        factoryInstance = UIFactory(parser, "Opportunity");
    
        QUnit.module( "UIFactory Test" );
    
        QUnit.test( "UIFactory init", function( assert ) {
            assert.ok(typeof factoryInstance !== "undefined", "UIFactory should be defined" ); 
        });
        
        QUnit.test( "UIFactory field1", function( assert ) {
            var field = {
                titleKey: "AccountName",
                path: "AccountName"
            },
                uiField,
                markup,
                label;
            
             uiField = factoryInstance.getField("Opportunity", field);
            
            assert.ok(typeof uiField !== "undefined", "uiField should be defined" );
            assert.ok(uiField.required === true, "AccountName should be required" ); 
            
            markup = uiField.getMarkup();
            
            assert.ok(markup.indexOf("<Input") === 0, "uiField markup - Input"); 
            assert.ok(markup.indexOf("value=\"{/AccountName}\"") >= 0, "uiField markup - value"); 
            
            label = uiField.getLabel().getMarkup();
            
            assert.ok(label.indexOf("<Label") === 0, "uiField.label - Label");
            assert.ok(label.indexOf("required=\"true\"") >= 0, "uiField.label - required");
            assert.ok(label.indexOf("text=\"{i18n>AccountName}\"") >= 0, "uiField.label - text");
        });
        
        QUnit.test( "UIFactory field not required", function( assert ) {
            var field = {
                titleKey: "ApprovalStatus",
                path: "ApprovalStatus"
            },
                uiField,
                markup,
                label;
            
             uiField = factoryInstance.getField("Opportunity", field);
            
            assert.ok(typeof uiField !== "undefined", "uiField should be defined" );
            assert.ok(!!uiField.required === false, "ApprovalStatus should not be required" ); 
            
            markup = uiField.getMarkup();
            
            assert.ok(markup.indexOf("<Input") === 0, "uiField markup - Input"); 
            assert.ok(markup.indexOf("value=\"{/ApprovalStatus}\"") >= 0, "uiField markup - value"); 
            
            label = uiField.getLabel().getMarkup();
            
            assert.ok(label.indexOf("<Label") === 0, "uiField.label - Label");
            assert.ok(label.indexOf("required=\"false\"") >= 0, "uiField.label - required");
            assert.ok(label.indexOf("text=\"{i18n>ApprovalStatus}\"") >= 0, "uiField.label - text");
        });
    }
})();

