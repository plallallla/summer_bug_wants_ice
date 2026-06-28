(function () {
  function textOf(heading) {
    return (heading.textContent || "").replace(/\s+/g, " ").trim();
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

  function buildToc() {
    removeToc();

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
  window.addEventListener("hashchange", removeToc);
})();
