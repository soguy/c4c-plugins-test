function DateField(field) {
    Field.call(this,field);
}

DateField.prototype ={
    getMarkup: function(){
        return '<DatePicker class="sap-datepicker" enabled="' + this.isEnabled + '" value="{path:' + "'/" + this.fieldName + "'" + ', type:' + "'" + 'sap.ui.model.type.Date' + "'" + ', formatOptions: { style: ' + "'medium'" + ', strictParsing: true}}" id="' + this.id + '" displayFormat="long"/>';
    },
    getBindedMarkup: function(prefix){
        return '<DatePicker class="sap-datepicker" enabled="' + this.isEnabled + '" dateValue="{path:\'' + prefix + "/" + this.fieldName + "'" + ', formatter:\'.fnDateTimeFormatter\'}" id="' + this.id + '" displayFormat="long" name="' + this.fieldName + '" change="handleDateChange"/>';
    }
};

extendClass(DateField,Field);