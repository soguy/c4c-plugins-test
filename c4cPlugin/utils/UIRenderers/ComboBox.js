function ComboBox(valueHelp,field) {
    this.metaData = valueHelp;
    Field.call(this, field);
    var params = Object.keys(this.metaData.viewParams);
    this.key = params[0];
    this.text = params[1];
    this.bo = this.metaData.BusinessObject.replace(/Collection/, '');
}

ComboBox.prototype = {
    getMarkup: function(){
        return '<ComboBox enabled="' + this.isEnabled + '" name="' + this.fieldName + '" change="handleComboChange" items="{path:\'/' + this.metaData.CollectionPath + '\'}" id="' + this.id + '"><core:Item key="{' + this.key + '}" text="{' + this.text + '}" /></ComboBox>';
    },
    
    getMarkupWithSelectedValue: function(){
        return '<ComboBox enabled="' + this.isEnabled + '" value="{' + '/' + this.metaData.CollectionPath + '/Value}' +'" name="' + this.fieldName + '" change="handleComboChange" items="{path:\'/' + this.metaData.CollectionPath + '\'}" id="' + this.id + '"><core:Item key="{' + this.key + '}" text="{' + this.text + '}" /></ComboBox>';
    },
    
    getBindedMarkup: function(prefix){
        var model = prefix.replace(this.bo, '').replace(/\//, ''),
            //name = this.metaData.CollectionPath.replace(this.bo, '').replace(/Collection/, '');
            name = this.fieldName;
        return '<ComboBox value="{' + prefix + '/' + this.metaData.CollectionPath + 'Value}" name="' + name + '" change="handleComboChange" enabled="' + this.isEnabled + '" items="{path:\'' + prefix + '/' + this.metaData.CollectionPath + '\'}" id="' + this.id + '"><core:Item key="{' + model + this.key + '}" text="{' + model + this.text + '}" /></ComboBox>';  
    }
};

extendClass(ComboBox, Field);