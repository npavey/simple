define(['durandal/composition'], function (composition) {
    ko.bindingHandlers.toolTip = {
        init: function (element, valueAccessor) {
            var $element = $(element),
               lineWidth = valueAccessor().lineWidth || 4,
               score = valueAccessor().progress || 0,
               masteryScore = valueAccessor().masteryScore,
               centerX = $element.width() / 2,
               centerY = $element.height() / 2,
               radius = valueAccessor().radius || (centerX < centerY ? centerX : centerY - lineWidth / 2 - 1),
               $canvasParent = $element.parent();
            if (masteryScore) {
                var $toolTip = $('<div />')
                    .addClass('mastered-score-tooltip').appendTo($canvasParent);


                var $icon = $('<span> /')
                    .addClass('material-icons')
                    .text('done')
                    .appendTo($toolTip)

               

                var $tootlTipText = $('<span />')
                    .addClass('mastered-score-tooltip-text')
                    .text(getScoreTooltipText(masteryScore, score))
                    .appendTo($toolTip);


                $canvasParent.hover(showTooltip, hideTooltip);
                $toolTip.hover(showTooltip, hideTooltip);

                $canvasParent.focusin(showTooltip);
                $canvasParent.focusout(hideTooltip);

                $toolTip.focusin(showTooltip);
                $toolTip.focusout(hideTooltip);

                updateTooltipPosition();
                
                ko.utils.domData.set(element, 'ko_tooltip', $toolTip);
                ko.utils.domData.set(element, 'ko_tooltip_text', $tootlTipText);

                $(window).on('resize', updateTooltipPosition);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    $toolTip.remove();
                    $(window).off('resize', updateTooltipPosition);
                });
            }

            function showTooltip() {
                $tootlTipText.stop().animate({
                    'opacity': 1,
                    'margin-bottom': '10px'
                }, 200);
            }
            function hideTooltip(event) {
                var e = event.toElement || event.relatedTarget;
                if (e && (e == $canvasParent[0] || e.parentNode == $canvasParent[0] || e == $toolTip[0] || e.parentNode == $toolTip[0])) {
                    return;
                }
                $tootlTipText.stop().animate({
                    'opacity': 0,
                    'margin-bottom': '15px'
                }, 200);
            }

            function updateTooltipPosition() {
                
                var masteryScoreAngle = 2 * Math.PI * (masteryScore / 100) - 0.5 * Math.PI,
                    masteryScoreX = centerX + (Math.cos(masteryScoreAngle) * (radius)),
                    masteryScoreY = centerY - (Math.sin(masteryScoreAngle) * (radius)),
                    tooltipPosX = masteryScoreX - 6,
                    toolTipPosY = masteryScoreY - 6;

                $toolTip.css({
                    'left': tooltipPosX,
                    'bottom': toolTipPosY
                });
            }
        },
        update: function (element, valueAccessor) {
            var score = valueAccessor().progress || 0,
              masteryScore = valueAccessor().masteryScore,
              $toolTip = ko.utils.domData.get(element, 'ko_tooltip'),
              $tootlTipText = ko.utils.domData.get(element, 'ko_tooltip_text');

            if ($tootlTipText) {
                $tootlTipText.text(getScoreTooltipText(masteryScore, score));
            }

            if (score >= masteryScore && $toolTip) {
                $toolTip.addClass('mastered');
            }
        }
    }

    function getScoreTooltipText(mastery, score) {
        var scoreToComplete = mastery - score;
        return scoreToComplete > 0 ? scoreToComplete + '% ' + TranslationPlugin.getTextByKey('[to complete]') : TranslationPlugin.getTextByKey('[completed]');
    }

    composition.addBindingHandler('toolTip');
})