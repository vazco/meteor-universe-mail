'use strict';

UniMail.addCollection('MailQueue', {
    onInit: function (collection) {
        collection.Schema = new SimpleSchema({
            email: {
                type: String,
                regEx: SimpleSchema.RegEx.Email
            },
            subject: {
                type: String
            },
            html: {
                type: String
            },
            status: {
                type: String,
                allowedValues: ['readyToSend', 'sent', 'failed'],
                defaultValue: 'readyToSend'
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
            send: function() {
                if (this.status !== 'readyToSend') {
                    UniMail.log('Warning: trying to send item not ready to send');
                    return;
                }

                var mail = {
                    from: UniMail.sendFrom,
                    to: this.email,
                    subject: this.subject,
                    html: this.html
                };

                Email.send(mail);

                UniMail.MailQueue.update(this._id, {$set: {
                    status: 'sent'
                }});

                UniMail.log('email sent', mail);
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
