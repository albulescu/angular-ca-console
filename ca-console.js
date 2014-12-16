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
    "<div class=ca-console ng-controller=ConsoleController ng-init=init() ng-style=style><div class=ca-console-header></div><div class=ca-console-body><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div><div>asdada</div></div><div class=ca-console-command><input></div><div class=ca-console-move title=\"Move console\"></div><div class=ca-console-close title=\"Close console\"></div><div class=ca-console-resize title=\"Resize console\"></div></div>"
  );

}]);


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

angular.module('ca.console')


.controller('ConsoleController', ["$scope", function($scope){

    $scope.style = {};

    $scope.init = function() {

        console.log('Init console');
    };
}]);

angular.module('ca.console')

.directive('console', function(){

    return {
        restrict    : 'E',
        replace     : true,
        templateUrl : 'ca-console/directive/console.html'
    };
});
