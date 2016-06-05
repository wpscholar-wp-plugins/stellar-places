=== Plugin Name ===
Contributors: woodent
Donate link: https://www.paypal.me/wpscholar
Tags: map, maps, places, location, geolocation, geo, google maps
Requires at least: 4.5.0
Tested up to: 4.5.2
Stable tag: 1.0.5
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Easily create, manage and display locations in a way that makes sense.

== Description ==

**Stellar Places** is an intuitive plugin for easily creating, managing and displaying locations using Google Maps.

= How? =

Using this plugin is simple:

1. Install the plugin
2. Activate the plugin
3. In the WordPress admin, click on 'Places'
4. Click on 'Add New' and create a new place.

Once you have added a new place, you will be able to access the listing view and single location view, both of which will automatically have maps associated with them.  If you wish to insert a map in a custom location, just use the `[stellar_places_map]` shortcode (see FAQ section for more details).

= Why? =

There are plenty of Google Maps plugins for WordPress, but very few actually use custom post types to manage locations. Additionally most don't have a simple and intuitive interface.  Let's take a look at some use cases where Stellar Places shines:

- **Store Locator** - If you own a business that has multiple physical locations, this plugin will automatically feature a list of all store locations as well as provide a page for each store location, which is good for local SEO.

- **Local Events** - If your organization sponsors or holds local events, this plugin makes it easy to display them all on a map, or even display subsets based on categories.

Let us how know how you are using Stellar Places!

= Features =

* Live map preview
* Drag and drop marker relocation
* Location pages for better SEO
* Unlimited locations and maps
* Mobile friendly, responsive maps
* Easy map embeds via shortcode
* Clean, well written code that won't bog down your site

= Upcoming Features =

