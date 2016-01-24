function DateTimeField(field) {
    Field.call(this,field);
}

DateTimeField.prototype ={
    getMarkup: function(){
        return '<DateTimeInput class="sap-datetimepicker" enabled="' + this.isEnabled + '" type="DateTime" value="{path:' + "'/" + this.fieldName + "'" + '}" id="' + this.id + '"/>';
    },
    getBindedMarkup: function(prefix){
        return '<DateTimeInput class="sap-datetimepicker" enabled="' + this.isEnabled + '" type="DateTime" dateValue="{path:\'' + prefix + "/" + this.fieldName + "'" + ', formatter:\'.fnDateTimeFormatter\'}" id="' + this.id + '" name="' + this.fieldName + '" change="handleDateChange"/>';
    }
};

extendClass(DateTimeField,Field);