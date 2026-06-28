(function () {
  var tocStorageKey = "article-toc-width";
  var minTocWidth = 160;
  var maxTocWidth = 420;

  function textOf(heading) {
    return (heading.textContent || "").replace(/\s+/g, " ").trim();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setTocWidth(width) {
    var nextWidth = clamp(width, minTocWidth, maxTocWidth);
    document.documentElement.style.setProperty("--article-toc-width", nextWidth + "px");
    try {
      localStorage.setItem(tocStorageKey, String(nextWidth));
    } catch (error) {
      // Ignore storage failures; dragging should still work for the current page.
    }
  }

  function restoreTocWidth() {
    try {
      var savedWidth = parseInt(localStorage.getItem(tocStorageKey), 10);
      if (!Number.isNaN(savedWidth)) {
        setTocWidth(savedWidth);
      }
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function ensureId(heading, index) {
    if (heading.id) {
      return heading.id;
    }

    heading.id = "article-heading-" + index;
    return heading.id;
  }

  function removeToc() {
    var existing = document.querySelector(".article-toc");
    if (existing) {
      existing.remove();
    }
    document.body.classList.remove("has-article-toc");
  }

  function makeBrandTextOnly() {
    var brandLink = document.querySelector(".sidebar > h1 a");
    if (!brandLink) {
      return;
    }

    var brandText = document.createElement("span");
    brandText.className = "app-name-text";
    brandText.textContent = textOf(brandLink);
    brandLink.replaceWith(brandText);
  }

  function attachResizer(toc) {
    var resizer = document.createElement("div");
    resizer.className = "article-toc-resizer";
    resizer.setAttribute("aria-hidden", "true");

    resizer.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      document.body.classList.add("is-resizing-toc");
      resizer.setPointerCapture(event.pointerId);
    });

    resizer.addEventListener("pointermove", function (event) {
      if (!document.body.classList.contains("is-resizing-toc")) {
        return;
      }

      setTocWidth(event.clientX - toc.getBoundingClientRect().left);
    });

    function stopResize(event) {
      document.body.classList.remove("is-resizing-toc");
      if (event && resizer.hasPointerCapture(event.pointerId)) {
        resizer.releasePointerCapture(event.pointerId);
      }
    }

    resizer.addEventListener("pointerup", stopResize);
    resizer.addEventListener("pointercancel", stopResize);
    toc.appendChild(resizer);
  }

  function buildToc() {
    removeToc();
    makeBrandTextOnly();

    if (location.hash.indexOf("#/posts/") !== 0) {
      return;
    }

    var article = document.querySelector(".markdown-section");
    if (!article) {
      return;
    }

    var headings = Array.prototype.slice.call(
      article.querySelectorAll("h2, h3, h4, h5")
    ).filter(function (heading) {
      return textOf(heading) && heading.offsetParent !== null;
    });

    if (headings.length < 2) {
      return;
    }

    var toc = document.createElement("aside");
    toc.className = "article-toc";

    var list = document.createElement("nav");
    list.className = "article-toc-list";

    headings.forEach(function (heading, index) {
      var link = document.createElement("a");
      link.className = "article-toc-link article-toc-" + heading.tagName.toLowerCase();
      link.href = "javascript:void(0)";
      link.addEventListener("click", function () {
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      ensureId(heading, index);
      link.textContent = textOf(heading);
      list.appendChild(link);
    });

    toc.appendChild(list);
    attachResizer(toc);
    document.body.appendChild(toc);
    document.body.classList.add("has-article-toc");
  }

  function plugin(hook) {
    hook.doneEach(function () {
      window.requestAnimationFrame(buildToc);
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins || []);
  restoreTocWidth();
  window.addEventListener("hashchange", removeToc);
})();
