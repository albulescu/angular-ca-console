'use strict';

angular.module('ca.console')

.directive('console', function(){

    return {
        restrict    : 'EA',
        scope       : { name : '@' },
        controller  : 'ConsoleController',
        templateUrl : 'ca-console/directive/console.html'
    };
});
