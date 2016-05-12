'use strict';

(function($) {
    // jQuery Plugin to provide a swipable tile feature
    $.swipeToDismissCard = function(element, settings) {
        // Default settings
        var default_settings = {
            "REMOVE_TILE_THRESHOLD": 0.9,
            "SCREEN_X_THRESHOLD": 0.1,
            "BOUNCE_BACK_SPEED": 8,
            "onRemoved": $.noop
        };

        // Boilerplate assignments to make life easier
        var thisPlugin = this;
        var $element = $(element);

        // "Constructor" method called when plugin is instantiated
        thisPlugin.init = function() {
            // Merge default and user applied settings
            thisPlugin.settings = $.extend(default_settings, settings);

            // Validate a function was passed in for onRemoved
            if ($.isFunction(thisPlugin.settings.onRemoved)) {
                thisPlugin.onRemoved = thisPlugin.settings.onRemoved;
            }

            // Initialize object parameters with values
            thisPlugin.target = null;
            thisPlugin.targetBCR = null;
            thisPlugin.startX = 0;
            thisPlugin.currentX = 0;
            thisPlugin.screenX = 0;
            thisPlugin.targetX = 0;
            thisPlugin.cardIsMoving = false;

            // Inform browser of animation update and update the animation before the next repaint
            window.requestAnimationFrame(update);

            // Generate event listeners for relevant touch and mouse events
            $element.on('touchstart mousedown', onStart);
            $element.on('touchmove mousemove', onMove);
            $element.on('touchend mouseup', onEnd);
        }

        // When touch/mouse event initializes
        var onStart = function(evt) {
            // If target exists, skip
            if (thisPlugin.target) {
                return;
            }

            // Set target
            thisPlugin.target = evt.target;
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
            thisPlugin.targetBCR = thisPlugin.target.getBoundingClientRect();
            // PageX is the horizontal coordinate of the event relative to the whole document
            thisPlugin.startX = evt.pageX || evt.touches[0].pageX;
            thisPlugin.currentX = thisPlugin.startX;
            thisPlugin.cardIsMoving = true;

            // Inform browser we intend to transform element -- for optimization
            $element.addClass('will-change', 'transform');

            // Prevent propagation
            evt.preventDefault();
        }

        // When touch/mouse event moves tile
        var onMove = function(evt) {
            // If target doesn't exist, skip
            if (!thisPlugin.target) {
                return;
            }
            
            // Calculate the current X position
            thisPlugin.currentX = evt.pageX || evt.touches[0].pageX;
        }

        // When touch/mouse event stops moving tile
        var onEnd = function(evt) {
            // If there's no target, don't process
            if (!thisPlugin.target) {
                return;
            }
          
            // Set target elements X location to zero unless the distance moved
            // is greater than the calculated distance threshold
            thisPlugin.targetX = 0;
            var distance = thisPlugin.currentX - thisPlugin.startX;
            var threshold = thisPlugin.targetBCR.width * thisPlugin.settings.REMOVE_TILE_THRESHOLD;
            var tBCRWidth = thisPlugin.targetBCR.width;
            if (Math.abs(distance) > threshold) {
                thisPlugin.targetX = (distance > 0) ? tBCRWidth : -tBCRWidth;
            }
            thisPlugin.cardIsMoving = false;
        }

        // Update the animation per the objects parameters
        var update = function() {
            // Must call requestAnimationFrame() to animate another frame at the next repaint
            window.requestAnimationFrame(update);

                  // If there's no target element selected, do not update anything
            if (!thisPlugin.target) {
                return;
            }

            // Update screenX position according to whether or not tile is moving
            if (thisPlugin.cardIsMoving) {
                thisPlugin.screenX = thisPlugin.currentX - thisPlugin.startX;
            } else {
                thisPlugin.screenX += (thisPlugin.targetX - thisPlugin.screenX) / thisPlugin.settings.BOUNCE_BACK_SPEED;
            }
            
            // Decrease opacity while swiping card away
            var normDist = Math.abs(thisPlugin.screenX) / thisPlugin.targetBCR.width;
            var opacity = 1 - Math.pow(normDist, 3);
            $element.css('opacity', opacity);

            // Move the tile with a CSS transform
            $element.css('transform', 'translateX(' + thisPlugin.screenX + 'px)');

            // Escape if tile is still moving; doesn't need to be removed or reset yet
            if (thisPlugin.cardIsMoving) {
                return;
            }

            // Reset tile if hasn't passed removal threshold distance, or remove tile
            if (Math.abs(thisPlugin.screenX) < thisPlugin.settings.SCREEN_X_THRESHOLD) {
                reset();
            } else if (Math.abs(thisPlugin.targetX) === thisPlugin.targetBCR.width) {
                thisPlugin.onRemoved($element);
                $element.remove();
                thisPlugin.target = null;
            }
        }

        var reset = function() {
            // Inform browser we will animate back to original location and remove CSS transform
            $element.css('will-change', 'initial');
            $element.css('transform', 'none');
            
            // We no longer have a target to process
            thisPlugin.target = null;
        }

        // Initialize the plugin
        thisPlugin.init();
    }

    // Add plugin to jQuery.fn object
    $.fn.swipeToDismissCard = function(settings) {
        return this.each(function() {
            // Prevent multiple instantiations
            if ($(this).data('swipeToDismissCard') === undefined) {
                var plugin = new $.swipeToDismissCard(this, settings);
                $(this).data('swipeToDismissCard', plugin);
            }
        });
    }
})(jQuery);

