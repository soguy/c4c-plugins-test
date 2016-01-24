function FileUpload(field) {
    Field.call(this, field);
}

FileUpload.prototype ={
    getMarkup:function(){
        var markup = '<u:FileUploader enabled="' + this.isEnabled + '" change="handleFileSelect" width="250px" />';
        
        return markup;
    },
    getBindedMarkup: function(prefix){
        return '<u:FileUploader enabled="' + this.isEnabled + '" change="handleFileSelect" width="250px" />';
    }
};

extendClass(FileUpload, Field);