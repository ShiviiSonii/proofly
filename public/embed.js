/**
 * Proofly embed script.
 * Include on your site with: <script src="https://your-app.com/embed.js" data-category-id="CATEGORY_ID" data-container="proofly-testimonials"></script>
 * The script finds the element with id = data-container and injects an iframe that loads approved testimonials for the category.
 */
(function () {
  "use strict";

  var scriptTag = document.currentScript;  // The <script> tag that is running right now.
  if (!scriptTag) return;  // If missing (e.g. script injected by JS), we can't read src or attributes.

  var categoryId = scriptTag.getAttribute("data-category-id");  // Which category's testimonials to show.
  var containerId = scriptTag.getAttribute("data-container") || "proofly-testimonials";  // Id of the div where the widget goes.

  if (!categoryId) {
    console.warn("Proofly: data-category-id is required on the script tag.");
    return;
  }

  var scriptSrc = scriptTag.getAttribute("src") || "";  // Full URL of this script, e.g. https://your-app.com/embed.js
  var appOrigin = scriptSrc.replace(/\/embed\.js.*$/, "");  // Strip /embed.js and after → get origin (e.g. https://your-app.com).
  var embedPageUrl = appOrigin + "/embed/testimonials/" + encodeURIComponent(categoryId);  // URL of the embed page. encodeURIComponent keeps categoryId safe in URL.

  var containerElementId = containerId.replace(/^#/, "");  // Remove leading # if user passed #proofly-testimonials.
  var containerElement = document.getElementById(containerElementId);  // The div from the snippet (where we'll put the iframe).
  if (!containerElement) {
    console.warn("Proofly: no element with id \"" + containerElementId + "\". Add a <div id=\"" + containerElementId + "\"></div> where the widget should appear.");
    return;
  }

  var iframe = document.createElement("iframe");
  iframe.src = embedPageUrl;  // Load the embed page (approved testimonials) inside the iframe.
  iframe.title = "Testimonials";
  iframe.style.cssText = "width:100%;min-height:400px;border:none;border-radius:8px;display:block;";
  containerElement.appendChild(iframe);  // Put iframe in the div so the widget appears on the page.
})();
