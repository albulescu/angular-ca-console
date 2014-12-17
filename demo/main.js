angular.module('demo', ['ca.console'])


.controller('DemoConsoleController', function( $scope,$console ){

    $scope.console = $console;

    $console.show();
/*
    $console.error('adas');
    $console.show();

    $console.hide();

    $console.command('command', function(a, b){

    });

    $console.exec('command', 1, 2);

    $console.option($console.SHOW_TIME, true);

    $console.options({});

    $console.move(10,10);

    $console.resize(500, 200);*/
})

.config(function($consoleProvider){

    $consoleProvider.showPassword('asd');

    $consoleProvider.position('TR');

    $consoleProvider.overrideBrowserConsole();
});