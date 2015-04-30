'use strict';

UniMail.addCollection('MailSubscriptions', {
    onInit: function (collection) {
        collection.Schema = new SimpleSchema({
            userId: {
                type: String
            },
            stream: {
                type: String
            },
            scheduler: {
                type: String
            },
            data: {
                type: Object,
                blackbox: true
            },
            'data.email': {
                type: String,
                regEx: SimpleSchema.RegEx.Email
            },
            enabled: {
                type: Boolean,
                defaultValue: true
            },
            lastEnqueuedAt: {
                type: Date,
                optional: true,
                autoValue: function() {
                    if (this.isInsert) {
                        return new Date();
                    }
                }
            },
            lastEnqueuedItem: {
                type: String,
                optional: true
            },
            createdAt: {
                type: Date,
                autoValue: function() {
                    if (this.isInsert) {
                        return new Date();
                    }
                },
                optional: true,
                autoform: { //ommiting fields in quickforms
                    omit: true
                }
            }
        });

        collection.attachSchema(collection.Schema);

        collection.helpers({
            enqueue: function() {
                var scheduler = UniMail.getScheduler(this.scheduler);
                var items = scheduler.findItems(this, UniMail.MailItems);

                if (items.count() > 0) {
                    var html = SSR.render(UniMail.getStreamTemplate(this.stream), {
                        data: this.data,
                        items: items
                    });

                    var mail = {
                        email: this.data.email,
                        subject: this.getSubject(),
                        html: html
                    };
                    UniMail.MailQueue.insert(mail);
                    UniMail.log('enqueqed email', mail);
                } else {
                    UniMail.log('empty subscription...');
                }

                UniMail.MailSubscriptions.update(this._id, {$set: {
                    lastEnqueuedAt: new Date()
                }});
            },
            getSubject: function() {
                return UniMail.getStreamSubject(this);
            }
        });

        collection.allow({
            insert: function () {
                return false;
            },
            update: function () {
                return false;
            },
            remove: function () {
                return false;
            }
        });
    }
});
