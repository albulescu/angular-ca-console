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
    "<div tabindex=-1 class=\"ca-console ng-cloak\" ng-show=visible ng-init=init() ng-style=style><div class=ca-console-header></div><div class=ca-console-body auto-scroll=true><ul><li ng-class=classes[log.type] ng-repeat=\"log in logs\">{{log.body}}</li></ul></div><div class=ca-console-command><input ng-model=expression ng-keydown=commandKeyDown($event)></div><div class=ca-console-move title=\"Move console\"></div><div class=ca-console-close title=\"Close console\" ng-click=console.hide()></div><div class=ca-console-resize title=\"Resize console\"></div></div>"
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
            messagesListElement = null,
            instance= null,
            commands = {};

        scope.visible   = null;

        scope.style     = {};

        scope.logs      = [];

        scope.expression   = '';

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
                startW = element.width(),
                startH = element.height(),
                dragStartX = 0,
                dragStartY = 0,
                x = startX,
                y = startY;

            element.find('.ca-console-move').on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.screenX - x;
                startY = event.screenY - y;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
                scope.$emit('move.start');
            });

            element.find('.ca-console-resize').on('mousedown', function(event){              
                event.preventDefault();
                startW = element.width();
                startH = element.height();
                dragStartX = event.screenX;
                dragStartY = event.screenY;
                $document.on('mousemove', mouseMoveResize);
                $document.on('mouseup', mouseUpResize);
                scope.$emit('resize.start');
            });

            function mouseMoveResize() {
                instance.resize(startW + ( event.screenX - dragStartX ),
                                startH + ( event.screenY - dragStartY ));
                scope.$emit('resize');
                messagesListElement[0].scrollTop = messagesListElement[0].scrollHeight;
            }

            function mouseUpResize() {
                $document.off('mousemove', mouseMoveResize);
                $document.off('mouseup', mouseUpResize);                
            }

            function mousemove(event) {
                y = event.screenY - startY;
                x = event.screenX - startX;
                element.css({
                    top: y + 'px',
                    left: x + 'px'
                });
                scope.$emit('move',x,y);
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
                scope.$emit('move.complete');
            }
        }

        function createUI() {

            // get template and link element to scope
            $http.get('ca-console/directive/console.html', {
                cache: $templateCache
            }).success(function(html) {

                element = angular.element(html);

                messagesListElement = element.find('.ca-console-body');

                angular.element('body').append(element);

                $compile(element)(scope);

                initUI();
            });
        }

        /* jshint ignore:start */
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
        /* jshint ignore:end */

        function wrapLog( level ) {
            
            return function ConsoleLog() {
                
                var params = Array.prototype.slice.call(arguments);
                
                scope.logs.push({
                    body: params.join(', '),
                    type:level,
                    time:(new Date()).getTime()
                });
            };
        }

        function evalCommandLine( expression ) {

            var matches = expression.match(/^(:[a-zA-Z-_]*)(.*)?$/);

            if(!matches) {
                throw new Error('Invalid expression "'+expression+'"');
            }

            var command = matches[1];
            var paramsExp  = (matches[2] || '').trim();

           var inString=false,
                capture=true,
                group=[],
                param='',
                params = [];

            for (var i = 0; i < paramsExp.length; i++) {
                
                var c = paramsExp[i];

                if( c === '"' || 
                    c === '\'' ) {
                    inString=!inString;
                }

                if( c === ',' && !inString )
                {
                    if( capture && group.length === 0) {
                        throw new Error('Invalid expression. Please remove comma from index ' + i);
                    }

                    capture=!capture;
                }

                if( capture && c !== ' ' ){
                    group.push(c);
                }

                if( c === ',' && !capture && !inString || i === paramsExp.length - 1 ) {
                    
                    try
                    {
                        /* jshint evil:true */
                        param = eval(group.join(''));
                        /* jshint evil:false */
                    } catch(e) {
                        throw new Error('Invalid parameter "'+group.join('')+'"');
                    }

                    params.push(param);
                    group=[];
                    capture=true;
                } 
            }

            params.unshift(command);

            return execCommand.apply(null,params);
        }

        function execCommand() {

            if ( arguments.length === 0 ) {
                throw new Error('ecnr');
            }

            var params = Array.prototype.slice.call(arguments);
            var command = params.shift().substring(1);

            if(!angular.isFunction(commands[command])) {
                throw new Error('Command "'+command+'('+params.join(', ')+')" not found!');
            }

            var fn = commands[command];

            var args = fn.toString().slice(fn.toString().indexOf('(') + 1, fn.toString().indexOf(')'))
                                    .match(/([^\s,]+)/g);

            if( args && args.length > params.length ) {
                throw new Error('Invalid arguments length. Command "'+command+'" has ' + args.length + ' params');
            }

            return fn.apply(instance, params);
        }

        scope.$watch('visible', function watchVisible(state) {
            if (typeof(state) === 'boolean' && !element) {
                createUI();
            }
        });

        scope.commandKeyDown = function(event) {
            if( event.keyCode === 13 ) {
                
                var expression = scope.expression;

                if( expression === '' ) {
                    return;
                }

                scope.expression = '';

                try
                {
                    var output = evalCommandLine(expression);
                    
                    if( angular.isDefined(output) ) {
                        instance.log(output);
                    }
                }
                catch(e) {
                    instance.error( e );
                }
            }
        };

        var Console = function Console() {
            angular.extend(this, Opt);
            scope.console = this;
        };

        Console.prototype.log = function() {
            element.scope().log.apply(
                this.element.scope().log,
                arguments
            );
        };

        Console.prototype.command = function(name, fn, bind) {
            commands[name] = bind ? fn.bind(bind) : fn;
        };

        Console.prototype.exec = function() {
            execCommand.apply(null, arguments);
        };

        Console.prototype.hide = function() {
            scope.visible = false;
            scope.$emit('hide');
        };

        Console.prototype.show = function() {
            scope.visible = true;
            scope.$emit('hide');
        };

        Console.prototype.toggle = function() {
            if (scope.visible) {
                scope.hide();
            } else {
                scope.show();
            }
        };

        Console.prototype.resize = function(w,h) {

            var resized = false;

            if( w > 400 ) {
                scope.style.width = w;
                resized = true;
            }

            if( h > 200 ) {
                scope.style.height = h;
                resized = true;
            }

            scope.$emit('resize.complete');

            try { scope.$digest(); } catch(e) {}

            return resized;
        };

        Console.prototype.log = wrapLog( Opt.LOG_NORMAL );

        Console.prototype.info = wrapLog( Opt.LOG_INFO );

        Console.prototype.warn = wrapLog( Opt.LOG_WARN );

        Console.prototype.error = wrapLog( Opt.LOG_ERROR );

        Console.prototype.on = function( name , listener ) {
            return scope.$on(name, listener);
        };

        Console.prototype.emit = function() {
            return scope.$emit.apply(scope, arguments);
        };


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

        instance = new Console();

        instance.command('level', function( level ){
            instance.log('Set log level to ' + level);
        });

        instance.command('hide', function(){
            instance.hide();
        });

        instance.command('resize', function(w,h){
            if( this.resize(w, h) ) {
                this.log('Resized to '+w+'x'+h );
            }
        });

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

.directive('autoScroll', ['$timeout', '$q', '$parse', '$log', function( $timeout, $q, $parse, $log ){

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
