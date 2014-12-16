angular.module('ca.console',['ca.console.templates'])

.constant('DEFAULT_SIZE' , [600, 250])

.provider('$console', function(){

    var self = this;

    var options = {};

    this.overrideNative = function() {

    };

    this.showPassword = function( password ) {
        options.password = password;
    };

    this.$get = function(){
        return self;
    };
});