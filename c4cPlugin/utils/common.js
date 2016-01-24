if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F();
        }
    })()
}

function extendClass(t,s){
    t.prototype = $.extend(true,Object.create(s.prototype),t.prototype);
    t.prototype.constructor = t;
}