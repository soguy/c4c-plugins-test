function ValueHelpField(valueHelp,field) {
    this.metaData = valueHelp;
    this.metaData.titleKey = field.titleKey;
    Field.call(this,field);
}

ValueHelpField.prototype = {
    getMarkup:function(){
        var markup = '<Input enabled="' + this.isEnabled + '" value="{/'+this.fieldName +'}" id="'+this.id + '" name="' + this.fieldName + '" type="Text" placeholder="" showValueHelp="true" valueHelpRequest="openValueHelpDialog"';
        //> </Input>';
         if(this.required){
             markup = markup + ' liveChange="handleRequiredInputChange"';
        }
        markup = markup + '> </Input>';
        
        return markup;
    },
    getBindedMarkup: function(prefix){
        return  '<Input enabled="' + this.isEnabled + '" value="{'+prefix+'/'+this.fieldName +'}" id="'+this.id + '" name="' + this.fieldName + '" type="Text" placeholder="" showValueHelp="true" valueHelpRequest="openValueHelpDialog"> </Input>';
    }
};

extendClass(ValueHelpField,Field);