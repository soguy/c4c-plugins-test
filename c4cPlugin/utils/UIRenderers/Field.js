function Field(field) {
    this.fieldName = field.path || "";
    this.titleKey = field.titleKey;
    this.required = !!field.required;
    this.id = this.fieldName.replace("/",".") + '_' + (this.fieldName === "" ? "field": "") + (Field.prototype.counter++);
    this.isEnabled = typeof(field.isEnabled) === 'undefined' ? true : !!field.isEnabled;
    this.resourceBundle = field.resourceBundle || "i18n";
    this.fieldType =field.fieldType;
}

Field.prototype = {
    counter: 0,
    
    getMarkup:function(){
        return this.tpl;
    },
    
    getLabel:function(){
        return new LabelField({path:this.fieldName,titleKey:this.titleKey, required: this.required,resourceBundle:this.resourceBundle });
    }
};