define(['durandal/composition', 'templateSettings', 'less'], function (composition, templateSettings, less) {
    
        ko.bindingHandlers.circleProgress = {
            update: function(element, valueAccessor) {
    
                var $element = $(element),
                    score = valueAccessor().progress || 0,
                    lineWidth = parseInt($element.css('column-width')) || valueAccessor().lineWidth || 4,
    
                    centerX = element.width / 2,
                    centerY = element.height / 2,
                    radius = valueAccessor().radius || (centerX < centerY ? centerX : centerY - lineWidth / 2 - 1),
                    progress = score / 100,
                    cnxt = element.getContext('2d'),
                    masteryScore = valueAccessor().masteryScore,
                    isMastered = valueAccessor().isMastered;
    
                if (isMastered) {
                    $element.addClass('mastered')
                }

                var colors = {
                    basic: $element.css('color') || valueAccessor().basicColor || getDefaultBasicColor(),
                    progress: $element.css('border-top-color') || $element.css('border-color') || valueAccessor().progressColor || templateSettings.getColorValue('@secondary-color'),
                    mastered: $element.css('outline-color') || valueAccessor().masteredColor || templateSettings.getColorValue('@correct-color')
                };
    
                cnxt.beginPath();
                cnxt.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                cnxt.strokeStyle = colors.basic;
                cnxt.lineWidth = lineWidth;
                cnxt.closePath();
                cnxt.stroke();
    
                if (progress > 0) {
                    cnxt.beginPath();
                    cnxt.strokeStyle = isMastered ? colors.mastered : colors.progress;
    
                    if (progress == 1) {
                        cnxt.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    } else {
                        cnxt.arc(centerX, centerY, radius, 1.5 * Math.PI, (progress * 2 - 0.5) * Math.PI);
                    }
    
                    cnxt.stroke();
                }
    
            }
        };

        function getDefaultBasicColor() {
            var c = new less.tree.Color(templateSettings.getColorValue('@text-color').slice(1));
            var dimension = new less.tree.Dimension('95');
            var func = less.functions.functionRegistry.get('tint');
            return func(c, dimension).toRGB();
        }
    });