function ComplexFields(field, fields) {
    
    var isRequired = function(fields) {
        var i = 0;
        for (i = 0; i < fields.length; i++) {
            if (fields[i].required) {
                //atleast one field is required
                return false;
            }
        }
        
        //all fields are not required
        return false;
    };
    
    field.required = isRequired(fields);
    
    Field.call(this,field);
    this.fields = fields;
}

ComplexFields.prototype ={
    getMarkup:function(){
        var res = [],
            i;
            
        res.push('<l:HorizontalLayout class="create-horizontal">');     
        
        for (i = 0; i < this.fields.length; i++) {
            res.push(this.fields[i].getMarkup());
        }
        
        res.push('</l:HorizontalLayout>'); 
        
        return res.join("");
    },
    
    getMarkupWithSelectedValue:function(){
        var res = [],
            i;
            
        res.push('<l:HorizontalLayout class="create-horizontal">');     
        
        for (i = 0; i < this.fields.length; i++) {
            if(this.fields[i] instanceof ComboBox){
                 res.push(this.fields[i].getMarkupWithSelectedValue());
            }
            else{
                res.push(this.fields[i].getMarkup());
            }
        }
        
        res.push('</l:HorizontalLayout>'); 
        
        return res.join("");
    },
    
    getBindedMarkup:function(prefix){
        var res = [],
            i;
            
        res.push('<l:HorizontalLayout class="create-horizontal">');     
        
        for (i = 0; i < this.fields.length; i++) {
            res.push(this.fields[i].getBindedMarkup(prefix));
        }
        
        res.push('</l:HorizontalLayout>'); 
        
        return res.join("");
    }
};

extendClass(ComplexFields, Field);