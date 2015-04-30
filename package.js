'use strict';

Package.describe({
    name: 'vazco:universe-mail',
    summary: 'Send emails periodically, grouped in one template',
    version: '0.0.1',
    git: 'https://github.com/vazco/meteor-universe-mail.git'
});

Package.onUse(function (api) {
    api.versionsFrom('1.0.1');

    api.use([
        'check',
        'templating',
        'underscore',
        'vazco:universe-core@1.6.7',
        'vazco:universe-core-plugin@0.0.0',
        'aldeed:simple-schema@1.3.2',
        'meteorhacks:ssr@2.1.2',
        'percolate:synced-cron@1.2.0',
        'email'
    ], ['server']);


    api.addFiles([
        'UniMail.js',
        'collections/MailItems.js',
        'collections/MailQueue.js',
        'collections/MailSubscriptions.js',
        'server/cron.js',
        'server/methods.js',
    ], 'server');

    api.addFiles([
        'private/defaultMailTemplate.html'
    ], 'server', {isAsset: true});

    api.export('UniMail');
});
