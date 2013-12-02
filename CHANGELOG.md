subNode
=======

# v1.1.15
* Added changelog for all new releases & button to show changes in update msg.
The update message is no longer shown at while loading angularJS

* Updated libraries.
Front: angularJS (and dependent libs), restangular, sass-bootstrap (and glyphicons font), angular-local-storage, angular-ui-router, lodash, angular-translate (and dependent libs), respondjs & modernizr
Back: wrench, natural, nconf, express, lodash, bower, brunch & auto reload brunch

* Removed unused brunch auto reload script in index

* Switched from nconf to NeDB for addic7ed & TheTVDB (you can delete the folder "shows" in server/data)

* Added a generic banner image to use when we can't find any on The TV DB

* Added 10px padding around the show/episodes overviews

* Fixed icons vertical align for firefox

* Fixed auto rename: it was always auto renaming (and no one told me !!).

* Added an option to add subtitle language to the file name when auto renaming. Ex: xxxx.en.srt

* Fixed github error for updater

* Added compatibility to node-webkit