/**
* Console AngularJS Module v1.0.0
* https://github.com/albulescu/angular-ca-console
*
* Author Albulescu Cosmin <cosmin@albulescu.ro>
* Licensed under the MIT license.
*/

'use strict';

angular.module('ca.console.templates', []).run(['$templateCache', function($templateCache) {
$templateCache.put('ca-console/directive/console.html',
    "<div class=ca-console ng-init=init() ng-style=style><div class=ca-console-header></div><div class=ca-console-body><ul><li ng-class=classes[log.type] ng-repeat=\"log in logs\">{{log.body}}</li></ul></div><div class=ca-console-command><input ng-model=command ng-keydown=keydown($event)></div><div class=ca-console-move title=\"Move console\"></div><div class=ca-console-close title=\"Close console\" ng-click=hide()></div><div class=ca-console-resize title=\"Resize console\"></div></div>"
  );

}]);


angular.module('ca.console',['ca.console.templates'])

.constant('DEFAULT_SIZE' , [600, 250])

.provider('$console', function(){

    var configuration = {};

    this.overrideBrowserConsole = function() {
        configuration.overrideBrowserConsole = true;
    };

    this.showPassword = function( password ) {
        configuration.showPassword = password;
    };

    this.position = function( position ) {
        configuration.position = position;
    };

    this.$get = ["$rootScope", "$timeout", "$document", "$compile", function( $rootScope, $timeout, $document, $compile ){

        var self;
        var scope;

        var $console = function $console(){

            self = this;

            /**
             * Hide console on blur
             * @type {String}
             */
            this.HIDE_ON_BLUR = 'hideOnBlur';

            /**
             * Enable console animations
             * @type {String}
             */
            this.USE_ANIMATIONS = 'useAnimations';


            var element = document.createElement('console');

            //element.style.display = 'none';

            angular.element('body').append(element);

            var scope = $rootScope.$new(true);

            $compile(element)(scope);

            for( var option in configuration ) {
                //scope.option(option, configuration[option]);
            }


            this.element = element;
        };


        $console.prototype.log = function(){
            this.element.scope().log.apply(
                this.element.scope().log,
                arguments
            );
        };

        $console.prototype.show = function(){
            return (this.console.show||this.console.fadeIn)();
        };


        var clearPasswordInterval,
            passwordChars = [];

        angular.element(document).keypress(function(event){

            passwordChars.push(String.fromCharCode(event.keyCode));

            if( passwordChars.join('') === options.showPassword ) {
                self.show();
            }

            $timeout.cancel(clearPasswordInterval);
            
            clearPasswordInterval = $timeout(function(){
                passwordChars=[];
            }, 3000);
        });


        return new $console();
    }];
});

angular.module('ca.console')


.controller('ConsoleController', ["$scope", "$document", "$element", function($scope, $document, $element){

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
    
}]);

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
