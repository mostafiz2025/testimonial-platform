/*
 * Testimonial Platform embed script
 * <script src="https://YOUR-SITE/embed.js" data-slug="your-space" async></script>
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var slug = script.getAttribute("data-slug");
  if (!slug) return;
  var base = new URL(script.src).origin;

  var iframe = document.createElement("iframe");
  iframe.src = base + "/embed/" + encodeURIComponent(slug);
  iframe.style.cssText = "width:100%;border:0;min-height:300px;display:block";
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("title", "Wall of Love");
  script.parentNode.insertBefore(iframe, script);

  window.addEventListener("message", function (e) {
    var d = e.data;
    if (d && d.type === "testimonial:height" && d.slug === slug) {
      iframe.style.height = d.height + "px";
    }
  });
})();