If there is a feature or integration that you are interested in, please let me know. What I build will be entirely based on what my users need, so let your voice be heard by using the [support forum](https://wordpress.org/support/plugin/stellar-places) or creating a [new issue on GitHub](https://github.com/wpscholar/stellar-places/issues/new).

*Banner Disclaimer*: The icon used in the banner was designed by [alecive](http://www.iconarchive.com/show/flatwoken-icons-by-alecive/Apps-Google-Maps-icon.html).  It has been altered and used with the author's permission under the [Creative Commons Attribution-ShareAlike license](http://creativecommons.org/licenses/by-sa/4.0/).

= Special Thanks =

A very special thank you to our plugin translators:

Jacques Soulé (French) - http://wordpress-pour-vous.com/

== Installation ==

= Prerequisites =
If you don't meet the below requirements, I highly recommend you upgrade your WordPress install or move to a web host that supports a more recent version of PHP.

* Requires WordPress version 4.5.0 or greater ( if you are running an older version of WordPress, version 1.0.3 or earlier of this plugin will support WordPress 3.5)
* Requires PHP version 5.2 or greater ( PHP version 5.2.4 is required to run WordPress version 3.2 )

= Install via Search =

1. In your WordPress admin, go to 'Plugins' and then click on 'Add New'.
2. In the search box, type in 'Stellar Places' and hit enter.  This plugin should be the first and likely the only result.
3. Click on the 'Install' link.
4. Once installed, click the 'Activate this plugin' link.

= Install via Direct Download =

1. Download the .zip file containing the plugin.
2. In the WordPress admin, click on 'Plugins' and then 'Add New'
3. On the resulting 'Install Plugins' page, find the 'Upload' link at the top and click on it.
4. Click on the 'Choose File' button and point your machine to the .zip you initially downloaded.
5. Click 'Install Now'
6. After the install is complete, click the 'Activate Plugin' link.

= Compatibility =

* Currently, there are no known conflicts with other WordPress plugins. If you believe you've found one, please let us know on the [support forum](https://wordpress.org/support/plugin/stellar-places)
* The current version of this plugin is only compatible with WordPress 4.5 or greater.
* Versions 1.0 to 1.0.3 of this plugin are compatible with WordPress 3.5 up until, but not including, version 4.5.

== Frequently Asked Questions ==

= How do I insert a map? =
Just use the `[stellar_places_map]` shortcode in your post content, or even in a text widget.

= What options are available with the [stellar_places_map] shortcode? =

*HTML Attributes*

- **id** - The HTML id attribute for the wrapping div.
- **class**  - The HTML class attribute for the wrapping div.
- **width** - Sets the width of the map.  Can be defined in any standard CSS measurement (e.g. 100%, 600px). Defaults to '100%'.
- **height** - Sets the height of the map.  Should be defined in pixels (i.e. 600px). Defaults to '400px'.

*Query Parameters*

- **post_type** - Limit items displayed to a specific post type.  Only supported post types can be displayed.
- **taxonomy** - Sets the taxonomy to be used in conjunction with the 'term' attribute. Defaults to 'stlr_location_categories'.
- **term** - Limit items displayed to a specific taxonomy term.  Requires the 'taxonomy' attribute to be set.  A term slug should be provided.
- **category** - An alias for 'term'.
- **post_id** - Limit items displayed to a specific post.  This will effectively display a single marker for a specific location on the map.

*Map Settings*

- **lat** - The default latitude for the map center, when no markers are displayed.
- **lng** - The default longitude for the map center, when no markers are displayed.
- **mapType** - Sets the map type for the Google Map. (Reference the Google Maps JS API for details) Default is a standard road map.
- **scrollwheel** - Defaults to 'false', which prevents the map from zooming when scrolled over.
- **zoom** - The default zoom for the map, when no markers are displayed. *Required if no markers are being displayed.*  Zoom levels are integers between 1 and 20.
- **minzoom** - The minimum zoom level which will be displayed on the map. Zoom levels are integers between 1 and 20.
- **maxzoom** - The maximum zoom level which will be displayed on the map. Zoom levels are integers between 1 and 20.
- **infowindows** - Defaults to 'true', which enables the display of popups when clicking on map markers.

Example usage of the shortcode options:

`[stellar_places_map post_id="29" maxzoom="14" height="250px" width="250px"]`

= How can I customize the content that appears on the single location pages and on the post type archive page? =

The Stellar Places plugin uses templates to control what appears in these areas.  By default, the templates used are found in the `/includes/templates` directory of the plugin.  However, in your theme you can create a `/stellar-places` directory and, if present, the plugin will load templates from there instead.  If you wish to customize the templates found in the plugin, just copy the files over to your theme and then start editing!

= Can I customize the content in the popups that appear when clicking on map markers? =

Absolutely.  There is an `/includes/templates` directory in the plugin that contains a file called `info-window.html`. This file contains all of the code used to render the content of the popups.  You can create a `/stellar-places` directory in your theme and copy over the `info-window.html` file and edit it to fit your needs. The file uses the Underscore.js template engine and is a client-side template.

== Screenshots ==

1. Admin section adding a location and pulling the data from Google Maps
2. Admin section showing the results once an item is added
3. The front end results of adding multiple locations (single category/term)
4. The front end showing a single location on a map
5. The front end on an iPhone showing how the map is by default responsive

== Changelog ==

= 1.0.5 =
* Fixed bug that prevented plugin from being activated.

= 1.0.4 =
* Made the location category taxonomy public.
* Fixed bugs related to updated JavaScript dependencies in WordPress 4.5.
* Updated code to use the new `get_post_types_by_support()` function in WordPress 4.5

= 1.0.3 =
* Updated readme to reflect compatibility with WordPress version 4.0.1
* Fixed bug in shortcode where setting 'zoom' wouldn't work when markers were present.

= 1.0.2 =
* Added a 'stellar_place' filter for place objects.
* Made plugin translatable and added French translation.
* Allow post_type and posts_per_page parameters in Stellar_Places_Query to be overwritten.
* Use file_get_contents() instead of include() to output standalone HTML template from a file.
* Strip shortcodes from the location description rather than execute them.
* Added set 'with_front' to false for the place post type to keep urls clean.
* Added an upgrade routine.

= 1.0.1 =
* Fix the minzoom and maxzoom shortcode attributes (not previously working).
* Ensure map centers properly on window resize.
* Process shortcodes in the location description that appears in the map popups.
* Remove the div that wraps the map canvas to avoid complicating the CSS.

= 1.0.0 =
* Initial public release

== Upgrade Notice ==

= 1.0.1 =
Minor bug fixes: 1) Fix the minzoom and maxzoom shortcode attributes. 2) Ensure map centers properly on the window resize event. 3) Process shortcodes in the location description that appears in the map popups. 4) Remove the div that wraps the map canvas to avoid complicating the CSS.

= 1.0.2 =
Added French translation.  Added 'stellar_place' filter for place objects. Minor bug fixes: 1) Set 'with_front' to false for place post type, 2) Strip shortcodes from location description rather than execute them, 3) Allow all default parameters to be overridden in Stellar_Places_Query, 4) Use file_get_contents() instead of include() to output files that don't need to be parsed.

= 1.0.3 =
Bug fix for the 'zoom' shortcode attribute.

= 1.0.4 =
The latest version of this plugin requires WordPress 4.5 or greater! If you are running an older version of WordPress, please upgrade first. [Review changelog](https://wordpress.org/plugins/stellar-places/changelog/)

= 1.0.5 =
The latest version of this plugin requires WordPress 4.5 or greater! If you are running an older version of WordPress, please upgrade first. [Review changelog](https://wordpress.org/plugins/stellar-places/changelog/)