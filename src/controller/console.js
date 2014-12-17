'use strict';

angular.module('ca.console')


.controller('ConsoleController', function($scope, $document, $element){

    $scope.style = {};

    $scope.classes = {
        "0" : ['log'],
        "2" : ['info'],
        "4" : ['warn'],
        "16" : ['error'],
        "128" : ['data-in'],
        "256" : ['data-out']
    };

    $scope.logs = [];

    $scope.init = function() {

        var startX = $element.offset().left, 
            startY = $element.offset().top, 
            x = startX,
            y = startY;

        $element.find('.ca-console-move').on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          startX = event.screenX - x;
          startY = event.screenY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
          y = event.screenY - startY;
          x = event.screenX - startX;
          $element.css({
            top: y + 'px',
            left:  x + 'px'
          });
        }

        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
    };

    $scope.show = function(){
        $element.show();
    };
    
    $scope.hide = function(){
        $element.hide();
    };

    $scope.option = function(option, value) {

    };
    
});