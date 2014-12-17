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

    this.$get = function( $rootScope, $timeout, $document, $compile ){

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
    };
});