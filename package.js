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
        'vazco:universe-core',
        'vazco:universe-core-plugin',
        'anti:i18n',
        'aldeed:simple-schema',
        'meteorhacks:ssr',
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
