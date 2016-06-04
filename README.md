# Stellar Places

## Description
**Stellar Places** is an intuitive plugin for easily creating, managing and displaying locations using Google Maps.

https://wordpress.org/plugins/stellar-places/

There are plenty of Google Maps plugins for WordPress, but very few actually use custom post types to manage locations. Additionally most don't have a simple and intuitive interface.  Let's take a look at some use cases where Stellar Places shines:

- **Store Locator** - If you own a business that has multiple physical locations, this plugin will automatically feature a list of all store locations as well as provide a page for each store location, which is good for local SEO.

- **Local Events** - If your organization sponsors or holds local events, this plugin makes it easy to display them all on a map, or even display subsets based on categories.

Let us how know how you are using Stellar Places!

### Features

* Live map preview
* Drag and drop marker relocation
* Location pages for better SEO
* Unlimited locations and maps
* Mobile friendly, responsive maps
* Easy map embeds via shortcode
* Clean, well written code that won't bog down your site

## Feature Requests

If there is a feature or integration that you are interested in, please let me know. What I build will be entirely based on what my users need, so let your voice be heard by creating a [new issue on GitHub](https://github.com/wpscholar/stellar-places/issues/new).

## Contributors

### Pull Requests
All pull requests are welcome.  If you would like to submit a translation, this is the place to do it!

### SVN Access
If you have been granted access to SVN, this section details the processes for reliably checking out the code and committing your changes.

#### Prerequisites
- Install SVN
- Install Node.js
- Run `npm install -g gulp`
- Run `npm install` from the project root

#### Checkout
- Run `gulp svn:checkout` from the project root

#### Check In
- Be sure that all version numbers in the code and readme have been updated.  Add changelog and upgrade notice entries.
- Tag the new version in Git
- Run `gulp project:build` from the project root.
- Run `gulp svn:addremove` from the SVN directory.
- Run `gulp svn:tag --v={version}` from the SVN directory.
- Run `svn ci -m "{commit message}"` from the SVN root to commit changes