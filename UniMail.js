'use strict';

/* global UniMail: true */

UniMail = new UniPlugin('UniMail');

UniMail.streams = {};
UniMail.schedulers = {};

UniMail.config = function(options) {
    if (options.sendFrom) {
        UniMail.sendFrom = options.sendFrom;
    }

    if (options.debug) {
        UniMail.debug = options.debug;
    }
};

UniMail.configStream = function(stream, options) {
    if (!this.streams[stream]) {
        this.streams[stream] = {};
    }

    _.extend(this.streams[stream], options);
};

UniMail.configScheduler = function(schedulerName, options) {
    if (!this.schedulers[schedulerName]) {
        this.schedulers[schedulerName] = {};
    }

    _.extend(this.schedulers[schedulerName], options);
};

UniMail.getStreamTemplate = function(stream) {
    var streamConfig = this.streams[stream] || {};
    var defaultConfig = this.streams['default'];

    return streamConfig.template || defaultConfig.template;
};

UniMail.getStreamSubject = function(subscription) {
    var streamConfig = this.streams[subscription.stream] || {};
    var defaultConfig = this.streams['default'];

    var subject = streamConfig.subject || defaultConfig.subject;

    if (_.isFunction(subject)) {
        return subject(subscription);
    }

    return subject;
};

UniMail.getScheduler = function(schedulerName) {
    return this.schedulers[schedulerName];
};

UniMail.getSchdulersNames = function() {
    return _.keys(this.schedulers);
};

UniMail.checkScheduler = function(schedulerName) {
    check(schedulerName, String);
    if (!UniMail.getScheduler(schedulerName)) {
        throw new Meteor.Error(505, 'Scheduler \'' + schedulerName + '\' is not defined');
    }
};

UniMail.log = function() {
    if (UniMail.debug) {
        console.log.apply(console.log, arguments);
    }
};



/***************************
 * Default configuration
 ***************************/

SSR.compileTemplate('defaultMailTemplate', Assets.getText('private/defaultMailTemplate.html'));

UniMail.configStream('default', {
    template: 'defaultMailTemplate',
    subject: function(subscription) {
        return 'My ' + subscription.scheduler + ' newsletter';
    }
});


UniMail.configScheduler('daily', {
    shouldEnqueue: function(subscription) {
        /*
         *  Useful properties you can use here:
         *    - subscription.lastEnqueuedAt
         *    - subscription.schedule - add additional data when subscribing,
         *      to implement complex strategies like:
         *
         *          subscription.schedule = {
         *              strategy: 'dailyAt',
         *              hour: '12:00'
         *          }
         */
        return subscription.lastEnqueuedAt <  moment().subtract(1, 'day').toDate();
    },
    findItems: function(subscription, collection) {
        var fromDate = moment().subtract(1, 'day').toDate();
        return collection.find({
            stream: subscription.stream,
            createdAt: {$gt: fromDate}
        });
    }
});

UniMail.configScheduler('weekly', {
    shouldEnqueue: function(subscription) {
        return subscription.lastEnqueuedAt <  moment().subtract(1, 'week').toDate();
    },
    findItems: function(subscription, collection) {
        var fromDate = moment().subtract(1, 'week').toDate();
        return collection.find({
            stream: subscription.stream,
            createdAt: {$gt: fromDate}
        });
    }
});

UniMail.configScheduler('monthly', {
    shouldEnqueue: function(subscription) {
        return subscription.lastEnqueuedAt <  moment().subtract(1, 'month').toDate();
    },
    findItems: function(subscription, collection) {
        var fromDate = moment().subtract(1, 'month').toDate();
        return collection.find({
            stream: subscription.stream,
            createdAt: {$gt: fromDate}
        });
    }
});


// for tests
UniMail.configScheduler('minutely', {
    shouldEnqueue: function(subscription) {
        return subscription.lastEnqueuedAt <  moment().subtract(1, 'minute').toDate();
    },
    findItems: function(subscription, collection) {
        var fromDate = moment().subtract(1, 'minute').toDate();
        return collection.find({
            stream: subscription.stream,
            createdAt: {$gt: fromDate}
        });
    }
});
