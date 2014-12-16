'use strict';

angular.module('ca.console')


.controller('ConsoleController', function($scope){

    $scope.style = {};

    $scope.init = function() {

        console.log('Init console');
    };
});