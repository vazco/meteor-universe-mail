<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/Universe Mail
</h1>

&nbsp;

<h3 align="center">
  -- Abandonware. This package is deprecated! --
</h3>

&nbsp;

## Idea

We want to group emails into onc, and send it once in a period of time (choosed by user).
To do this we create newsletter stream and when some event occurs, then we add
an item to this stream. This item contains data necessary to render some part of an email.
User have to subscribe to this stream.

## Quick setup

Lets send weekly newsletter with new posts.

1. Add package

        meteor add vazco:universe-mail

2. Create template for post item

        // private/newsletter/postItem.html
        <div>
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
        </div>

        // newsletter/templates.js
        SSR.compileTemplate('newsletterPostItem', Assets.getText('private/newsletter/postItem.html'));

3. Send data when event occurs

        Posts.created = function(post) {
            ...
            Meteor.call('UniMail.addItem', 'newsletter', {
                template: 'newsletterPostItem',
                title: post.title,
                description: post.description
            });
        }

4. Subscribe user

        Accounts.onCreateUser(function(user) {
            Meteor.call('UniMail.subscribe', user.id, 'newsletter', 'weekly', {
                email: user.emails[0].address
                username: user.profile.name
            });
        });

5. Configure and run cron tasks

        UniMail.config({
            sendFrom: 'admin@myapp.com'
        });

        // server/startup.js
        Meteor.startup(function() {
            UniMail.runCronTasks({
                'enqueue': {
                    when: 'every 5 minutes'
                },
                'send': {
                    when: 'every 1 minute',
                    limit: 100
                }
            });
        });

## Streams

Each item is added to a stream and each user subscribes to a stream. To create stream just select
its name and pass it in arguments when addind items and subscribing users. We used 'newsletter'
stream in examples above. You can have many streams. I.e you can send posts summary to every user weekly
and service statistics only to admins monthly:

        Meteor.call('UniMail.addItem', 'statistics', {
            userCreated: user.createdAt,
        });

and when subscribing

        Meteor.call('UniMail.subscribe', admin.id, 'statistics', 'monthly', {
            email: admin.emails[0].address
        });

You can even have one stream per user, and send him his individual activity stream:

        var userPersonalStreamName = 'userNotification_' + user._id

        Method.call('UniMail.subscribe', user._id, userPersonalStreamName, 'daily', {email: user.email()});

        Groups.commentAdded = function(comment, group) {
            ...
            group.getMembers().forEach(function(user) {
                Meteor.call('UniMail.addItem', userPersonalStreamName, {
                    template: 'newCommentInGroup',
                    authorName: comment.getAuthorName(),
                    text: comment.getText()
                });
            });
        }


## Subscription

User can be subscribed to one stream many times for different schedules (i.e. when he want to have weekly and monthly summary).
So when you want to change frequency you have to unsubscribe from previous one.

        Meteor.call('UniMail.unsubscribe', user.id, 'newsletter', 'weekly');
        Meteor.call('UniMail.subscribe', user.id, 'newsletter', 'monthly', {
            email: user.emails[0].address
        });

## Templates

UniMail renders main template passing items data as parameters. By default its:

        Helo {{data.username}},

        {{#each items}}
            <hr>
            {{> Template.dynamic template=data.template data=.}}
        {{/each}}

You can override this template:

        UniMail.configStream('default', {
            template: 'myMailingTemplate'
        });

You can also override this template for specific stream:

        UniMail.configStream('statistics', {
            template: 'myStatisticsMailingTemplate'
        });

Default template shows how flexible UniMail is. You can use dynamic templates to display each item differently,
but you can also aggregate some data and render summary:

        Helo,

        Posts sent this week: {{ items.length }}

        {{ renderSomeChart }}

## Subject

Set email subject like this:

        UniMail.configStream('default', {
            subject: function(subscription) {
                return 'My newsletter';
            }
        });

        UniMail.configStream('statistics', {
            subject: function(subscription) {
                var username = subscription.data.username;
                var schedule = subscription.data.schedule;
                return username + ', here\'s your ' + schedule + ' statistics;
            }
        });

        // Set additional data on subscription when you subscribe user:
        Meteor.call('UniMail.subscribe', user.id, 'newsletter', 'monthly', {
            email: user.emails[0].address,
            username: user.getName(),
            schedule: 'monthly'
        });


## Scheduler

What and when things are sent is configured in schedulers. There are some default schedulers defined for you: 'daily', 'weekly', 'monthly' (and 'minutely' for tests purposes). You can override or define your own scheduler like this:

        UniMail.configScheduler('daily', {
            /*
             *  Cron task iterates through all subscriptions and checks wether it should be send using this function.
             *  If returned value is true, then email is builded, enqueued for send, and subscription.lastEnqueuedAt is set to new Date()
             */
            shouldEnqueue: function(subscription) {
                /*
                 *  Useful properties you can use here:
                 *    - subscription.lastEnqueuedAt
                 *    - subscription.data
                 */
                return subscription.lastEnqueuedAt <  moment().subtract(1, 'day').toDate();
            },
            /*
             * Email is build using data from items added with UniMail.addItem. This function
             * selects items that should be passed in parameters to template
             */
            findItems: function(subscription, collection) {
                var fromDate = moment().subtract(1, 'day').toDate();
                return collection.find({
                    stream: subscription.stream,
                    createdAt: {$gt: fromDate}
                });
            }
        });

Add additional data when subscribing, to implement complex strategies like:

          Meteor.call('UniMail.subscribe', user.id, 'dailyReport', 'dailyAt', {
              email. user.email(),
              hour: '12:00'
          });

          UniMail.configScheduler('dailyAt', {
              shouldEnqueue: function(subscription) {
                  // ...
                  // use this to send mailing at exact moment
                  // subscription.data.hour === '12:00'
                  // ...
              },
              findItems: function(subscription, collection) {
                  // ...
                  // use this to fetch proper messages
                  // subscription.data.hour === '12:00'
                  // ...
              }
          });

## Debugging

Turn on logging to console:

        UniMail.config({
            debug: true
        });

Use 'minutely' scheduler and lower cron intervals to have emails sent often:

        UniMail.runCronTasks({
            'enqueue': {
                when: 'every 10 seconds'
            },
            'send': {
                when: 'every 10 seconds',
                limit: 10
            }
        });

or use methods api to run tasks on demand:

        Meteor.call('UniMail.queueTask');
        Meteor.call('UniMail.sendTask');

## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Universe Mail is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
