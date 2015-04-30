'use strict';

UniMail.runCronTasks = function(options) {
    if (options.enqueue) {
        SyncedCron.add({
            name: 'Queue subscriptions',
            schedule: function(parser) {
                return parser.text(options.enqueue.when);
            },
            job: function() {
                UniMail.queueTask();
            }
        });
    }

    if (options.send) {
        SyncedCron.add({
            name: 'Send mailing',
            schedule: function(parser) {
                return parser.text(options.send.when);
            },
            job: function() {
                UniMail.sendTask(options.send.limit);
            }
        });
    }

    SyncedCron.config({
        log: !!UniMail.debug
    });

    SyncedCron.start();
};

UniMail.queueTask = function() {
    UniMail.MailSubscriptions.find({ enabled: true}).forEach(function(subscription) {
        var scheduler = UniMail.getScheduler(subscription.scheduler);

        if (scheduler.shouldEnqueue(subscription)) {
            subscription.enqueue();
        }
    });
};

UniMail.sendTask = function() {
    UniMail.MailQueue.find({status: 'readyToSend'}).forEach(function(mail) {
        mail.send();
    });
};
