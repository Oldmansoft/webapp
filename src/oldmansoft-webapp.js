/*
* v0.8.41
* https://github.com/Oldmansoft/webapp
* Copyright 2016 Oldmansoft, Inc; http://www.apache.org/licenses/LICENSE-2.0
*/
(function () {
    if (!window.oldmansoft) window.oldmansoft = {};
    window.oldmansoft.webapp = this;

    var _setting = {
        timeover: 180000,
        loading_show_time: 1000,
        loading_hide_time: 200
    },
    _text = {
        ok: "Ok",
        yes: "Yes",
        no: "No",
        loading: "Loading"
    },
    _mainView = null,
    _openView = null,
    _activeView = null,
    _fnOnUnauthorized = function () {
        return false;
    },
    _currentViewEvent = null,
    _isDealLinkEmptyTarget = true,
    _isReplacePCScrollBar = true,
    _WindowScrollBar = null,
    _scrollbar = [],
    _canTouch = null,
    _globalViewEvent = null,
    _dealHrefTarget,
    _messageBox,
    _windowBox;
    
    function getAbsolutePath(path, basePath, fullLink) {
        var indexOfAmpersand,
            indexOfQuestion,
            pathnames;
        if (path == "") path = fullLink;
        indexOfAmpersand = path.indexOf("&");
        if (indexOfAmpersand > -1) {
            indexOfQuestion = path.indexOf("?");
            if (indexOfQuestion == -1 || indexOfAmpersand < indexOfQuestion) {
                path = path.substr(0, indexOfAmpersand);
            }
        }
        if (path.substr(0, 1) == "/") {
            return path;
        }
        if (!basePath) {
            basePath = document.location.pathname;
        } else {
            indexOfQuestion = basePath.indexOf("?");
            if (indexOfQuestion > -1) {
                basePath = basePath.substr(0, indexOfQuestion);
            }
            indexOfAmpersand = basePath.indexOf("&");
            if (indexOfAmpersand > -1) {
                basePath = basePath.substr(0, indexOfAmpersand);
            }
        }
        pathnames = basePath.split("/");
        pathnames.pop();
        return pathnames.join("/") + "/" + path;
    }

    function getPathHasAbsolutePathFromArray(array, index, fullLink) {
        for (var i = index; i > -1; i--) {
            if (array[i] == "" && fullLink.substr(0, 1) == "/") return fullLink;
            if (array[i].substr(0, 1) == "/") return array[i];
        }
        return null;
    }

    this.scriptLoader = new function () {
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
    }

    this.bodyManagement = new function () {
        var count = 0;

        this.expand = function () {
            if (count == 0) {
                $("body").addClass("layout-expanded");
                if (_WindowScrollBar) _WindowScrollBar.hide();
            }
            count++;
        }

        this.shrink = function () {
            count--;
            if (count == 0) {
                $("body").removeClass("layout-expanded");
                if (_WindowScrollBar) _WindowScrollBar.show();
            }
            if (count < 0) {
                throw "shrink error";
            }
        }
    }

    this.scrollbar = function (target) {
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
                $(window).on("mousewheel", targetMouseWheel);
            }
            this.unbindMouseWheel = function () {
                $(window).off("mousewheel", targetMouseWheel);
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
                $t.on("mousewheel", targetMouseWheel);
            }
            this.unbindMouseWheel = function () {
                $t.off("mousewheel", targetMouseWheel);
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
            setArrowPosition();
            return false;
        }

        function arrowMouseDown(e) {
            downMouseY = e.clientY;
            downTargetTop = target.scrollTop();
            html.on("selectstart", htmlSelectStart);
            html.on("mousemove", htmlMouseMove);
            html.on("mouseup", htmlMouseUp);
        }

        function htmlSelectStart() {
            return false;
        }

        function htmlMouseUp() {
            html.off("selectstart", htmlSelectStart);
            html.off("mousemove", htmlMouseMove);
            html.off("mouseup", htmlMouseUp);
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
            setArrowPosition();
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
        _scrollbar.push(this);
        track.mousedown(arrowMouseDown);
        arrow.mousedown(arrowMouseDown);
        $(window).on("resize", reset);
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
    }

    this.resetScrollbar = function() {
        for (var i = 0 ; i < _scrollbar.length; i++) {
            _scrollbar[i].reset();
        }
    }

    this.resetWindowScrollbar = function() {
        if (_WindowScrollBar) {
            _WindowScrollBar.reset();
            return;
        }
        if (_canTouch == null) {
            _canTouch = "ontouchmove" in document;
        }
        if (!_canTouch && _isReplacePCScrollBar) {
            _WindowScrollBar = new scrollbar("body");
            setInterval(_WindowScrollBar.reset, 500);
        }
    }

    function createView(name, link) {
        return $("<div></div>").addClass(name + "-view").data("link", link);
    }

    function viewEvent() {
        this.load = function () { };
        this.unload = function () { };
        this.active = function () { };
        this.inactive = function () { };
    }

    function viewEventParameter(node, name, level) {
        this.node = node;
        this.name = name;
        this.level = level;
    }

    function linkManagement() {
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
                _globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
                this.node.hide();
                visible = false;
            }

            this.callLoadAndActive = function () {
                _globalViewEvent.load(eventParameter, viewEvent.load(eventParameter));
                _globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
            }

            this.remove = function () {
                if (!this.node) return;
                _globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
                _globalViewEvent.unload(eventParameter, viewEvent.unload(eventParameter));
                this.node.remove();
                this.node = null;
                viewEvent = null;
            }

            this.show = function () {
                if (!this.node || visible) return;
                this.node.show();
                _globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
                $(window).scrollLeft(scrollLeft);
                $(window).scrollTop(scrollTop);
                visible = true;
            }

            this.activeEvent = function () {
                if (!viewEvent) return;
                _globalViewEvent.active(eventParameter, viewEvent.active(eventParameter));
            }

            this.inactiveEvent = function () {
                if (!viewEvent) return;
                _globalViewEvent.inactive(eventParameter, viewEvent.inactive(eventParameter));
            }

            this.setContext = function (node, event, name, level) {
                viewEvent = event;
                eventParameter = new viewEventParameter(node, name, level);
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
    }

    this.box = function (className, isMiddle) {
        var isInit = false,
	        element,
            core,
	        store = [],
	        current = null;

        function close(event, fn) {
            if (event && event.target != event.currentTarget) return;

            element.stop(true);
            element.fadeOut(200, function () {
                bodyManagement.shrink();
                if (current == null) {
                    if (fn) fn();
                    return;
                }

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
            bodyManagement.expand();
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
    }

    _messageBox = new box("dialog-background", true);
    _windowBox = new box("window-background");

    this.dialog = new function () {
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
            this.setFooter = function () {
                var footer = $("<div></div>").addClass("dialog-footer");

                function option(node) {
                    this.set = function (text) {
                        var closeCallback,
                            button = $("<button></button>").text(text);

                        button.click(function (event) {
                            _messageBox.close(event, function () {
                                if (closeCallback) closeCallback();
                            });
                        });
                        node.append(button);
                        return new function () {
                            this.setCallback = function (fn) {
                                closeCallback = fn;
                            }
                        }
                    }
                }
                element.append(footer);
                return new option(footer);
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
            var okButton,
                builder = new elementBuilder();

            function option(button) {
                this.onConfirm = function (fn) {
                    console.warn("onConfirm is obsolete. commend use ok");
                    button.setCallback(fn);
                    return this;
                }
                this.ok = function (fn) {
                    button.setCallback(fn);
                    return this;
                }
            }
            if (typeof title == "function") {
                fn = title;
                title = null;
            }
            if (title) {
                builder.setHead(title);
            }
            builder.setBody(content);
            okButton = builder.setFooter().set(_text.ok);
            if (fn) {
                console.warn("fn is obsolete. commend use ok");
                okButton.setCallback(fn);
            }
            _messageBox.open(builder.get("alert"));
            return new option(okButton);
        }
        this.confirm = function (content, title, fnYes, fnNo) {
            var yesButton,
                noButton,
                footer,
                builder = new elementBuilder();

            function option(yesButton, noButton) {
                this.onConfirm = function (fn) {
                    console.warn("onConfirm is obsolete. commend use yes");
                    yesButton.setCallback(fn);
                    return this;
                }
                this.yes = function (fn) {
                    yesButton.setCallback(fn);
                    return this;
                }
                this.onCancel = function (fn) {
                    console.warn("onCancel is obsolete. commend use no");
                    noButton.setCallback(fn);
                    return this;
                }
                this.no = function (fn) {
                    noButton.setCallback(fn);
                    return this;
                }
            }
            if (typeof title == "function") {
                fnNo = fnYes;
                fnYes = title;
                title = null;
            }
            if (title) {
                builder.setHead(title);
            }
            builder.setBody(content);
            footer = builder.setFooter();
            yesButton = footer.set(_text.yes, fnYes);
            if (fnYes) {
                console.warn("fnYes is obsolete.");
                yesButton.setCallback(fnYes);
            }
            noButton = footer.set(_text.no, fnNo);
            if (fnNo) {
                console.warn("fnNo is obsolete.");
                noButton.setCallback(fnNo);
            }
            _messageBox.open(builder.get("confirm"));
            return new option(yesButton, noButton);
        }
        this.message = function (content) {
            var builder = new elementBuilder();
            builder.setBody(content);
            _messageBox.open(builder.get("message"));
            return new function () {
                this.close = function (fn) {
                    _messageBox.close(null, fn);
                }
                this.change = function (text) {
                    builder.getElement().find(".dialog-body").text(text);
                }
            }
        }
    }

    this.loadingTip = new function () {
        var element;

        function initElement() {
            if (element != null) return;
            element = $("<div></div>").addClass("loading-background").addClass("box-background");
            var dialog = $("<div></div>").addClass("loading-box").addClass("box-panel"),
                text = $("<span></span>").text(_text.loading);

            dialog.append(text);
            element.append($("<div></div>").addClass("layout-horizontal").append(dialog)).append($("<div></div>").addClass("layout-vertical"));
            element.prependTo($("body"));
        }
        this.show = function () {
            initElement();
            bodyManagement.expand();
            element.stop(true, true);
            element.fadeIn(_setting.loading_show_time);
            return new function () {
                this.hide = function () {
                    loadingTip.hide();
                }
            }
        }
        this.hide = function () {
            initElement();
            element.stop(true);
            element.fadeOut(_setting.loading_hide_time, function () {
                bodyManagement.shrink();
            });
        }
    }

    this.linker = new function () {
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
                callLeave();
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
                callLeave();
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
    }

    function openArea() {
        var links = new linkManagement();

        function setView(link, first, second) {
            var view,
	            event,
	            lastNode;

            if (links.count() > 0) {
                links.last().hide();
            } else {
                _mainView.inactiveCurrent();
                _activeView = _openView;
            }

            view = createView("open", link);
            _currentViewEvent = new viewEvent();

            if (second == undefined) {
                view.html(first);
            } else {
                view.append(first).append(second);
            }

            event = _currentViewEvent;
            links.push(link);
            lastNode = links.setLastContext(view, event, "open", links.count());
            _windowBox.open(view, function () {
                lastNode.remove();
            });
            lastNode.callLoadAndActive();
        }

        this.load = function (link, data) {
            var loading = loadingTip.show();
            $.ajax({
                mimeType: 'text/html; charset=utf-8',
                url: getAbsolutePath(link, getPathHasAbsolutePathFromArray(links.getLinks(), links.count() - 2, _mainView.getDefaultLink()), _mainView.getDefaultLink()),
                data: data,
                type: 'GET',
                timeout: _setting.timeover
            }).done(function (data, textStatus, jqXHR) {
                loading.hide();
                var json = jqXHR.getResponseHeader("X-Responded-JSON"),
	                responded;

                if (json) {
                    responded = JSON.parse(json);
                    if (responded.status == 401) {
                        if (!_fnOnUnauthorized(responded.headers.location)) {
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
                    _fnOnUnauthorized(link);
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
            _windowBox.close(null, function () {
                var current = links.last();
                if (current) {
                    current.show();
                } else {
                    _activeView = _mainView;
                    _mainView.activeCurrent();
                }
            });
        }

        this.clear = function () {
            _windowBox.clear();
            if (links.count() > 0) {
                links = new linkManagement();
            }
        }
    }

    function viewArea(viewNode, link) {
        var loadId = 0,
            element = $(viewNode),
            defaultLink = link,
            links = new linkManagement();

        function setView(link, onloadBefore, first, second) {
            var view,
	            event;

            if (onloadBefore) onloadBefore();
            view = createView("main", link);
            element.append(view);
            _currentViewEvent = new viewEvent();

            if (second == undefined) {
                view.html(first);
            } else {
                view.append(first).append(second);
            }

            event = _currentViewEvent;
            links.setLastContext(view, event, "main", links.count()).callLoadAndActive();
            resetWindowScrollbar();
            $(window).scrollTop(0);
            dealScrollToVisibleLoading();
        }

        function loadContent(link, basePath, onloadBefore) {
            var currentId = ++loadId,
                loading;

            loading = loadingTip.show();
            $.ajax({
                mimeType: 'text/html; charset=utf-8',
                url: getAbsolutePath(link, basePath, defaultLink),
                type: 'GET',
                timeout: _setting.timeover
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
                        if (!_fnOnUnauthorized(responded.headers.location)) {
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
                    _fnOnUnauthorized(link);
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

            _openView.clear();
            _messageBox.clear();

            if (links.count() > hrefs.length && links.like(hrefs) && (links.hasNode(hrefs.length - 1))) {
                for (i = links.count() - 1; i > hrefs.length - 1; i--) {
                    context = links.pop();
                    if (context.node) {
                        context.remove();
                    }
                }
                links.get(hrefs.length - 1).show();
                resetWindowScrollbar();
                return;
            }

            loadContent(hrefs[hrefs.length - 1], getPathHasAbsolutePathFromArray(hrefs, hrefs.length - 2, defaultLink), function () {
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
                linker.hash(links.getBackLink());
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
    }

    this.event = function () {
        return new function () {
            this.onLoad = function (fn) {
                _currentViewEvent.load = fn;
                return this;
            }

            this.onUnload = function (fn) {
                _currentViewEvent.unload = fn;
                return this;
            }

            this.onActive = function (fn) {
                _currentViewEvent.active = fn;
                return this;
            }

            this.onInactive = function (fn) {
                _currentViewEvent.inactive = fn;
                return this;
            }
        }
    }

    this.viewClose = function () {
        _activeView.close();
    }

    this.dealScrollToVisibleLoading = function () {
        var loading = $(".webapp-loading:visible"),
	        src;

        if (loading.length > 0 && !loading.data("work") && $(window).scrollTop() + $(window).height() > loading.offset().top) {
            loading.data("work", true);
            src = loading.attr("data-src");
            if (!src) return;
            $.get(src, function (data) {
                loading.before(data);
                loading.remove();
                resetWindowScrollbar();
                dealScrollToVisibleLoading();
            });
        }
    }

    function dealTouchMove(e) {
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
    }

    _dealHrefTarget = {
        _base: function (href) {
            linker.hash(href);
        },
        _add: function (href) {
            linker.addHash(href);
        },
        _same: function (href) {
            linker.sameHash(href);
        },
        _open: function (href, target) {
            open(href, target.attr("data-data"));
        }
    }

    this.open = function (href, data) {
        _openView.load(href, data);
    }

    this.configSetting = function (fn) {
        if (typeof fn == "function") fn(_setting);
    }

    this.configText = function (fn) {
        if (typeof fn == "function") fn(_text);
    }

    this.init = function (viewNode, defaultLink) {
        function option(main) {
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
                _fnOnUnauthorized = fn;
                return this;
            }
            this.dealLinkEmptyTarget = function (b) {
                if (b == undefined) return _isDealLinkEmptyTarget;
                _isDealLinkEmptyTarget = b;
                return this;
            }
            this.replacePCScrollBar = function (b) {
                _isReplacePCScrollBar = b;
                return this;
            }
            this.viewLoaded = function (fn) {
                _globalViewEvent.load = fn;
                return this;
            }
            this.viewActived = function (fn) {
                _globalViewEvent.active = fn;
                return this;
            }
            this.viewInactived = function (fn) {
                _globalViewEvent.inactive = fn;
                return this;
            }
            this.viewUnloaded = function (fn) {
                _globalViewEvent.unload = fn;
                return this;
            }
        }

        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            $.ajaxSetup({ cache: false });
        }
        $(document).on("click", "a", function (e) {
            var target = $(this).attr("target"),
                href = $(this).attr('href');

            if (href == '#') {
                e.preventDefault();
                return;
            }
            
            if (!target) {
                if (!_isDealLinkEmptyTarget) return;
                e.preventDefault();
                _dealHrefTarget._base(href);
                return;
            }

            if (_dealHrefTarget[target]) {
                e.preventDefault();
                _dealHrefTarget[target](href, $(this));
            }
        });
        $(document).on("click", ".webapp-close", function (e) {
            e.preventDefault();
            viewClose();
        });
        $(window).on("scroll", dealScrollToVisibleLoading);
        $(window).on("resize", dealScrollToVisibleLoading);
        $(document).on("touchmove", dealTouchMove);

        _globalViewEvent = new viewEvent();
        _mainView = new viewArea(viewNode, defaultLink);
        _openView = new openArea();
        _activeView = _mainView;
        linker._init(function (link) {
            _mainView.load(link);
        });
        return new option(_mainView);
    }

    window.$app = {
        configSetting: configSetting,
        configText: configText,
        alert: dialog.alert,
        confirm: dialog.confirm,
        message: dialog.message,
        loading: loadingTip.show,
        loadScript: scriptLoader.load,
        hash: linker.hash,
        baseHash: linker.hash,
        addHash: linker.addHash,
        sameHash: linker.sameHash,
        reload: linker.refresh,
        open: open,
        event: event,
        close: viewClose,
        init: init
    };
})();