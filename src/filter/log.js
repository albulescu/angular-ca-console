'use strict';

angular.module('ca.console')

.filter('log', function( $sce ){

    var parse = function( value ) {

        var output = '';

        if( value instanceof Error ) {
            output = value.stack;
        }

        else if( angular.isObject(value) ){
            output = JSON.stringify(value);
        }

        else {
            output = value;
        }

        output = output.replace(/(?:\r\n|\r|\n)/g, '<br/>');

        output = $sce.getTrustedUrl( output );
        
        output = $sce.getTrustedHtml( output );


        return output;
    };

    return function( body ) {
        return body.map(parse).join(',');
    };
});
