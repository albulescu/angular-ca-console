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


    this.$get = function($rootScope, $timeout, $document, $compile, $http, $templateCache) {

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
    };
});