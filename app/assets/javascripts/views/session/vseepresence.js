function VSeePresence() {
    var me = this;

    me.setupJQuery();

    // INIT PubNub
    me.pubnub = PUBNUB.init({
        origin:         'vsee.pubnub.com',
        ssl:            true,
        subscribe_key:  'sub-3ba4407a-87bf-11e0-82c9-4332c488444f'
    });

    me.pubnub.ready();
}

VSeePresence.prototype = {
    debug: false,
    pubnub: null,
    jqueryPluginName: 'vsee',
    possibleStates: ['Loading', 'Unknown', 'Available', 'Offline', 'Idle', 'Inacall', 'Busy'],
    timeout: 5,

    subscribers: {},

    log: function(message) {
        if (this.debug && console && console.log) {
            console.log(message);
        }
    },

    subscribe: function(vseeId, presenceUpdateCallback, scope) {
        scope = scope || this;
        vseeId = vseeId.toLowerCase();
        var me = this;

        if (!this.subscribers[vseeId]) {
            me.setUserState(vseeId, 'Loading');
            this.subscribers[vseeId] = [];
            this.internalSubscribe(vseeId, function(state, vseeId) {
                me.setUserState(vseeId, state);
                for (var index=0; index<me.subscribers[vseeId].length; ++index) {
                    var subConfig = me.subscribers[vseeId][index];
                    subConfig.callback.apply(subConfig.scope, [state, vseeId]);
                    me.log("Applying (" + vseeId + "/" + state + ")> " + JSON.stringify(subConfig));
                }
            }, this);
        }

        this.subscribers[vseeId].push({
            callback: presenceUpdateCallback,
            scope: scope
        });

        if (this.getUserState(vseeId)) {
            presenceUpdateCallback.apply(scope, [this.getUserState(vseeId), vseeId]);
        }
    },

    internalSubscribe: function(vseeId, presenceUpdateCallback, scope) {
        scope = scope || window;
        var me = this;

        var timestamp = -1;
        var callback = function(message) {
            me.log("PUBNUB (" + vseeId + ")> " + JSON.stringify(message));
            if(message['timestamp'] >= timestamp) {
                timestamp = message['timestamp'];
                presenceUpdateCallback.apply(scope, [message['presence'], vseeId]);
            } else {
                me.log("PUBNUB> timestamp is too old (" + message.timestamp + " < " + timestamp + ")");
            }
        };

        var timeout = setTimeout(function() {
            if (me.getUserState(vseeId) == 'Loading') {
                callback({ timestamp: 0, presence: 'Unknown' });
            }
        }, me.timeout * 1000);

        me.log("PUBNUB SUB> " + vseeId);
        me.pubnub.subscribe({
            channel: vseeId,
            callback: callback,
            connect: function() {
                me.pubnub.history({
                    channel : vseeId,
                    limit : 1
                }, function(messages) {
                    me.log("PUBNUB RAW> " + JSON.stringify(messages));
                    clearTimeout(timeout);
                    if(messages && messages[0] && messages[0].length > 0) {
                        callback(messages[0][0]);
                    } else {
                        callback({ timestamp: 0, presence: 'Offline' });
                    }
                });
            }
        });
    },

    internalUnsubscribe: function(vseeId) {
        this.clearUserState(vseeId);
        this.pubnub.unsubscribe({channel : vseeId});
    },

    //
    // Presence Caching
    //
    cachedStates: {},
    getUserState: function(vseeId) {
        return this.cachedStates[vseeId.toLowerCase()];
    },
    setUserState: function(vseeId, status) {
        this.cachedStates[vseeId.toLowerCase()] = status;
    },
    clearUserState: function(vseeId) {
        delete this.cachedStates[vseeId.toLowerCase()];
    },

    //
    // JQuery Plugin
    //

    jQueryMethods: {},
    jQueryMethodContexts: {},
    jQueryAddMethod: function(name, callback, scope) {
        scope = scope || this;
        this.jQueryMethods[name] = callback;
        this.jQueryMethodContexts[name] = scope;
    },
    setupJQuery: function() {
        var me = this;
        jQuery.fn[this.jqueryPluginName] = function(method) {
            if (me.jQueryMethods[method]) {
                var args = jQuery.makeArray(arguments);
                args.splice(0,1,me, me.jQueryMethodContexts[method]);
                return me.jQueryMethods[ method ].apply(this, args);
            }
            else {
                jQuery.error('Method ' + method + ' does not exist on jQuery.' + me.jqueryPluginName);
            }
        };
        this.jQueryAddMethod('showByPresence', this.jQueryShowByPresence);
        this.jQueryAddMethod('presenceClasses', this.jQueryAddPresenceClass);
    },
    jQueryRunOp: function(me, els, context, config, callback) {
        var globalUsername;
        var usernameAttr = 'username';
        if (config && config.username) {
            globalUsername = config.username;
        }
        if (config && config.usernameAttr) {
            usernameAttr = config.usernameAttr;
        }

        els.each(function() {
            var el = this;
            var username = globalUsername;
            if (!username) {
                username = me.findAttributeValue(el, usernameAttr);
            }
            me.subscribe(username, function(currentState) {
                callback(me, el, currentState);
            });
        });
        return els;
    },
    jQueryAddPresenceClass: function(me, context, config) {
        return me.jQueryRunOp(me, this, context, config, function(me, el, currentState) {
            jQuery.each(me.possibleStates, function(index, possibleState) {
                jQuery(el).toggleClass('vsee_presence_' + possibleState.toLowerCase(), (possibleState == currentState));
            });

        });
    },
    jQueryShowByPresence: function(me, context, config) {
        config = config || { exclude: ['Offline', 'Loading', 'Unknown'] };  // By default, show elements except when offline
        return me.jQueryRunOp(me, this, context, config, function(me, el, currentState) {
            jQuery(el).toggle(me.stateActive(config, currentState));
        });
    },
    stateActive: function(config, state) {
        if (config.include) {
            return jQuery.inArray(state, config.include) >= 0;
        }
        if (config.exclude) {
            return jQuery.inArray(state, config.exclude) < 0;
        }
        return true;
    },
    findAttributeValue: function(el, attr) {
        var jq = jQuery(el);
        if (jq.attr(attr)) {
            return jq.attr(attr);
        }
        var inner = jq.find('[' + attr + ']').first();
        if (inner.size() == 1) {
            return inner.attr(attr);
        }
        return jq.closest('[' + attr + ']').attr(attr);
    }
};
