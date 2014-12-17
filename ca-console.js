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
    "<div tabindex=-1 class=\"ca-console ng-cloak\" ng-show=visible ng-init=init() ng-style=style><div class=ca-console-header></div><div class=ca-console-body auto-scroll=true><ul><li ng-class=classes[log.type] ng-repeat=\"log in logs\">{{log.body}}</li></ul></div><div class=ca-console-command><input ng-model=command ng-keydown=keydown($event)></div><div class=ca-console-move title=\"Move console\"></div><div class=ca-console-close title=\"Close console\" ng-click=console.hide()></div><div class=ca-console-resize title=\"Resize console\"></div></div>"
  );

}]);


angular.module('ca.console', ['ca.console.templates'])

.constant('DEFAULT_SIZE', [600, 250])

.provider('$console', function() {

    var config = {};

    this.overrideBrowserConsole = function() {
        config.overrideBrowserConsole = true;
    };

    this.showPassword = function(password) {
        config.showPassword = password;
    };

    this.position = function(position) {
        config.position = position;
    };

    this.appendTo = function(appendTo) {
        config.appendTo = appendTo;
    };

    this.logLevel = function( logLevel ) {
        config.logLevel = logLevel;
    };


    this.$get = ["$rootScope", "$timeout", "$document", "$compile", "$http", "$templateCache", function($rootScope, $timeout, $document, $compile, $http, $templateCache) {

        var Opt = {

            /**
             * Hide console on blur
             * @type {String}
             */
            HIDE_ON_BLUR    : 'hideOnBlur',

            /**
             * Enable console animations
             * @type {String}
             */
            USE_ANIMATIONS  : 'useAnimations',

            LOG_NORMAL      : 1,
            LOG_INFO        : 2,
            LOG_DEBUG       : 4,
            LOG_WARN        : 8,
            LOG_ERROR       : 16,
            LOG_ALL         : 32
        };

        var scope = $rootScope.$new(true),
            element = null,
            readyFn = angular.noop,
            isReady = false,
            commands = {};

        scope.visible   = null;

        scope.style     = {};

        scope.logs      = [];

        scope.command   = '';

        scope.filter    = '';

        scope.flags     = 1;

        scope.classes   = {
            '1' : 'log',
            '2' : 'info',
            '4' : 'debug',
            '8' : 'warn',
            '16' : 'error'
        };

        function initUI() {

            var startX = element.offset().left,
                startY = element.offset().top,
                x = startX,
                y = startY;

            element.find('.ca-console-move').on('mousedown', function(event) {
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
                element.css({
                    top: y + 'px',
                    left: x + 'px'
                });
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }
        }

        function createUI() {

            // get template and link element to scope
            $http.get('ca-console/directive/console.html', {
                cache: $templateCache
            }).success(function(html) {

                element = angular.element(html);

                angular.element('body').append(element);

                $compile(element)(scope);

                initUI();
            });
        }

        function flaged(flags,mask) {
            return mask === (flags & mask);
        }

        function flag( flags, mask, value ) {

            if( value ) {
                if( (flags & mask) === mask ) {
                    return flags;
                }
                flags |= mask;
            } else {
                if ((flags & mask) === 0) {
                    return flags;
                }
                flags &= ~mask;
            }
            return flags;
        }

        function wrapLog( level ) {
            
            return function $consoleLog() {
                var params = Array.prototype.slice.call(arguments);
                scope.logs.push({
                    body: params.join(', '),
                    type:level,
                    time:(new Date()).getTime()
                });
                scope.$digest();
            };
        }

        scope.$watch('visible', function watchVisible(state) {
            if (typeof(state) === 'boolean' && !element) {
                createUI();
            }
        });

        var $console = function $console() {
            angular.extend(this, Opt);
            scope.console = this;
        };

        $console.prototype.log = function() {
            element.scope().log.apply(
                this.element.scope().log,
                arguments
            );
        };

        $console.prototype.command = function(name, fn, bind) {
            commands[name] = bind ? fn.bind(bind) : fn;
        };

        $console.prototype.exec = function() {

            if (arguments.length === 0) {
                throw new Error('ecnr');
            }

            var params = Array.prototype.slice.call(arguments);
            var command = commands[params.shift()] || angular.noop;

            command.apply(undefined, params);
        };

        $console.prototype.hide = function() {
            scope.visible = false;
        };

        $console.prototype.show = function() {
            scope.visible = true;
        };

        $console.prototype.toggle = function() {
            scope.visible = !scope.visible;
        };

        $console.prototype.log = wrapLog( Opt.LOG_NORMAL );

        $console.prototype.info = wrapLog( Opt.LOG_INFO );

        $console.prototype.warn = wrapLog( Opt.LOG_WARN );

        $console.prototype.error = wrapLog( Opt.LOG_ERROR );


        var clearPasswordInterval,
            passwordChars = [];

        angular.element(document).keypress(function(event) {

            passwordChars.push(String.fromCharCode(event.keyCode));

            if (passwordChars.join('') === config.showPassword) {
                scope.show();
            }

            $timeout.cancel(clearPasswordInterval);

            clearPasswordInterval = $timeout(function() {
                passwordChars = [];
            }, 3000);
        });

        var instance = new $console();

        if( config.overrideBrowserConsole ) {

            console.log   = instance.log;
            console.info  = instance.info;
            console.debug = instance.debug;
            console.error = instance.error;
            console.warn  = instance.warn;
        }

        if( config.logLevel ) {
            scope.flags = config.logLevel;
        }

        return instance;
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

        $scope.$watch('name', function( name ){
            
            if(angular.isDefined($scope.$parent.name)) {
                throw new Error('The property "'+name+'" already defined on console parent scope');
            }

            $scope.$parent.name = $scope;

            $scope.$parent.$emit('console.ready', $scope, name);
        });
    };

    $scope.show = function(){
        $element.show();
    };
    
    $scope.hide = function(){
        $element.hide();
    };
    
    $scope.toggle = function(){
        $element.toggle();
    };

    $scope.option = function(option, value) {

    };
    
}]);

angular.module('ca.console')

.directive('autoScroll', ["$timeout", "$q", "$parse", "$log", function( $timeout, $q, $parse, $log ){

    return {
        restrict : 'A',
        link : function(scope, element, attributes) {

            if( element.css('overflow') !== 'auto' ) {
                return $log.warn('Element is not scrollable. Auto scroll has no sense!');
            }

            // user scope flag to enable/disable scrolling.
            // this will override the internal flag
            var externalAutoScroll = scope.$eval(attributes.autoScroll);

            // internal flag for autoscroll to be anabled or disabled
            var autoscroll = externalAutoScroll || true;

            // timer used to avoid trigger scroll event for multiple 
            // nodes added added on current frame

            var updateTimeout;

            var AutoScrollEvent = function(element) {
                
                var defaultPrevented = false;

                this.target = element;

                this.preventDefault = function(){
                    defaultPrevented = true;
                };

                this.isDefaultPrevented = function() {
                    return defaultPrevented;
                };
            };

            /**
             * Event to enable internal scrolling flag
             */
            scope.$on('$enableAutoScroll', function(){
                
                if(!autoscroll) {
                    $log.info('Enable autoscroll');
                }

                autoscroll=true;
            });

            /**
             * Event to enable internal scrolling flag
             */
            scope.$on('$disableAutoScroll', function(){
                
                if(autoscroll) {
                    $log.info('Disable autoscroll');
                }

                autoscroll=false;
            });

            /**
             * Listen for wheel events to disable autoscroll
             * when user scrolls up. The autoscrolling event 
             * will be enabled when scroll to bottom
             */
            element.on('wheel', function(event){

                var delta = event.originalEvent.detail? 
                            event.originalEvent.detail*(-120) : 
                            event.originalEvent.wheelDelta;
                
                if( delta > 0 ) {
                    autoscroll = false;
                    return;
                }

                if( element.get(0).scrollTop >= element.get(0).scrollHeight - element.height()) {
                    autoscroll = true;
                }
            });

            /**
             * Listen for all nodes added to this element
             * and on the next frame update mouse position
             */
            element.on('DOMNodeInserted', function( event ){

                var whatsNew = event.srcElement||event.target/*firefox*/;
                var container = event.delegateTarget;

                if( whatsNew.nodeType === 1 &&
                    autoscroll === true && 
                    externalAutoScroll === true)
                {
                    //cancel last update scroll position timeout
                    $timeout.cancel(updateTimeout);

                    //create new update scroll position timeout
                    updateTimeout = $timeout(function(){

                        //create event for auto-scroll-trigger parameter
                        var event = new AutoScrollEvent(element);
                        var locals = { $event : event };
                        
                        // fire callback
                        var fn = $parse(attributes.autoScrollTrigger)||angular.noop;
                        var promise = fn(scope, locals);

                        if( promise ) {
                            $q.when(promise).then(function(){
                                container.scrollTop = container.scrollHeight;
                            });
                        }

                        if(!event.isDefaultPrevented()) {
                            container.scrollTop = container.scrollHeight;
                        }
                    });
                }
            });
        }
    };
}]);

angular.module('ca.console')

.directive('console', function(){

    return {
        restrict    : 'EA',
        scope       : { name : '@' },
        controller  : 'ConsoleController',
        templateUrl : 'ca-console/directive/console.html'
    };
});
