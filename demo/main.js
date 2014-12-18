angular.module('demo', ['ca.console'])


.controller('DemoConsoleController', function( $scope,$console ){

    $scope.console = $console;

    $console.command('sum', function(a,b){
        return a + b;
    });

    $console.show();
})

.config(function($consoleProvider){

    $consoleProvider.showPassword('asd');

    $consoleProvider.position('TR');

    $consoleProvider.appendTo('#console-container');
});