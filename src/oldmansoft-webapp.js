var oldmanWebApp,
    $app;

oldmanWebApp = {
    setting: {
        timeover: 180000
    },
    text: {
        confirm: "确认",
        cancel: "取消",
        loading: "加载中"
    },
    _mainView: null,
    _currentViewEvent: null,
    _isDealEmptyTarget: true,

    scriptLoader: new function () {
        var hasScripts = [];
        function loadScriptExecute(args, index, deferred) {
            if (args.length == index + 1) {
                deferred.resolve();
            } else {
                loadScript(args, index + 1, deferred);
            }
        }

        function loadScript(args, index, deferred) {
            if (hasScripts[args[index]]) {
                loadScriptExecute(args, index, deferred);
                return;
            }
            $.getScript(args[index], function () {
                hasScripts[args[index]] = true;
                loadScriptExecute(args, index, deferred);
            });
        }
        this.load = function () {
            var result = $.Deferred();
            if (arguments.length == 0) result.resolve();
            else loadScript(arguments, 0, result);
            return result;
        }
	},

	blackBox: new function () {
	    var isInit = false,
	        element,
	        stackHideNode = [],
	        currentNode = null;

	    function hide (event) {
	        if (event && event.target != event.currentTarget) return;

	        if (stackHideNode.length > 0) {
	            currentNode = stackHideNode.pop();
	            element.empty();
	            element.append(currentNode);
	        }
	        else {
	            element.hide();
	            element.empty();
	            currentNode = null;
	        }
	    }
	    function initElement () {
	        if (isInit) return;
	        isInit = true;
	        element = $("<div></div>").addClass("box-background");
	        element.prependTo($("body"));
	    }
	    this.show = function (node) {
	        initElement();
	        if (currentNode) {
	            if (currentNode.data("type") == "message") {
	                throw "not allow show again after message show.";
	            }
	            stackHideNode.push(currentNode.detach());
	        }
	        currentNode = node;
	        element.append(node);
	        element.show();
	    }
	    this.hide = function (event) {
	        hide(event);
	    }
	},

	dialog: new function () {
	    function setButton(node) {
	        this.set = function (text, fn) {
	            var button = $("<button></button>").text(text);
	            button.click(function (event) {
	                oldmanWebApp.blackBox.hide(event);
	                if (fn) fn();
	            });
	            node.append(button);
	            return this;
	        }
	    }
		function elementBuilder() {
		    var element = $("<div></div>").addClass("box-dialog");
		    this.setHead = function (title) {
		        var header = $("<div></div>").addClass("dialog-header");
		        header.append($("<h4></h4>").text(title));
		        element.append(header);
		    }
		    this.setBody = function (text) {
		        var body = $("<div></div>").addClass("dialog-body").text(text);;
		        element.append(body);
		    }
		    this.setFooter = function (fnConfirm, fnCancel) {
		        var footer = $("<div></div>").addClass("dialog-footer");
		        element.append(footer);
		        return new setButton(footer);
		    }
		    this.get = function (type) {
		        element.data("type", type);
		        return element;
		    }
		}
		this.alert = function (content, title, fn) {
		    var builder = new elementBuilder();
		    if (title) {
		        builder.setHead(title);
		    }
		    builder.setBody(content);
		    builder.setFooter().set(oldmanWebApp.text.confirm, fn);
		    oldmanWebApp.blackBox.show(builder.get("alert"));
		}
		this.confirm = function (content, fnConfirm, fnCancel) {
		    var builder = new elementBuilder();
		    builder.setBody(content);
		    builder.setFooter().set(oldmanWebApp.text.confirm, fnConfirm).set(oldmanWebApp.text.cancel, fnCancel);
		    oldmanWebApp.blackBox.show(builder.get("confirm"));
		}
		this.message = function (content) {
		    var builder = new elementBuilder();
		    builder.setBody(content);
		    oldmanWebApp.blackBox.show(builder.get("message"));
		    return new function () {
		        this.hide = function () {
		            oldmanWebApp.blackBox.hide();
		        }
		    }
		}
	},

	loadingTip: new function () {
	    var element;

	    function initElement() {
	        if (element != null) return;
	        element = $("<div></div>").addClass("loading-tip-background");
	        var dialog = $("<div></div>").addClass("loading-tip-dialog"),
                text = $("<span></span>").text(oldmanWebApp.text.loading);

	        dialog.append(text);
	        element.append($("<div></div>").addClass("loading-tip-extra-horizontal").append(dialog)).append($("<div></div>").addClass("loading-tip-extra-vertical"));
	        element.prependTo($("body"));
	    }
	    this.show = function () {
	        initElement();
	        element.stop(true, true);
	        element.fadeIn(2000);
	    }
	    this.hide = function () {
	        initElement();
	        element.stop(true);
	        element.fadeOut(200);
	    }
	},

	link: new function () {
	    var initHashChange = false,
            lastHash = null,
            changeCall = null;

		function fixHref(href) {
			if (!href) return href;
			if (href.substr(0, 1) == "#") return href.substr(1);
			return href;
		}
		function getLink() {
		    return lastHash;
		}
		function callLeave() {
			changeCall(getLink());
		}
		function hashChange() {
		    var href = fixHref(window.location.hash);
		    if (lastHash == href) {
		        return;
		    }
		    lastHash = href;
			callLeave();
		}

		this.hash = function (href) {
			if (href == undefined) return window.location.hash;

			window.location.hash = href;
			if (href == lastHash) {
			    this.refresh();
			}
			return href;
		}
		this.addHash = function (href) {
		    href = fixHref(href);
		    if (window.location.hash == "") {
		        window.location.hash = "##" + href;
		    } else {
		        window.location.hash += "#" + href;
		    }
		}
		this.sameHash = function (href) {
		    href = fixHref(href);
		    var source = window.location.hash.split("#");
		    if (source.length == 1) {
		        source = ["", ""];
		    }
		    source.pop();
		    source.push(href);
		    window.location.hash = source.join("#");
		}
		this.refresh = function () {
		    callLeave();
		}
		this._init = function (fnChangeCall) {
		    if (initHashChange) return;
		    initHashChange = true;

		    changeCall = fnChangeCall;
		    lastHash = fixHref(window.location.hash);
		    if ("onhashchange" in window) {
		        window.onhashchange = hashChange;
		    } else {
		        window.setInterval(function () {
		            if (lastHash != fixHref(window.location.hash)) {
		                hashChange();
		            }
		        }, 100);
		    }
		    callLeave();
		}
	},

	viewArea: function (viewNode, link) {
	    var loadId = 0,
            element = $(viewNode),
            defaultLink = link,
            fnOnUnauthorized = function () { return false; },
            links = new linkManagement();

	    function linkManagement() {
	        var context = [];

	        function createItem(link) {
	            return {
	                link: link,
	                node: null,
	                scrollTop: 0,
	                scrollLeft: 0,
	                event: null
	            };
	        }

	        this.clear = function () {
	            var i,
                    event;

	            for (i = context.length - 1; i > -1; i--) {
	                event = context[i].event;
	                if (event) {
	                    event.inactive();
	                    event.unload();
	                }
	            }
	            context = [];
	        }
	        this.dealNotStartWith = function (hrefs) {
	            var retain = [],
	                result,
	                lastItem,
	                i;

	            if (context.length == 0) {
	                for (i = 0; i < hrefs.length; i++) {
	                    context.push(createItem(hrefs[i]));
	                }
	                return false;
	            }

	            for (i = 0; i < context.length - 1; i++) {
	                if (hrefs.length - 1 > i) {
	                    if (context[i].link == hrefs[i]) {
	                        retain.push(context[i]);
	                    } else {
	                        retain.push(createItem(hrefs[i]));
	                    }
	                } else if (context[i].node) {
	                    context[i].event.inactive();
	                    context[i].event.unload();
	                    context[i].node.remove();
	                }
	            }
	            for (i = context.length - 1; i < hrefs.length - 1; i++) {
	                retain.push(createItem(hrefs[i]));
	            }

	            lastItem = this.last();
	            if (lastItem.link == hrefs[hrefs.length - 1]) {
	                retain.push(lastItem);
	                result = true;
	            } else {
	                retain.push(createItem(hrefs[hrefs.length - 1]));
	                lastItem.event.inactive();
	                lastItem.event.unload();
	                lastItem.node.remove();
	                result = false;
	            }
	            context = retain;
	            return result;
	        }
	        this.push = function (link) {
	            context.push(createItem(link));
	        }
	        this.pop = function () {
	            return context.pop();
	        }
	        this.first = function () {
	            return context[0];
	        }
	        this.last = function () {
	            return context[context.length - 1];
	        }
	        this.lastLast = function () {
	            return context[context.length - 2];
	        }
	        this.setLastContext = function (node, event) {
	            this.last().node = node;
	            this.last().event = event;
	        }
	        this.setLastLastHide = function () {
	            var target = this.lastLast(),
	                win;

	            if (!target.node) return;

	            win = $(window);
	            target.scrollTop = win.scrollTop();
	            target.scrollLeft = win.scrollLeft();
	            target.node.hide();
	        }
	        this.setLastShow = function () {
	            var target = this.last();
	            if (!target.node) return false;
	            target.event.active();
	            target.node.show();
	            $(window).scrollLeft(target.scrollLeft);
	            $(window).scrollTop(target.scrollTop);
	            return true;
	        }
	        this.like = function (links) {
	            if (context.length == 0) return false;
	            for (var i = 0; i < context.length; i++) {
	                if (links.length == i) break;
	                if (context[i].link != links[i]) return false;
	            }
	            return true;
	        }
	        this.count = function () {
	            return context.length;
	        }
	        this.getBackLink = function () {
	            var link = [],
	                i;

	            link.push("");
	            for (i = 0; i < context.length - 1; i++) {
	                link.push(context[i].link);
	            }
	            return link.join("#");
	        }
	    }
	    function getAbsolutePath(path, basePath) {
	        if (path == "") path = defaultLink;
	        if (path.substr(0, 1) == "/") {
	            return path;
	        }
	        if (!basePath) basePath = document.location.pathname;
	        var pathnames = basePath.split("/");
	        pathnames.pop();
	        return pathnames.join("/") + "/" + path;
	    }
	    function getPathHasAbsolutePathFromArray(array, index) {
	        for (var i = index; i > -1; i--) {
	            if (array[i] == "" && defaultLink.substr(0, 1) == "/") return defaultLink;
	            if (array[i].substr(0, 1) == "/") return array[i];
	        }
	    }
	    function loadContent(link, isAdd, lastLink, isRefresh) {
	        function _event() {
	            this.load = function () { };
	            this.unload = function () { };
	            this.active = function () { };
	            this.inactive = function () { };
	        }
	        var currentId = ++loadId;
	        oldmanWebApp.loadingTip.show();
	        $.ajax({
	            mimeType: 'text/html; charset=utf-8',
	            url: getAbsolutePath(link, lastLink),
	            type: 'GET',
	            timeout: oldmanWebApp.setting.timeover,
	            success: function (data, textStatus, jqXHR) {
	                if (currentId != loadId) {
	                    return;
	                }
	                oldmanWebApp.loadingTip.hide();
	                
	                var json = jqXHR.getResponseHeader("X-Responded-JSON"),
	                    responded,
	                    view;

	                if (json) {
	                    responded = JSON.parse(json);
	                    if (responded.status == 401 && fnOnUnauthorized(responded.headers.location)) {
	                        return;
	                    }
	                    if (responded.headers && responded.headers.location) {
	                        document.location = responded.headers.location;
	                        return;
	                    }
	                }
	                
	                if (isRefresh) {
	                    view = element.children().last();
	                    if (view.data("link") == link) {
	                        view.empty();
	                        oldmanWebApp._currentViewEvent = new _event();
	                        view.html(data);
	                        links.setLastContext(view, oldmanWebApp._currentViewEvent);
	                        oldmanWebApp._currentViewEvent.load();
	                        oldmanWebApp._currentViewEvent.active();
	                        $(window).scrollTop(0);
	                    }
	                } else {
	                    if (isAdd) {
	                        links.setLastLastHide();
	                    } else {
	                        element.empty();
	                    }

	                    oldmanWebApp._currentViewEvent = new _event();
	                    view = $("<div></div>").addClass("render-view").data("link", link).html(data);
	                    element.append(view);
	                    links.setLastContext(view, oldmanWebApp._currentViewEvent);
	                    oldmanWebApp._currentViewEvent.load();
	                    oldmanWebApp._currentViewEvent.active();
	                    $(window).scrollTop(0);
	                }
	                oldmanWebApp.dealVisibleLoading();
	            },
	            error: function (jqXHR, textStatus, errorThrown) {
	                if (currentId != loadId) {
	                    return;
	                }
	                oldmanWebApp.loadingTip.hide();
	                if (jqXHR.status == 401 && fnOnUnauthorized(link)) {
	                    return;
	                }
	                var response = $(jqXHR.responseText),
                        title = $("<h4></h4>").text(errorThrown),
                        content = $("<pre></pre>"),
                        view;

	                if (response[11] != null && response[11].nodeType == 8) {
	                    content.text(response[11].data);
	                } else {
	                    content.text(response.eq(1).text());
	                }

	                if (isRefresh) {
	                    view = element.children().last();
	                    if (view.data("link") == link) {
	                        view.empty();
	                        view.append(title).append(content);
	                        links.setLastContext(view, new _event());
	                        $(window).scrollTop(0);
	                    }
	                } else {
	                    if (isAdd) {
	                        links.setLastLastHide();
	                    } else {
	                        element.empty();
	                    }
	                    view = $("<div></div>").addClass("render-view").data("link", link).append(title).append(content);
	                    element.append(view);
	                    links.setLastContext(view, new _event());
	                    $(window).scrollTop(0);
	                }
	            },
	            dataType: "html",
	            async: true
	        });
	    }
	    this.load = function (link) {
	        var hrefs = link.split("#"),
	            i,
	            context;

	        if (hrefs.length == 1 && links.first().link != hrefs[0]) {
	            links.clear();
	            links.push(link);
	            loadContent(link);
	        } else {
	            if (links.like(hrefs)) {
	                if (links.count() > hrefs.length) {
	                    for (i = links.count() - 1; i > hrefs.length - 1; i--) {
	                        context = links.pop();
	                        if (context.node) {
	                            context.event.inactive();
	                            context.event.unload();
	                            context.node.remove();
	                        }
	                    }
	                    if (!links.setLastShow()) {
	                        loadContent(hrefs[hrefs.length - 1], hrefs.length > 1, getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2));
	                    }
	                } else if (links.count() < hrefs.length) {
	                    for (i = links.count(); i < hrefs.length; i++) {
	                        links.push(hrefs[i]);
	                    }
	                    loadContent(hrefs[hrefs.length - 1], true, getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2));
	                } else {
	                    links.last().event.inactive();
	                    links.last().event.unload();
	                    loadContent(hrefs[hrefs.length - 1], null, getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2), true);
	                }
	            } else {
	                if (!links.dealNotStartWith(hrefs)) {
	                    loadContent(hrefs[hrefs.length - 1], true, getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2));
	                }
	            }
	        }
	    }
	    this.close = function () {
	        if (links.count() == 1) {
	            throw "it's not follow view, close failure.";
	        }
	        oldmanWebApp.link.hash(links.getBackLink());
	    }
	    this.getElement = function () {
	        return element;
	    }
	    this.setElement = function (node) {
	        return element = $(node);
	    }
	    this.getDefaultLink = function () {
	        return defaultLink;
	    }
	    this.setDefaultLink = function (link) {
	        defaultLink = link;
	    }
	    this.getOnUnauthorized = function () {
	        return fnOnUnauthorized;
	    }
	    this.setOnUnauthorized = function (fn) {
	        fnOnUnauthorized = fn;
	    }
	},

	event: function () {
	    return new function () {
	        this.onLoad = function (fn) {
	            oldmanWebApp._currentViewEvent.load = fn;
	            return this;
	        }
	        this.onUnload = function (fn) {
	            oldmanWebApp._currentViewEvent.unload = fn;
	            return this;
	        }
	        this.onActive = function (fn) {
	            oldmanWebApp._currentViewEvent.active = fn;
	            return this;
	        }
	        this.onInactive = function (fn) {
	            oldmanWebApp._currentViewEvent.inactive = fn;
	            return this;
	        }
	    }
	},

	viewClose: function () {
	    oldmanWebApp._mainView.close();
	},

	dealVisibleLoading: function () {
	    var loading = $(".webapp-loading:visible"),
	        src;

	    if (loading.length > 0 && !loading.data("work") && $(window).scrollTop() + $(window).height() > loading.offset().top) {
	        loading.data("work", true);
	        src = loading.attr("data-src");
	        if (!src) return;
	        $.get(src, function (data) {
	            loading.before(data);
	            loading.remove();
	            oldmanWebApp.dealVisibleLoading();
	        });
	    }
	},

	dealHrefTarget: {
	    _base: function (href) {
	        oldmanWebApp.link.hash(href);
	    },
	    _add: function (href) {
	        oldmanWebApp.link.addHash(href);
	    },
	    _same: function (href) {
	        oldmanWebApp.link.sameHash(href);
	    }
	},

	initOption: function (main) {
	    this.viewNode = function (node) {
	        if (!node) return main.getElement();
	        main.setElement(node);
	        return this;
	    }
	    this.defaultLink = function (link) {
	        if (!link) return main.getDefaultLink();
	        main.setDefaultLink(link);
	        return this;
	    }
	    this.unauthorized = function (fn) {
	        if (!fn) return main.getOnUnauthorized();
	        main.setOnUnauthorized(fn);
	        return this;
	    }
	    this.dealEmptyTarget = function (b) {
	        if (b == undefined) return oldmanWebApp._isDealEmptyTarget;
	        oldmanWebApp._isDealEmptyTarget = b;
	        return this;
	    }
	},

	init: function (viewNode, defaultLink) {
	    $("body").on("click", "a", function (e) {
	        var target = $(this).attr("target"),
                href = $(this).attr('href');

	        if (href == '#') {
	            e.preventDefault();
	            return;
	        }

	        if ($(this).hasClass("webapp-close")) {
	            e.preventDefault();
	            oldmanWebApp.viewClose();
	            return;
	        }

	        if (!target && oldmanWebApp._isDealEmptyTarget) {
	            e.preventDefault();
	            oldmanWebApp.link.hash(href);
	        } else if (oldmanWebApp.dealHrefTarget[target]) {
	            e.preventDefault();
	            oldmanWebApp.dealHrefTarget[target](href);
	        }
	    });
	    $(window).bind("scroll", oldmanWebApp.dealVisibleLoading);
	    $(window).bind("resize", oldmanWebApp.dealVisibleLoading);
	    oldmanWebApp._mainView = new oldmanWebApp.viewArea(viewNode, defaultLink);
	    oldmanWebApp.link._init(function (link) {
	        oldmanWebApp._mainView.load(link);
	    }, defaultLink);
	    return new oldmanWebApp.initOption(oldmanWebApp._mainView);
	}
}

$app = {
    alert: oldmanWebApp.dialog.alert,
    confirm: oldmanWebApp.dialog.confirm,
    message: oldmanWebApp.dialog.message,
    hash: oldmanWebApp.link.hash,
    addHash: oldmanWebApp.link.addHash,
    loadScript: oldmanWebApp.scriptLoader.load,
    loading: oldmanWebApp.loadingTip,
    event: oldmanWebApp.event,
    close: oldmanWebApp.viewClose,
    init: oldmanWebApp.init
};