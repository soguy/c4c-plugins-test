function LabelField(field) {
    Field.call(this,field);
}

LabelField.prototype ={
    counter:0,
    
    getMarkup:function(){
        return '<Label required="'+this.required+'" text="{' + this.resourceBundle  + '>'+this.titleKey+'}" ></Label>';
    }
};
extendClass(LabelField,Field);