'use strict';

angular.module('ca.console')

.directive('console', function(){

    return {
        restrict    : 'E',
        replace     : true,
        scope       : true,
        controller  : 'ConsoleController',
        templateUrl : 'ca-console/directive/console.html'
    };
});
