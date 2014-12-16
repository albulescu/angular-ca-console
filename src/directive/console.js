'use strict';

angular.module('ca.console')

.directive('console', function(){

    return {
        restrict    : 'E',
        replace     : true,
        templateUrl : 'ca-console/directive/console.html'
    };
});
