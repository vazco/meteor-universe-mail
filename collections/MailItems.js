'use strict';

UniMail.addCollection('MailItems', {
    onInit: function (collection) {
        collection.Schema = new SimpleSchema({
            stream: {
                type: String,
                defaultValue: 'default'
            },
            data: {
                type: Object,
                blackbox: true
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
