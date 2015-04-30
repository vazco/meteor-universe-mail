'use strict';

UniMail.addMethods({
    'UniMail.addItem': function (stream, data) {
        check(data, Object);
        check(stream, String);

        var doc = {
            data: data,
            stream: stream
        };

        UniMail.MailItems.insert(doc);

        UniMail.log('Item added', doc);
    },
    'UniMail.subscribe': function(userId, stream, scheduler, data) {
        check(userId, String);
        check(stream, String);
        check(scheduler, String);
        check(data, Object);
        check(data.email, String);
        UniMail.checkScheduler(scheduler);

        var subscription = UniMail.MailSubscriptions.findOne({
            userId: userId,
            stream: stream,
            scheduler: scheduler
        });

        var subscriptionDoc = {
            enabled: true,
            scheduler: scheduler,
            data: data
        };

        if (subscription) {
            UniMail.MailSubscriptions.update(subscription._id, {$set: subscriptionDoc});
        } else {
            UniMail.MailSubscriptions.insert(_.extend(subscriptionDoc, {
                userId: userId,
                stream: stream,
                lastEnqueuedAt: new Date()
            }));
        }
    },
    'UniMail.unsubscribe': function(userId, stream, scheduler) {
        check(userId, String);
        check(stream, String);

        var filter = {
            userId: userId,
            stream: stream
        };

        if (_.isString(scheduler)) {
            UniMail.checkScheduler(scheduler);
            filter.scheduler = scheduler;
        }

        UniMail.MailSubscriptions.update(filter, { $set: { enabled: false }}, { multi: true });
    },
    'UniMail.subscribeOnce': function(userId, stream, scheduler, data) {
        check(userId, String);
        check(stream, String);
        check(data, Object);
        check(data.email, String);

        Meteor.call('UniMail.unsubscribe', userId, stream);
        if (scheduler) {
            UniMail.checkScheduler(scheduler);
            Meteor.call('UniMail.subscribe', userId, stream, scheduler, data);
        }
    },
    'UniMail.queueTask': function() {
        UniMail.queueTask();
    },
    'UniMail.sendTask': function() {
        UniMail.sendTask();
    }
});
