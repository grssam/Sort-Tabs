/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Author:
 *   Girish Sharma <scrapmachines@gmail.com>
 */

"use strict";
let {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/AddonManager.jsm");
Cu.import("resource:///modules/devtools/gcli.jsm");

function disable(id) {
  AddonManager.getAddonByID(id, function(addon) {
    addon.userDisabled = true;
  });
}

function unload() {
  gcli.removeCommand("sorttabs");
}

function addCommand() {
  /**
  * Sort Tabs command
  *
  * @param string urlPart
  *        a matching string to match the url of tabs.
  *        if this value is provided, the tabs not matching the criteria would
  *        not be shifted.
  * @param boolean reverse
  *        [Optional][default=false]
  *        True to sort in reverse order.
  */

  gcli.addCommand({
    name: "sorttabs",
    description: "Sorts the visible tabs based on their url.",
    params: [
      {
        name: "urlPart",
        type: "string",
        defaultValue: " ",
        description: "Only sorts tabs matching the regular expression.",
        manual: "Only the tabs with their url matching the regular expression" +
                " will be sorted and other tabs will be left untouched, at" +
                " their previous positions."
      },
      {
        name: "reverse",
        type: "boolean",
        description: "True to reverse the sorting direction.",
        manual: "True to reverse the sorting direction."
      }
    ],
    returnType: "string",
    exec: function Restart(args, context) {
      let gBrowser = context.environment.chromeDocument.defaultView.gBrowser;
      let visibleTabIndex = [];
      let visibleTabs = [];
      let urlPart = "";
      try {
        urlPart = args.domain.replace(/^http(s)?:\/\/(www\.)?/, "")
                             .replace(/\/./, "");
      } catch (ex) {}
      for (let tab of gBrowser.visibleTabs) {
        if (!tab.pinned) {
          if (args.urlPart == " " ||
              gBrowser.getBrowserForTab(tab).currentURI
                      .spec.match(new RegExp(urlPart))) {
            visibleTabIndex.push(tab._tPos);
            visibleTabs.push(tab);
          }
        }
      }

      visibleTabs.sort(function(a, b) {
        let urlA = gBrowser.getBrowserForTab(a).currentURI.spec;
        let urlB = gBrowser.getBrowserForTab(b).currentURI.spec;
        urlA = urlA.replace(/^http(s)?:\/\/(www\.)?/, "");
        urlB = urlB.replace(/^http(s)?:\/\/(www\.)?/, "");
        return (args.reverse? urlA < urlB: urlA > urlB);
      });
      visibleTabs.forEach(function (tab, index) {
        gBrowser.moveTabTo(tab, visibleTabIndex[index]);
      });
      return "Sorting complete";
    }
  });
}

function startup(data, reason) {
  addCommand();
}

function shutdown(data, reason) {
  if (reason != APP_SHUTDOWN) {
    unload();
  }
}

function install() {}

function uninstall() {}