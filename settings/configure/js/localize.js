(function (app) {

    app.localize = function (key) {
        return translations[key];
    };

    var translations = {
        'changes are saved': 'All changes are saved',
        'changes are not saved': 'Changes have NOT been saved. Please reload the page and change the settings again. Contact support@easygenerator.com if problem persists.',
        'settings are not initialize': 'Template settings are not initialized. Please reload the page and change the settings again. Contact support@easygenerator.com if problem persists.',

        //general settings tab
        'general settings': 'General Settings',
        'pdf export': 'PDF export (experimental):',
        'show download as pdf button': 'Show button "Download course in PDF format"',
        'conduct learner satisfaction survey': 'Conduct learner satisfaction survey',
        'allow users to download certificates': 'Allow users to download certificates',

        //results tracking tab
        'results tracking': 'Results Tracking',

        'lrs': 'LRS',
        'webhooks': 'Webhooks',

        'chooseLrsLabel': 'Choose LRS <span>(Learning Record Store <a href="https://help.easygenerator.com/results-tracking/results-tracking-via-lrs" target="_blank">Learn more</a>)</span>',
        'default': 'easygenerator (recommended)',
        'custom': 'Custom LRS',

        'addWebhookEndpoinLabel': 'Add a webhook endpoint: <a href="https://help.easygenerator.com/additional-features/webhooks" target="_blank">Learn more</a>',
        'webhookUrlLabel': 'URL to be called',
        'urlCheckButtonText': 'Check URL',
        'checkErrorMessage': 'An error appears',
        'checkSuccessMessage': 'URL successfully reached',

        'track and trace settings': 'Track and trace settings',
        'results tracking option': 'Results tracking:',
        'results tracking hint': '(will not affect tracking and tracing in SCORM/LMS)',
        'allow user to skip option': 'Allow user to skip tracking and tracing:',
        'allow scoring of content pages': 'Allow scoring of content pages:',
        'show confirmation popup': 'Show confirmation dialogue:',
        'show confirmation popup hint': '(when submitting final results)',
        'disabled': 'Disabled',
        'enabled': 'Enabled',
        'allow': 'Allow',
        'forbid': 'Forbid',
        'hide': 'Hide',
        'show': 'Show',
        'advanced settings': 'Advanced settings',
        'report to': 'Report to:',
        'custom lrs settings': 'Custom LRS settings',
        'lrs url': 'LRS URL',
        'authentication required': 'Authentication required',
        'lap login': 'LAP login',
        'lap password': 'LAP password',
        'use statements': 'Use statements:',
        'started': 'Started',
        'stopped': 'Stopped',
        'passed': 'Passed',
        'answered': 'Answered',
        'mastered': 'Mastered',
        'experienced': 'Experienced',
        'failed': 'Failed',
        'progressed': 'Progressed',
        'save progress cross device': 'Save progress cross device (requires login and password):',
        'save progress cross device hint': '(will not affect progress saving in SCORM/LMS)',
        'allow social media': 'Allow login via social media',
        'authorsBioTooltip': 'This information will be shown to learners on the introduction page <a href="http://help.easygenerator.com/getting-started/billing-info-and-account-settings" target="blank" >Learn more</a>',
        'about the author block:': '\'About the author\' block:',
        'show about the author block on the introduction course page': 'The \'About the author\' block on the introduction course page',
        'information is taken from your profile settings': '(NOTE: the information is taken from your  <a href="/#accountsettings" target="_parent">profile settings</a>)',

        //mastery score
        'mastery score settings': 'Mastery score settings',
        'mastery score caption': 'Mastery score:',
        'mastery score hint': '(for each learning objective):',
        'mastery score will for': 'Mastery score will be set:',
        'mastery score means' : 'Mastery score is the score learners have to reach to pass the course successfully',
        'overall course caption' : 'For the entire course',
        'mastery score' : 'Mastery score:',
        'each section caption' : 'For each section',

        //template language
        'template language': 'Template language',

        'xx': 'Custom',
        'cn': 'Chinese',
        'de': 'German',
        'da':'Danish',
        'en': 'English',
        'fr': 'French',
        'it': 'Italian',
        'nl': 'Dutch',
        'nl-inf': 'Dutch (informal)',
        'tr': 'Turkish',
        'ua': 'Ukrainian',
		'es': 'Spanish',
		'pt-br': 'Portuguese (Brazil)',
		'ru': 'Russian',
		'ms': 'Malay',
		'kr': 'Korean',
		'nb-no': 'Norwegian (Bokmal)',
		'nn-no': 'Norwegian (Nynorsk)',
        'vi': 'Vietnamese',
        'fa': 'Farsi',
        'sv': 'Swedish',
        'pl': 'Polish',
        'kin': 'Kinyarwanda',
        'ca': 'Catalan',
        'ar': 'Arabic',
        'ro': 'Romanian',
        'cs': 'Czech',
        'fi': 'Finnish',
        'el': 'Greek',
        'lv': 'Latvian',
        'hu': 'Hungarian',

        'choose language for your course': 'Choose language for your course',
        'defaultText': 'Default',
        'translation': 'Translation',
        'copyright text': 'Copyright text:',
        'copyrightPlaceholder': 'Copyright © {year} Easygenerator'
    };

})(window.app = window.app || {});
