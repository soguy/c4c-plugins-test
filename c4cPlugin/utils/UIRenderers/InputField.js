function InputField(field) {
    Field.call(this,field);
}

InputField.prototype ={
    getMarkup:function(){
        var markup = '<Input enabled="' + this.isEnabled + '" value="{/'+this.fieldName +'}" id="'+this.id;
        if(this.fieldType === "Edm.Decimal"){
            markup = markup + '" type="Number" valueStateText="{i18n_Static>starterDetailsPage.details.Number.valueStateText}';
        }
        if(this.required || this.fieldType === "Edm.Decimal"){
             markup = markup + '" liveChange="handleRequiredInputChange';
        }
        markup = markup + '"> </Input>';
        
        return markup;
    },
    getBindedMarkup: function(prefix){
        var markup = '<Input enabled="' + this.isEnabled + '" value="{' + prefix + '/' + this.fieldName + '}" id="'+this.id;
        if(this.fieldType === "Edm.Decimal"){
            markup = markup + '" type="Number" valueStateText="{i18n_Static>starterDetailsPage.details.Number.valueStateText}';
        }
        if(this.required || this.fieldType === "Edm.Decimal"){
             markup = markup + '" liveChange="handleRequiredInputChange';
        }
         markup = markup + '"> </Input>';
         
         return markup;
        
      }
};

extendClass(InputField,Field);