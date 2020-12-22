define(['plugins/router', 'durandal/app', 'helpers/loginHelper'], function(router, app, loginHelper) {

    var _initialized = false;

    var context = {
        use: use,
        initialize: initialize,
        getCurrentUser: getCurrentUser,
        user: new UserContext(),
        clear: clear
    };
    
    return context;

    function UserContext() {
        this.account = null;
        this.email = '';
        this.username = '';
        this.keepMeLoggedIn = false;
    }

    function getCurrentUser() {
        return (context.user.email || context.user.account) && context.user.username ? context.user : null;
    }

    function use(userInfoProvider) {
        if(!userInfoProvider) {
            return;
        }
        var accountId = userInfoProvider.getAccountId(),
            accountHomePage = userInfoProvider.getAccountHomePage(),
            username = userInfoProvider.getUsername();
        if(!accountId || !accountHomePage || !username) {
            return;
        }
        context.user.email = accountId;
        context.user.username = username;
        context.user.account = {
            homePage: accountHomePage,
            name: accountId
        };
        _initialized = true;
    }

    function clear() {
        context.user = new UserContext();
    }

    function initialize() {
        return Q.fcall(function () {
            if(_initialized){
                return;
            }
            
            app.on('user:authenticated').then(authenticated);

            var username = loginHelper.username,
                email = loginHelper.email;

            if (username || email) {
                context.user.email = email ? email : '';
                context.user.username = username ? username : '';
            }

            _initialized = true;
        });
    }

    function authenticated(authenticatedUser) {
        context.user.email = authenticatedUser.email;
        context.user.username = authenticatedUser.username;
    }
});