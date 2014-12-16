angular.module('demo', ['ca.console'])


.controller('DemoConsoleController', function($scope){

})


.config(function($consoleProvider){
    $consoleProvider.showPassword('asd');
});