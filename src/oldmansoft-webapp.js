/*
* v0.5.30
* https://github.com/Oldmansoft/webapp
* Copyright 2016 Oldmansoft, Inc; http://www.apache.org/licenses/LICENSE-2.0
*/
var oldmanWebApp,
    $app;

oldmanWebApp = {
    setting: {
        timeover: 180000
    },
    text: {
        confirm: "Cofirm",
        cancel: "Cancel",
        loading: "Loading"
    },
    _mainView: null,
    _openView: null,
    _activeView: null,
    _fnOnUnauthorized: function () { return false; },
    _currentViewEvent: null,
    _isDealLinkEmptyTarget: true,
    _isReplacePCScrollBar: true,
    _WindowScrollBar: null,
    _scrollbar: [],
    _canTouch: null,
    _globalViewEvent: null,
    messageBox: null,
    windowBox: null,

    getAbsolutePath: function (path, basePath, defaultLink) {
        if (path == "") path = defaultLink;
        if (path.substr(0, 1) == "/") {
            return path;
        }
        if (!basePath) basePath = document.location.pathname;
        var pathnames = basePath.split("/");
        pathnames.pop();
        return pathnames.join("/") + "/" + path;
    },

    getPathHasAbsolutePathFromArray: function (array, index, defaultLink) {
        for (var i = index; i > -1; i--) {
            if (array[i] == "" && defaultLink.substr(0, 1) == "/") return defaultLink;
            if (array[i].substr(0, 1) == "/") return array[i];
        }
        return null;
    },

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

    bodyManagement: new function () {
        var count = 0;

        this.expand = function () {
            if (count == 0) {
                $("body").addClass("layout-expanded");
                if (oldmanWebApp._WindowScrollBar) oldmanWebApp._WindowScrollBar.hide();
            }
            count++;
        }

        this.shrink = function () {
            count--;
            if (count == 0) {
                $("body").removeClass("layout-expanded");
                if (oldmanWebApp._WindowScrollBar) oldmanWebApp._WindowScrollBar.show();
            }
            if (count < 0) {
                throw "shrink error";
            }
        }
    },

    scrollbar: function (target) {
        if (!target) return;
        var targetDom,
            targetHelper,
            container,
            track,
            trackWidth,
            arrow,
            arrowHeight,
            html,
            downTargetTop,
            downMouseY,
            isShow = true;

        function bodyTarget(dom) {
            var contentHeight,
                viewHeight
                isSetTrackPosition = false;
            this.contentHeight = function () {
                return contentHeight;
            }
            this.viewHeight = function () {
                return viewHeight;
            }
            this.setHeight = function () {
                contentHeight = dom.scrollHeight;
                viewHeight = window.innerHeight;
            }
            this.setTrackPosition = function (track) {
                if (isSetTrackPosition) return true;
                track.css("position", "fixed");
                track.css("right", 0);
                track.css("top", 0);
                isSetTrackPosition = true;
                return true;
            }
            this.bindMouseWheel = function () {
                $(window).bind("mousewheel", targetMouseWheel);
            }
            this.unbindMouseWheel = function () {
                $(window).unbind("mousewheel", targetMouseWheel);
            }
        }

        function otherTarget($t, dom) {
            var contentHeight,
                viewHeight;

            this.contentHeight = function () {
                return contentHeight;
            }
            this.viewHeight = function () {
                return viewHeight;
            }
            this.setHeight = function () {
                contentHeight = dom.scrollHeight;
                viewHeight = $t.innerHeight();
            }
            this.setTrackPosition = function () {
                return false;
            }
            this.bindMouseWheel = function () {
                $t.bind("mousewheel", targetMouseWheel);
            }
            this.unbindMouseWheel = function () {
                $t.unbind("mousewheel", targetMouseWheel);
            }
        }

        function setArrowPosition() {
            arrow.css("top", (targetHelper.viewHeight() - arrowHeight) * target.scrollTop() / (targetHelper.contentHeight() - targetHelper.viewHeight()));
        }

        function targetMouseWheel(e) {
            if (targetHelper.contentHeight() <= targetHelper.viewHeight()) return true;
            var delta = e.originalEvent.wheelDelta,
                targetScrollTop = target.scrollTop();
            if (delta < 0) {
                if (targetScrollTop >= (targetHelper.contentHeight() - targetHelper.viewHeight())) {
                    return true;
                }
            } else {
                if (targetScrollTop == 0) {
                    return true;
                }
            }
            target.scrollTop(targetScrollTop - delta);
            setArrowPosition()
            return false;
        }

        function arrowMouseDown(e) {
            downMouseY = e.clientY;
            downTargetTop = target.scrollTop();
            html.bind("selectstart", htmlSelectStart);
            html.bind("mousemove", htmlMouseMove);
            html.bind("mouseup", htmlMouseUp);
        }

        function htmlSelectStart() {
            return false;
        }

        function htmlMouseUp() {
            html.unbind("selectstart", htmlSelectStart);
            html.unbind("mousemove", htmlMouseMove);
            html.unbind("mouseup", htmlMouseUp);
        }

        function htmlMouseMove(e) {
            var per = (targetHelper.contentHeight() - targetHelper.viewHeight()) / (targetHelper.viewHeight() - arrowHeight)
            target.scrollTop(downTargetTop - (downMouseY - e.clientY) * per);
            setArrowPosition();
        }

        function reset() {
            targetHelper.setHeight();
            if (targetHelper.viewHeight() == 0 || targetHelper.contentHeight() <= targetHelper.viewHeight()) {
                track.hide();
                return;
            } else {
                track.show();
            }
            track.height(targetHelper.viewHeight());
            if (!targetHelper.setTrackPosition(track)) {
                track.css("left", target.innerWidth() - parseInt(target.css("padding-left")) - trackWidth);
                track.css("top", -parseInt(target.css("padding-top")));
            }
            arrowHeight = track.height() * targetHelper.viewHeight() / targetHelper.contentHeight();
            if (arrowHeight < 20) arrowHeight = 20;
            arrow.height(arrowHeight);
        }

        target = $(target);
        targetDom = target.get(0);
        targetHelper = targetDom.tagName == "BODY" ? new bodyTarget(targetDom) : new otherTarget(target, targetDom);
        html = $("html");
        target.css("overflow", "hidden");
        container = $("<div></div>").addClass("scrollbar-container");
        track = $("<div></div>").addClass("scrollbar-track");
        arrow = $("<div></div>").addClass("scrollbar-arrow");
        container.append(track);
        track.append(arrow);
        target.prepend(container);
        trackWidth = track.width();
        reset();
        oldmanWebApp._scrollbar.push(this);
        track.mousedown(arrowMouseDown);
        arrow.mousedown(arrowMouseDown);
        $(window).bind("resize", reset);
        targetHelper.bindMouseWheel();

        this.show = function () {
            if (isShow) return;
            container.show();
            targetHelper.bindMouseWheel();
            isShow = true;
        }
        this.hide = function () {
            if (!isShow) return;
            targetHelper.unbindMouseWheel();
            container.hide();
            isShow = false;
        }
        this.reset = function () {
            reset();
        }
    },

    resetScrollbar: function () {
        for (var i = 0 ; i < oldmanWebApp._scrollbar.length; i++) {
            oldmanWebApp._scrollbar[i].reset();
        }
    },

    resetWindowScrollbar: function () {
        if (oldmanWebApp._WindowScrollBar) {
            oldmanWebApp._WindowScrollBar.reset();
            return;
        }
        if (oldmanWebApp._canTouch == null) {
            oldmanWebApp._canTouch = "ontouchmove" in document;
        }
        if (!oldmanWebApp._canTouch && oldmanWebApp._isReplacePCScrollBar) {
            oldmanWebApp._WindowScrollBar = new oldmanWebApp.scrollbar("body");
        }
    },

    createView: function (name, link) {
        return $("<div></div>").addClass(name + "-view").data("link", link);
    },

    viewEvent: function () {
        this.load = function () { };
        this.unload = function () { };
        this.active = function () { };
        this.inactive = function () { };
    },

    viewEventParameter: function (node, name, level) {
        this.node = node;
        this.name = name;
        this.level = level;
    },

    linkManagement: function () {
        var context = [];

        function item(link) {
            var eventParameter,
                visible = true,
                scrollTop = 0,
                scrollLeft = 0,
                viewEvent;

            this.link = link;
            this.node = null;

            this.hide = function () {
                if (!this.node || !visible) return;
                var win = $(window);
                scrollTop = win.scrollTop();
                scrollLeft = win.scrollLeft();
                oldmanWebApp._globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
                this.node.hide();
                visible = false;
            }

            this.callLoadAndActive = function () {
                oldmanWebApp._globalViewEvent.load(eventParameter, viewEvent.load(eventParameter));
                oldmanWebApp._globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
            }

            this.remove = function () {
                if (!this.node) return;
                oldmanWebApp._globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
                oldmanWebApp._globalViewEvent.unload(eventParameter, viewEvent.unload(eventParameter));
                this.node.remove();
                this.node = null;
                viewEvent = null;
            }

            this.show = function () {
                if (!this.node || visible) return;
                this.node.show();
                oldmanWebApp._globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
                $(window).scrollLeft(scrollLeft);
                $(window).scrollTop(scrollTop);
                visible = true;
            }

            this.activeEvent = function () {
                if (!viewEvent) return;
                oldmanWebApp._globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
            }

            this.inactiveEvent = function () {
                if (!viewEvent) return;
                oldmanWebApp._globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
            }

            this.setContext = function (node, event, name, level) {
                viewEvent = event;
                eventParameter = new oldmanWebApp.viewEventParameter(node, name, level);
                this.node = node;
            }
        }

        this.push = function (link) {
            context.push(new item(link));
        }

        this.pop = function () {
            return context.pop();
        }

        this.last = function () {
            return context[context.length - 1];
        }

        this.setLastContext = function (node, event, name, level) {
            var last = this.last();
            last.setContext(node, event, name, level);
            return last;
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

        this.get = function (index) {
            return context[index];
        }

        this.hasNode = function (index) {
            return context[index].node != null;
        }

        this.replace = function (index, link) {
            context[index] = new item(link);
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

        this.getLinks = function () {
            var result = [],
                i;
            for (i = 0; i < context.length; i++) {
                result.push(context[i].link);
            }
            return result;
        }
    },

    box: function (className, isMiddle) {
        var isInit = false,
	        element,
            core,
	        store = [],
	        current = null;

        function close(event, fn) {
            if (event && event.target != event.currentTarget) return;

            element.stop(true);
            element.fadeOut(200, function () {
                oldmanWebApp.bodyManagement.shrink();
                if (current.close) current.close();
                current.node.remove();

                if (store.length > 0) {
                    current = store.pop();
                    core.append(current.node);
                    if (fn) fn();
                    element.stop(true, true);
                    element.fadeIn(200);
                    return;
                }

                current = null;
                if (fn) fn();
            });
        }
        function initElement() {
            if (isInit) return;
            isInit = true;
            element = $("<div></div>").addClass(className).addClass("box-background");
            if (isMiddle) {
                core = $("<div></div>").addClass("layout-horizontal")
                element.append(core);
                element.append($("<div></div>").addClass("layout-vertical"));
            } else {
                core = element;
            }
            element.prependTo($("body"));
        }

        this.open = function (node, fnClose) {
            initElement();
            if (current) {
                if (current.node.data("type") == "message") {
                    throw "not allow show again after message show.";
                }
                store.push({ node: current.node.detach(), close: current.close });
            }
            oldmanWebApp.bodyManagement.expand();
            current = { node: node, close: fnClose };
            core.append(node);
            element.stop(true, true);
            element.fadeIn(200);
        }

        this.close = function (event, fn) {
            close(event, fn);
        }

        this.clear = function () {
            if (!current) return;
            if (current.close) current.close();
            current.node.remove();
            while (store.length > 0) {
                current = store.pop();
                core.append(current.node);
                if (current.close) current.close();
                current.node.remove();
            }
            current = null;
            element.hide();
        }
    },

    dialog: new function () {
        function setButton(node) {
            this.set = function (text, fn) {
                var button = $("<button></button>").text(text);
                button.click(function (event) {
                    oldmanWebApp.messageBox.close(event, fn);
                });
                node.append(button);
                return this;
            }
        }
        function elementBuilder() {
            var element = $("<div></div>").addClass("dialog-box").addClass("box-panel");
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
            this.getElement = function () {
                return element;
            }
        }
        this.alert = function (content, title, fn) {
            var builder = new elementBuilder();
            if (typeof title == "function") {
                fn = title;
                title = null;
            }
            if (title) {
                builder.setHead(title);
            }
            builder.setBody(content);
            builder.setFooter().set(oldmanWebApp.text.confirm, fn);
            oldmanWebApp.messageBox.open(builder.get("alert"));
        }
        this.confirm = function (content, title, fnConfirm, fnCancel) {
            var builder = new elementBuilder();
            if (typeof title == "function") {
                fnCancel = fnConfirm;
                fnConfirm = title;
                title = null;
            }
            if (title) {
                builder.setHead(title);
            }
            builder.setBody(content);
            builder.setFooter().set(oldmanWebApp.text.confirm, fnConfirm).set(oldmanWebApp.text.cancel, fnCancel);
            oldmanWebApp.messageBox.open(builder.get("confirm"));
        }
        this.message = function (content) {
            var builder = new elementBuilder();
            builder.setBody(content);
            oldmanWebApp.messageBox.open(builder.get("message"));
            return new function () {
                this.close = function (fn) {
                    oldmanWebApp.messageBox.close(null, fn);
                }
                this.change = function (text) {
                    builder.getElement().find(".dialog-body").text(text);
                }
            }
        }
    },

    loadingTip: new function () {
        var element;

        function initElement() {
            if (element != null) return;
            element = $("<div></div>").addClass("loading-background").addClass("box-background");
            var dialog = $("<div></div>").addClass("loading-box").addClass("box-panel"),
                text = $("<span></span>").text(oldmanWebApp.text.loading);

            dialog.append(text);
            element.append($("<div></div>").addClass("layout-horizontal").append(dialog)).append($("<div></div>").addClass("layout-vertical"));
            element.prependTo($("body"));
        }
        this.show = function () {
            initElement();
            oldmanWebApp.bodyManagement.expand();
            element.stop(true, true);
            element.fadeIn(2000);
            return new function () {
                this.hide = function () {
                    oldmanWebApp.loadingTip.hide();
                }
            }
        }
        this.hide = function () {
            initElement();
            element.stop(true);
            element.fadeOut(200, function () {
                oldmanWebApp.bodyManagement.shrink();
            });
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
            if (href == lastHash) {
                this.refresh();
            }
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

    openArea: function (link) {
        var defaultLink = link,
            links = new oldmanWebApp.linkManagement();

        function setView(link, first, second) {
            var view,
	            event,
	            lastNode;

            if (links.count() > 0) {
                links.last().hide();
            } else {
                oldmanWebApp._mainView.inactiveCurrent();
                oldmanWebApp._activeView = oldmanWebApp._openView;
            }

            view = oldmanWebApp.createView("open", link);
            oldmanWebApp._currentViewEvent = new oldmanWebApp.viewEvent();

            if (second == undefined) {
                view.html(first);
            } else {
                view.append(first).append(second);
            }

            event = oldmanWebApp._currentViewEvent;
            links.push(link);
            lastNode = links.setLastContext(view, event, "open", links.count());
            oldmanWebApp.windowBox.open(view, function () {
                lastNode.remove();
            });
            lastNode.callLoadAndActive();
        }

        this.load = function (link) {
            var loading = oldmanWebApp.loadingTip.show();
            $.ajax({
                mimeType: 'text/html; charset=utf-8',
                url: oldmanWebApp.getAbsolutePath(link, oldmanWebApp.getPathHasAbsolutePathFromArray(links.getLinks(), links.count() - 2, defaultLink), defaultLink),
                type: 'GET',
                timeout: oldmanWebApp.setting.timeover
            }).done(function (data, textStatus, jqXHR) {
                loading.hide();
                var json = jqXHR.getResponseHeader("X-Responded-JSON"),
	                responded;

                if (json) {
                    responded = JSON.parse(json);
                    if (responded.status == 401) {
                        if (!oldmanWebApp._fnOnUnauthorized(responded.headers.location)) {
                            if (responded.headers && responded.headers.location) {
                                document.location = responded.headers.location;
                                return;
                            }
                        }
                    }
                }

                setView(link, data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                loading.hide();
                if (jqXHR.status == 401) {
                    oldmanWebApp._fnOnUnauthorized(link);
                }
                var response = $(jqXHR.responseText),
                    title = $("<h4></h4>").text(errorThrown),
                    content = $("<pre></pre>");

                if (response[11] != null && response[11].nodeType == 8) {
                    content.text(response[11].data);
                } else {
                    content.text(response.eq(1).text());
                }

                setView(link, title, content);
            });
        }

        this.close = function () {
            links.pop();
            oldmanWebApp.windowBox.close(null, function () {
                var current = links.last();
                if (current) {
                    current.show();
                } else {
                    oldmanWebApp._activeView = oldmanWebApp._mainView;
                    oldmanWebApp._mainView.activeCurrent();
                }
            });
        }

        this.clear = function () {
            oldmanWebApp.windowBox.clear();
            if (links.count() > 0) {
                links = new oldmanWebApp.linkManagement();
            }
        }
    },

    viewArea: function (viewNode, link) {
        var loadId = 0,
            element = $(viewNode),
            defaultLink = link,
            links = new oldmanWebApp.linkManagement();

        function setView(link, onloadBefore, first, second) {
            var view,
	            event;

            if (onloadBefore) onloadBefore();
            view = oldmanWebApp.createView("main", link);
            element.append(view);
            oldmanWebApp._currentViewEvent = new oldmanWebApp.viewEvent();

            if (second == undefined) {
                view.html(first);
            } else {
                view.append(first).append(second);
            }

            event = oldmanWebApp._currentViewEvent;
            links.setLastContext(view, event, "main", links.count()).callLoadAndActive();
            oldmanWebApp.resetWindowScrollbar();
            $(window).scrollTop(0);
            oldmanWebApp.dealScrollToVisibleLoading();
        }

        function loadContent(link, basePath, onloadBefore) {
            var currentId = ++loadId,
                loading;

            loading = oldmanWebApp.loadingTip.show();
            $.ajax({
                mimeType: 'text/html; charset=utf-8',
                url: oldmanWebApp.getAbsolutePath(link, basePath, defaultLink),
                type: 'GET',
                timeout: oldmanWebApp.setting.timeover
            }).done(function (data, textStatus, jqXHR) {
                if (currentId != loadId) {
                    return;
                }
                loading.hide();

                var json = jqXHR.getResponseHeader("X-Responded-JSON"),
                    responded;

                if (json) {
                    responded = JSON.parse(json);
                    if (responded.status == 401) {
                        if (!oldmanWebApp._fnOnUnauthorized(responded.headers.location)) {
                            if (responded.headers && responded.headers.location) {
                                document.location = responded.headers.location;
                                return;
                            }
                        }
                    }
                }

                setView(link, onloadBefore, data);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (currentId != loadId) {
                    return;
                }
                loading.hide();

                if (jqXHR.status == 401) {
                    oldmanWebApp._fnOnUnauthorized(link);
                }
                var response = $(jqXHR.responseText),
                    title = $("<h4></h4>").text(errorThrown),
                    content = $("<pre></pre>");

                if (response[11] != null && response[11].nodeType == 8) {
                    content.text(response[11].data);
                } else {
                    content.text(response.eq(1).text());
                }

                setView(link, onloadBefore, title, content);
            });
        }

        this.load = function (link) {
            link = link.replace(/%23/g, '#');
            var hrefs = link.split("#"),
	            i,
	            context;

            oldmanWebApp._openView.clear();
            oldmanWebApp.messageBox.clear();

            if (links.count() > hrefs.length && links.like(hrefs) && (links.hasNode(hrefs.length - 1))) {
                for (i = links.count() - 1; i > hrefs.length - 1; i--) {
                    context = links.pop();
                    if (context.node) {
                        context.remove();
                    }
                }
                links.get(hrefs.length - 1).show();
                oldmanWebApp.resetWindowScrollbar();
                return;
            }

            loadContent(hrefs[hrefs.length - 1], oldmanWebApp.getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2, defaultLink), function () {
                var linksCount = links.count(),
	                hrefsLength = hrefs.length;

                for (i = linksCount - 1; i > hrefsLength - 1; i--) {
                    links.pop().remove();
                }
                for (i = 0; i < hrefsLength; i++) {
                    if (linksCount > i) {
                        if (links.get(i).link != hrefs[i] || (linksCount == i + 1 && hrefsLength == linksCount)) {
                            links.get(i).remove();
                            links.replace(i, hrefs[i]);
                        } else {
                            links.get(i).hide();
                        }
                    } else {
                        links.push(hrefs[i]);
                    }
                }
            });
        }

        this.close = function () {
            if (links.count() > 1) {
                oldmanWebApp.link.hash(links.getBackLink());
            }
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

        this.activeCurrent = function () {
            links.last().activeEvent();
        }

        this.inactiveCurrent = function () {
            links.last().inactiveEvent();
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
        oldmanWebApp._activeView.close();
    },

    dealScrollToVisibleLoading: function () {
        var loading = $(".webapp-loading:visible"),
	        src;

        if (loading.length > 0 && !loading.data("work") && $(window).scrollTop() + $(window).height() > loading.offset().top) {
            loading.data("work", true);
            src = loading.attr("data-src");
            if (!src) return;
            $.get(src, function (data) {
                loading.before(data);
                loading.remove();
                oldmanWebApp.resetWindowScrollbar();
                oldmanWebApp.dealScrollToVisibleLoading();
            });
        }
    },

    dealTouchMove: function (e) {
        var path,
            i,
            isCancel = true;

        if ($("body").hasClass("layout-expanded")) {
            path = e.originalEvent.path
            for (i = 0; i < path.length; i++) {
                if (path[i].tagName == "BODY") break;
                if (path[i].scrollHeight > path[i].clientHeight) {
                    isCancel = false;
                    break;
                }
            }
            if (isCancel) {
                e.preventDefault();
            }
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
        },
        _open: function (href) {
            oldmanWebApp.open(href);
        }
    },

    open: function (href) {
        oldmanWebApp._openView.load(href)
    },

    configSetting: function (fn) {
        if (typeof fn == "function") fn(oldmanWebApp.setting);
    },

    configText: function (fn) {
        if (typeof fn == "function") fn(oldmanWebApp.text);
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
            oldmanWebApp._fnOnUnauthorized = fn;
            return this;
        }
        this.dealLinkEmptyTarget = function (b) {
            if (b == undefined) return oldmanWebApp._isDealLinkEmptyTarget;
            oldmanWebApp._isDealLinkEmptyTarget = b;
            return this;
        }
        this.replacePCScrollBar = function (b) {
            oldmanWebApp._isReplacePCScrollBar = b;
            return this;
        }
        this.viewLoaded = function (fn) {
            oldmanWebApp._globalViewEvent.load = fn;
            return this;
        }
        this.viewActived= function (fn) {
            oldmanWebApp._globalViewEvent.active = fn;
            return this;
        }
        this.viewInactived = function (fn) {
            oldmanWebApp._globalViewEvent.inactive = fn;
            return this;
        }
        this.viewUnloaded = function (fn) {
            oldmanWebApp._globalViewEvent.unload = fn;
            return this;
        }
    },

    init: function (viewNode, defaultLink) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            $.ajaxSetup({ cache: false });
        }
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

            if (!target) {
                if (!oldmanWebApp._isDealLinkEmptyTarget) return;
                e.preventDefault();
                oldmanWebApp.dealHrefTarget._base(href);
                return;
            }

            if (oldmanWebApp.dealHrefTarget[target]) {
                e.preventDefault();
                oldmanWebApp.dealHrefTarget[target](href);
            }
        });
        $(window).bind("scroll", oldmanWebApp.dealScrollToVisibleLoading);
        $(window).bind("resize", oldmanWebApp.dealScrollToVisibleLoading);
        $(document).bind("touchmove", oldmanWebApp.dealTouchMove);
        $(document).bind("touchstart", oldmanWebApp.dealTouchStart);

        oldmanWebApp._globalViewEvent = new oldmanWebApp.viewEvent();
        oldmanWebApp._mainView = new oldmanWebApp.viewArea(viewNode, defaultLink);
        oldmanWebApp._openView = new oldmanWebApp.openArea(defaultLink);
        oldmanWebApp._activeView = oldmanWebApp._mainView;
        oldmanWebApp.link._init(function (link) {
            oldmanWebApp._mainView.load(link);
        });
        return new oldmanWebApp.initOption(oldmanWebApp._mainView);
    }
}

oldmanWebApp.messageBox = new oldmanWebApp.box("dialog-background", true);
oldmanWebApp.windowBox = new oldmanWebApp.box("window-background");

$app = {
    configSetting: oldmanWebApp.configSetting,
    configText: oldmanWebApp.configText,
    alert: oldmanWebApp.dialog.alert,
    confirm: oldmanWebApp.dialog.confirm,
    message: oldmanWebApp.dialog.message,
    loading: oldmanWebApp.loadingTip.show,
    loadScript: oldmanWebApp.scriptLoader.load,
    hash: oldmanWebApp.link.hash,
    baseHash: oldmanWebApp.link.hash,
    addHash: oldmanWebApp.link.addHash,
    sameHash: oldmanWebApp.link.sameHash,
    reload: oldmanWebApp.link.refresh,
    open: oldmanWebApp.open,
    event: oldmanWebApp.event,
    close: oldmanWebApp.viewClose,
    init: oldmanWebApp.init
};