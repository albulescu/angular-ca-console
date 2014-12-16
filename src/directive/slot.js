'use strict';

angular.module('ca.schedule')

.directive('scheduleSlot', function( $parse ){

    return {
        restrict : 'A',
        require: ['^schedule'],
        link: function(ngRepeatScope, element, attributes, controllers) {
            
            var schedule = controllers[0],
                availability = schedule.$scope.availability,
                slot = $parse(attributes.scheduleSlot)(ngRepeatScope),
                date = slot[0],
                time = slot[1];
            
            if(!availability || !angular.isArray(availability)) {
                return schedule.setupAvailableSlot(element, date, time, attributes);
            }

            for (var i = 0; i < availability.length; i++) {
                var av = availability[i];
                if( av.date.format('Y-d-m') === date.format('Y-d-m') && 
                    schedule.timeAvailable(av.hours, time.minutes) ) {
                    //add available class                    
                    schedule.setupAvailableSlot(element, date, time, attributes);
                    break;
                }
            }
        }
    };
});
