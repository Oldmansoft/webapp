/*
* v1.3.5
* https://github.com/Oldmansoft/webapp
* Copyright 2016 Oldmansoft, Inc; http://www.apache.org/licenses/LICENSE-2.0
*/
if (!window.oldmansoft) window.oldmansoft = {};
window.oldmansoft.webapp = new (function () {
    var $webapp = this,
        constant,
        config,
        definition,
        util,
        variables;

    constant = {
        loadType: {
            get: "GET",
            post: "POST"
        }
    };

    config = {
        setting: {
            timeover: 180000,
            loading_show_time: 1000,
            loading_hide_time: 200,
            server_charset: "utf-8"
        },
        text: {
            ok: "Ok",
            yes: "Yes",
            no: "No",
            loading: "Loading",
            load_layout_error: "load layout error, click Ok to reload.",
        }
    };

    definition = {
        delay: function () {
            var lates = [];

            function get(key) {
                if (lates[key]) {
                    return lates[key];
                }
                lates[key] = { read: false, list: null };
                return lates[key];
            }

            this.ready = function (key) {
                if (get(key).ready) return;
                get(key).ready = true;

                var list = get(key).list,
                    i;

                if (!list) return;
                for (i = 0; i < list.length; i++) {
                    list[i]();
                }
                get(key).list = null;
            }
            this.reset = function (key) {
                delete lates[key];
            }
            this.execute = function (key, fn) {
                if (get(key).ready) {
                    fn();
                } else {
                    if (!get(key).list) get(key).list = [];
                    get(key).list.push(fn);
                }
            }
        },
        loader: function () {
            var has = [];

            function execute(args, index, deferred) {
                if (args.length == index + 1) {
                    deferred.resolve();
                } else {
                    load(args, index + 1, deferred);
                }
            }
            function load(args, index, deferred) {
                if (has[args[index]]) {
                    execute(args, index, deferred);
                    return;
                }
                $.getScript(args[index], function () {
                    has[args[index]] = true;
                    execute(args, index, deferred);
                });
            }

            this.script = function () {
                var result = $.Deferred();
                if (arguments.length == 0) {
                    result.resolve();
                } else {
                    load(arguments, 0, result);
                }
                return result;
            }
        },
        action: function () {
            var list = [];
            this.add = function (fn) {
                if (typeof (fn) != "function") throw new Error("fn is not a function");
                list.push(fn);
            }
            this.execute = function () {
                var argus = Array.from(arguments),
                    i,
                    result;
                for (i = 0; i < list.length; i++) {
                    result = list[i].apply(null, argus);
                    if (result != undefined) return result;
                }
            }
            this.copyTo = function (target) {
                var i;
                for (i = 0; i < list.length; i++) {
                    target.add(list[i]);
                }
            }
        },
        actionEvent: function () {
            this.before = new definition.action();
            this.after = new definition.action();
            this.completed = new definition.action();
        },
        scrollBar: function (target) {
            if (!target) {
                return;
            }
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

            function scrollTop(element, value) {
                if (element.selector == "body") {
                    if (value != undefined) {
                        $(document).scrollTop(value);
                    } else {
                        return $(document).scrollTop();
                    }
                } else {
                    if (value != undefined)
                        element.scrollTop(value);
                    else
                        return element.scrollTop();
                }
            }

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
                var height = (targetHelper.viewHeight() - arrowHeight) * scrollTop(target) / (targetHelper.contentHeight() - targetHelper.viewHeight());
                arrow.css("top", height);
            }

            function targetMouseWheel(e) {
                var node = e.target,
                    delta = e.originalEvent.wheelDelta,
                    targetScrollTop,
                    overflowY;
                while (node != e.currentTarget && node != null && node.tagName != "HTML" && node.tagName != "BODY") {
                    overflowY = node.style.overflowY;
                    if ((overflowY == "auto" || overflowY == "scroll") && node.clientHeight != node.scrollHeight) {
                        if (delta > 0 && node.scrollTop > 0) {
                            return true;
                        }
                        if (delta < 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
                            return true;
                        }
                    }
                    node = node.parentElement;
                }

                if (targetHelper.contentHeight() <= targetHelper.viewHeight()) return true;
                targetScrollTop = scrollTop(target);
                if (delta < 0) {
                    if (targetScrollTop >= (targetHelper.contentHeight() - targetHelper.viewHeight())) {
                        return true;
                    }
                } else {
                    if (targetScrollTop == 0) {
                        return true;
                    }
                }
                scrollTop(target, targetScrollTop - delta);
                setArrowPosition();
                return false;
            }

            function htmlSelectStart() {
                return false;
            }

            function arrowMouseDown(e) {
                downMouseY = e.clientY;
                downTargetTop = scrollTop(target);
                html.on("selectstart", htmlSelectStart);
                html.on("mousemove", htmlMouseMove);
                html.on("mouseup", htmlMouseUp);
                track.addClass("focus");
            }

            function htmlMouseUp() {
                html.off("selectstart", htmlSelectStart);
                html.off("mousemove", htmlMouseMove);
                html.off("mouseup", htmlMouseUp);
                track.removeClass("focus");
            }

            function htmlMouseMove(e) {
                var per = (targetHelper.contentHeight() - targetHelper.viewHeight()) / (targetHelper.viewHeight() - arrowHeight)
                scrollTop(target, downTargetTop - (downMouseY - e.clientY) * per);
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
            track.mousedown(arrowMouseDown);
            $(window).on("resize", reset);
            targetHelper.bindMouseWheel();

            this.show = function () {
                if (isShow) {
                    return;
                }
                container.show();
                targetHelper.bindMouseWheel();
                isShow = true;
            }
            this.hide = function () {
                if (!isShow) {
                    return;
                }
                targetHelper.unbindMouseWheel();
                container.hide();
                isShow = false;
            }
            this.reset = function () {
                reset();
            }
        },
        shield: function (areaClassName, content, isMiddle, className) {
            var node = $("<div></div>").addClass("box-background"),
                event = {
                    close: new definition.actionEvent()
                },
                centerNode,
                centerContentNode;

            function close(fn) {
                event.close.before.execute();
                node.stop(true);
                node.fadeOut(200, function () {
                    event.close.after.execute();
                    node.remove();
                    $webapp.bodyManagement.shrink();
                    event.close.completed.execute();
                    if (fn) fn();
                });
            }

            if (className) node.addClass(className);
            if (isMiddle) {
                centerNode = $("<div></div>").addClass("layout-center");
                centerContentNode = $("<div></div>").addClass("layout-center-content");
                centerContentNode.append(content);
                centerNode.append(centerContentNode);
                node.append(centerNode);
            } else {
                node.append(content);
            }
            $webapp.bodyManagement.expand();
            if ($(areaClassName).length == 0) {
                $("body").prepend($("<div></div>").addClass(areaClassName.replace(".", "")));
            }
            $(areaClassName).append(node);
            node.on("scroll", $webapp.refresh);
            node.fadeIn(200);

            this.close = function (fn) {
                close(fn);
            }
            this.change = function (content) {
                if (isMiddle) {
                    node.children().children().empty().append(content);
                } else {
                    node.empty().append(content);
                }
            }
            this.click = function (fn) {
                if (typeof (fn) != "function") return;
                node.on("click", function (e) {
                    if (e && e.target != e.currentTarget && (isMiddle && e.target != centerNode.get(0))) {
                        return;
                    }
                    fn();
                });
            }
            this.event = function () {
                return event;
            }
        },
        view: function (name, index, href, data, content) {
            var node = $("<div></div>").addClass("view").addClass(name + "-view"),
                parameter = new definition.viewEvent_parameter(name, index, href, node),
                state = {
                    loaded: false,
                    actived: false
                },
                event = {
                    view: null,
                    load: new definition.actionEvent(),
                    unload: new definition.actionEvent()
                },
                attach = {};

            function load(target) {
                var type = target.data ? constant.loadType.post : constant.loadType.get;
                state.loaded = true;
                event.view = new definition.viewEvent();
                variables.event.loadedView = event.view;

                if (content == undefined) {
                    event.load.before.execute(target);
                    util.load(target.node, href ? href : variables.defaultHref, target.data, type).done(function () {
                        event.load.after.execute(target);
                        variables.event.globalView.copyTo(variables.event.loadedView);
                        variables.event.loadedView.load.execute(parameter);
                        target.active();
                        event.load.completed.execute(target);
                    });
                } else {
                    target.node.append(content);
                    variables.event.globalView.copyTo(variables.event.loadedView);
                    variables.event.loadedView.load.execute(parameter);
                    target.active();
                }
            }

            this.name = name;
            this.index = index;
            this.href = href;
            this.data = data;
            this.node = node;
            this.unload = function () {
                event.unload.before.execute(this);
                if (state.actived) {
                    event.view.inactive.execute(parameter);
                    state.actived = false;
                }
                if (state.loaded) {
                    event.view.unload.execute(parameter);
                    state.loaded = false;
                }
                event.unload.after.execute(this);
                this.node.remove();
                this.href = undefined;
                event.unload.completed.execute(this);
                return this;
            }
            this.active = function () {
                if (!state.loaded) {
                    load(this);
                    return this;
                }
                if (state.actived) return this;

                this.node.show();
                $webapp.resetWindowScrollBar();
                event.view.active.execute(parameter);
                state.actived = true;
                return this;
            }
            this.inactive = function (hide) {
                if (!state.actived) return this;
                event.view.inactive.execute(parameter);
                if (hide) this.node.hide();
                state.actived = false;
                return this;
            }
            this.event = function (view) {
                if (view) event = view.event();
                return event;
            }
            this.attach = function (name, value) {
                if (value == undefined) return attach[name];
                attach[name] = value;
                return this;
            }
            this.state = function () {
                return { loaded: state.loaded, actived: state.actived };
            }
        },
        viewEvent_parameter: function (name, index, href, node) {
            this.name = name;
            this.index = index;
            this.href = href;
            this.node = node;
        },
        viewEvent: function () {
            this.load = new definition.action();
            this.unload = new definition.action();
            this.active = new definition.action();
            this.inactive = new definition.action();
            this.copyTo = function (target) {
                this.load.copyTo(target.load);
                this.unload.copyTo(target.unload);
                this.active.copyTo(target.active);
                this.inactive.copyTo(target.inactive);
            }
        },
        viewManager: function () {
            var list = [];

            this.add = function (view) {
                list.push(view);
                return view;
            }
            this.count = function () {
                return list.length;
            }
            this.get = function (index) {
                return list[index];
            }
            this.last = function () {
                if (list.length == 0) return null;
                return list[list.length - 1];
            }
            this.pop = function () {
                return list.pop();
            }
            this.clear = function () {
                var result = list;
                list = [];
                return result;
            }
        },
        mainViewer: function (selector) {
            var name = "main",
                views = new definition.viewManager();

            function changeViews(hrefs) {
                var view = new definition.view(name, hrefs.length - 1, hrefs[hrefs.length - 1]);
                view.event().load.after.add(function () {
                    var i;

                    for (i = views.count() - 1; i > hrefs.length - 1; i--) {
                        views.pop().unload();
                    }
                    for (i = 0; i < hrefs.length - 1; i++) {
                        if (i < views.count()) {
                            if (views.get(i).href == hrefs[i]) {
                                views.get(i).inactive(true);
                            } else {
                                views.get(i).unload();
                            }
                        } else {
                            views.add(new definition.view(name, i, hrefs[i]));
                        }
                    }
                    if (hrefs.length == views.count()) {
                        views.pop().unload();
                    }
                    views.add(view);
                    $(selector).append(view.node);
                });
                view.event().load.completed.add(function () {
                    $webapp.linker.callChangeCompleted(true);
                });
                view.active();
            }

            this.getView = function () {
                return views.last();
            }
            this.replaceLastView = function (view) {
                views.pop().unload();
                views.add(view);
                $(selector).append(view.node);
                view.active();
            }
            this.close = function () {
                $webapp.linker.back();
                return new function () {
                    this.completed = function (fn) {
                        $webapp.linker.setChangeCompleted(fn);
                    }
                }
            }
            this.reload = function (fn) {
                var view = new definition.view(name, views.count() - 1, views.last().href);
                view.event().load.after.add(function () {
                    views.pop().unload();
                    views.add(view);
                    $(selector).append(view.node);
                    if (typeof (fn) == "function") fn();
                });
                view.active();
            }
            this.redirect = function (href) {
                $webapp.linker.same(href);
            }
            this.linkerChange = function (hash) {
                var hrefs = new util.linkParser(hash).getHrefs(),
                    i,
                    view;

                $webapp.dialog.clear();
                variables.viewer.window.clear();

                if (hrefs.length >= views.count()) {
                    changeViews(hrefs);
                    return;
                }
                view = views.get(hrefs.length - 1);
                if (view.href != hrefs[hrefs.length - 1] || !view.state().loaded) {
                    changeViews(hrefs);
                    return;
                }

                for (i = views.count() - 1; i > hrefs.length - 1; i--) {
                    views.pop().unload();
                }
                for (i = 0; i < hrefs.length - 1; i++) {
                    if (views.get(i).href == hrefs[i]) continue;
                    views.get(i).unload();
                }
                views.last().active();
                $webapp.linker.callChangeCompleted(false);
            }
        },
        windowViewer: function () {
            var views = new definition.viewManager();

            function openReturnOption(view) {
                this.closed = function (fn) {
                    var argus,
                        i;
                    if (typeof (fn) != "function") throw new Error("fn is not a function");
                    view.attach("closed", fn);
                    if (arguments.length > 1) {
                        argus = [];
                        for (i = 1; i < arguments.length; i++) {
                            argus.push(arguments[i]);
                        }
                        view.attach("argus", argus);
                    }
                    return this;
                }
                this.loaded = function (fn) {
                    if (typeof (fn) != "function") throw new Error("fn is not a function");
                    view.attach("loaded", fn);
                    return this;
                }
                this.force = function () {
                    view.attach("force", true);
                    return this;
                }
            }

            this.getView = function () {
                return views.last();
            }
            this.replaceLastView = function (view) {
                views.pop().unload();
                views.add(view);
                view.attach("shield").change(view.node);
                view.active();
            }
            this.close = function () {
                var argus = Array.from(arguments),
                    closed = new definition.action();
                views.last().attach("shield").close(function () {
                    var view = views.pop().unload();
                    if (views.count() == 0) {
                        variables.viewer.manager.pop();
                    } else {
                        views.last().active();
                    }
                    if (view.attach("closed")) {
                        if (view.attach("argus")) {
                            argus = view.attach("argus").concat(argus);
                        }
                        view.attach("closed").apply(null, argus);
                    }
                    closed.execute();
                });
                return new function () {
                    this.completed = function (fn) {
                        closed.add(fn);
                    }
                }
            }
            this.reload = function (fn) {
                var oldView = views.last(),
                    view = new definition.view(oldView.name, oldView.index, oldView.href, oldView.data);
                view.attach("shield", oldView.attach("shield"));
                view.event().load.after.add(function () {
                    views.pop().unload();
                    views.add(view);
                    view.attach("shield").change(view.node);
                    if (typeof (fn) == "function") fn();
                });
                view.active();
            }
            this.redirect = function (href, data) {
                var oldView = views.last(),
                    view = new definition.view(oldView.name, oldView.index, href, data);
                view.attach("shield", oldView.attach("shield"));
                view.event().load.after.add(function () {
                    views.pop().unload();
                    views.add(view);
                    view.attach("shield").change(view.node);
                });
                view.active();
            }
            this.open = function (href, data) {
                var view = new definition.view("open", views.count(), href, data);
                view.event().load.after.add(function () {
                    if (views.count() == 0) {
                        variables.viewer.manager.push(variables.viewer.window);
                    } else {
                        views.last().inactive();
                    }
                    views.add(view);
                    view.attach("shield", new definition.shield(".window-ares", view.node, false, "window-background"));
                    if (view.attach("loaded")) view.attach("loaded")();
                });
                view.active();
                return new openReturnOption(view);
            }
            this.modal = function (href, data) {
                var view = new definition.view("modal", views.count(), href, data);
                view.node.addClass("box-panel");
                view.event().load.after.add(function () {
                    var shield;
                    if (views.count() == 0) {
                        variables.viewer.manager.push(variables.viewer.window);
                    } else {
                        views.last().inactive();
                    }
                    views.add(view);
                    shield = new definition.shield(".window-ares", view.node, true, "window-background");
                    if (!view.attach("force")) {
                        shield.click(function () {
                            shield.close(function () {
                                var view = views.pop().unload();
                                if (views.count() == 0) {
                                    variables.viewer.manager.pop();
                                } else {
                                    views.last().active();
                                }
                                if (view.attach("closed")) {
                                    if (view.attach("argus")) {
                                        view.attach("closed").apply(null, view.attach("argus"));
                                    } else {
                                        view.attach("closed")();
                                    }
                                }
                            });
                        });
                    }
                    view.attach("shield", shield);
                    if (view.attach("loaded")) view.attach("loaded")();
                });
                view.active();
                return new openReturnOption(view);
            }
            this.clear = function () {
                var list = views.clear(),
                    i;
                if (list.length == 0) return;
                for (i = list.length - 1; i > -1; i--) {
                    list[i].attach("shield").close();
                }
                variables.viewer.manager.pop();
            }
        },
        viewerManager: function () {
            var current,
                stack = [];
            this.push = function (viewer) {
                stack.push(current);
                if (current) current.getView().inactive();
                current = viewer;
            }
            this.get = function () {
                return current;
            }
            this.pop = function () {
                if (stack.length == 1) {
                    throw new Error("error call");
                }
                current = stack.pop();
                current.getView().active();
                return current;
            }
        },
        innerViewer: function () {
            var name = "inner";

            function viewManager() {
                var list = [];
                this.set = function (selector, view) {
                    list[selector] = view;
                }
                this.unload = function () {
                    for (var key in list) {
                        if (!list[key]) continue;
                        list[key].unload();
                    }
                }
                this.inactive = function () {
                    for (var key in list) {
                        if (!list[key]) continue;
                        list[key].inactive();
                    }
                }
            }

            this.name = name;
            this.load = function (selector, href) {
                var node = $webapp.currentViewNodeFind(selector),
                    view;
                if (node.length == 0) {
                    return;
                }

                view = new definition.view(name, 0, href);
                view.event().load.after.add(function () {
                    var currentView = variables.viewer.manager.get().getView(),
                        inner = new viewManager();
                    if (node.data("view")) {
                        node.data("view").unload();
                    }
                    node.data("view", view);
                    node.append(view.node);

                    if (!currentView.attach("inner")) {
                        currentView.attach("inner", inner);
                        variables.viewer.manager.get().getView().event().view.inactive.add(function () {
                            inner.inactive();
                        });
                        variables.viewer.manager.get().getView().event().view.unload.add(function () {
                            inner.unload();
                        });
                    }
                    currentView.attach("inner").set("selector", view);
                });
                view.active();
            }
            this.replaceLastView = function (selector, view) {
                var node = $webapp.currentViewNodeFind(selector),
                    currentView;
                if (node.length == 0) {
                    return;
                }

                currentView = variables.viewer.manager.get().getView(),
                    inner = new viewManager();
                if (node.data("view")) {
                    node.data("view").unload();
                }
                node.data("view", view);
                node.append(view.node);

                if (!currentView.attach("inner")) {
                    currentView.attach("inner", inner);
                    variables.viewer.manager.get().getView().event().view.inactive.add(function () {
                        inner.inactive();
                    });
                    variables.viewer.manager.get().getView().event().view.unload.add(function () {
                        inner.unload();
                    });
                }
                currentView.attach("inner").set("selector", view);
                view.active();
            }
        },
        dealTouchMove: function (e) {
            var path,
                i,
                isCancel = true;

            if ($("body").hasClass("layout-expanded")) {
                path = e.originalEvent.path;
                if (!path) return;
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
    }

    util = {
        linkParser: function (input) {
            var store = [],
                content,
                i;

            function fix(hash) {
                if (!hash) return "";
                if (hash.substr(0, 1) == "#") return hash.substr(1);
                return hash;
            }

            this.getHrefs = function () {
                return store.slice();
            }

            this.count = function () {
                return store.length;
            }

            this.add = function (href) {
                return store.push(fix(href));
            }

            this.pop = function () {
                return store.pop();
            }

            this.last = function (href) {
                if (href) {
                    store[store.length - 1] = fix(href);
                    return;
                }
                return store[store.length - 1];
            }

            this.getHash = function () {
                var links = [],
                    i;
                for (i = 0; i < store.length; i++) {
                    links.push($webapp.linkEncode(store[i]));
                }
                return links.join("_");
            }

            if (arguments.length == 0) return;
            if (input instanceof Array) store = input.slice();
            else {
                content = fix(input);
                if (content.indexOf("#") > -1 || content.indexOf("%23") > -1) {
                    store = content.replace(/%23/g, "#").split("#");
                } else {
                    store = content.split("_");
                    for (i = 0; i < store.length; i++) {
                        store[i] = $webapp.linkDecode(store[i]);
                    }
                }
            }
        },
        isHtmlDocument: function (data) {
            var spaceIndex,
                c;

            if (!data) return false;

            for (spaceIndex = 0; spaceIndex < data.length; spaceIndex++) {
                c = data.substr(spaceIndex, 1);
                if (c == " ") continue;
                if (c == "\r") continue;
                if (c == "\n") continue;
                if (c == "\t") continue;
                break;
            }
            if (data.substr(spaceIndex, 15) == "<!DOCTYPE html>") return true;
            if (data.substr(spaceIndex, 5) == "<html") return true;
            return false;
        },
        load: function (node, href, data, type) {
            var loadDone = new definition.action(),
                loadFail = new definition.action(),
                loading;

            function returnOption() {
                this.done = function (fn) {
                    loadDone.add(fn);
                }
                this.fail = function (fn) {
                    loadFail.add(fn);
                }
            }
            if (variables.hideMainViewFirstLoadingTips) {
                variables.hideMainViewFirstLoadingTips = false;
            } else {
                loading = $webapp.loadingTip.show();
            }
            $.ajax({
                mimeType: 'text/html; charset=' + config.setting.server_charset,
                url: href,
                data: data,
                type: type,
                timeout: config.setting.timeover
            }).done(function (content, textStatus, jqXHR) {
                if (loading) loading.hide();
                var xRespondedJson = jqXHR.getResponseHeader("X-Responded-JSON"),
                    json;

                if (xRespondedJson) {
                    json = JSON.parse(xRespondedJson);
                    if (json.status == 401) {
                        if (variables.event.unauthorized.execute(href, json.headers ? json.headers.location : null) !== false) {
                            if (json.headers && json.headers.location) {
                                document.location = json.headers.location;
                            }
                        }
                    }
                }
                if (util.isHtmlDocument(content)) {
                    alert("You try to load wrong content: " + href);
                    return;
                }

                node.html(content);
                loadDone.execute();
                $webapp.refresh();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                var response,
                    title,
                    content;
                if (loading) loading.hide();
                if (jqXHR.status == 401) {
                    if (variables.event.unauthorized.execute(href) === false) {
                        return;
                    }
                } else if (jqXHR.status == 0 && textStatus == "timeout") {
                    variables.event.loadTimeout.execute(node);
                    return;
                }

                title = $("<h4></h4>");
                if (errorThrown) {
                    title.text(errorThrown);
                } else {
                    title.text(jqXHR.status);
                }

                content = $("<pre></pre>");
                if (jqXHR.status == 404) {
                    content.text("Not found: " + href);
                } else if (jqXHR.getResponseHeader("content-type") == "text/plain") {
                    content.text(jqXHR.responseText);
                } else {
                    response = $(jqXHR.responseText);
                    if (response[11] != null && response[11].nodeType == 8) {
                        content.text(response[11].data);
                    } else {
                        content.text(response.eq(1).text());
                    }
                }

                node.append(title).append(content);
                loadDone.execute();
                loadFail.execute(jqXHR);
                $webapp.refresh();
            });
            return new returnOption();
        },
        deal: {
            json: function (json) {
                var text = json.text ? json.text : json.Text;
                if (text) {
                    $app.alert(text).ok(function () {
                        util.deal.close(json);
                    });
                } else {
                    util.deal.close(json);
                }
            },
            close: function (json) {
                var off = json.off ? json.off : json.Off;
                if (off) {
                    $webapp.viewClose().completed(function () {
                        util.deal.action(json);
                    });
                } else {
                    util.deal.action(json);
                }
            },
            action: function (json) {
                var path = json.path ? json.path : json.Path,
                    data = json.data ? json.data : json.Data,
                    renew = json.renew ? json.renew : json.Renew;
                if (data) {
                    variables.event.form.dealCustomized.execute(data);
                }

                if (path) {
                    $app.same(path);
                } else if (renew) {
                    $app.reload();
                }
            }
        },
        click: function (e) {
            var target = $(this).attr("target"),
                href = $(this).attr("href");

            if (href == undefined || (href.length > 0 && href[0] == "#")) {
                return;
            }
            if (target == "_none") {
                return;
            }
            if (!target) {
                e.preventDefault();
                variables.hrefTargetDealer._link(href);
                return;
            }
            if (variables.hrefTargetDealer[target]) {
                e.preventDefault();
                variables.hrefTargetDealer[target](href, $(this));
                return;
            }
            if (target[0] != "_") {
                variables.viewer.inner.load(target, href);
                e.preventDefault();
            }
        },
        verification: {
            required: function (input) {
                var type = input[0].attr("type"),
                    i;
                if (type == "checkbox" || type == "radio") {
                    for (i = 0; i < input.length; i++) {
                        if (input[i].prop("checked")) return true;
                    }
                } else {
                    for (i = 0; i < input.length; i++) {
                        if ($.trim(input[i].val()) != "") return true;
                    }
                }
                return false;
            },
            verify: function (rule, input) {
                if (!rule) return true;
                var list = rule.split(" "),
                    i;
                for (i = 0; i < list.length; i++) {
                    if (list[i] == "") continue;
                    if (util.verification[list[i]](input) === false) return false;
                }
                return true;
            }
        },
        form: {
            serialize: function (formData) {
                var list = [];
                formData.forEach(function (value, key) {
                    if (typeof (value) != "string") return;
                    list.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
                });
                return list.join("&");
            },
            image: function () {
                function dataURL2Blob(dataurl) {
                    var arr = dataurl.split(','),
                        mime = arr[0].match(/:(.*?);/)[1],
                        bstr = atob(arr[1]),
                        n = bstr.length,
                        u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    return new Blob([u8arr], { type: mime });
                }

                function appendFileToImages(element, file, blob, message) {
                    if (!$(element).data("images")) $(element).data("images", []);
                    $(element).data("images").push({ blob: blob, name: file.name });

                    if ($(element).data("images").length == element.files.length) {
                        message.close();
                        $(element).trigger("dealt");
                    }
                }

                function render(element, file, dataUrl, width, height, message) {
                    var image = new Image();
                    image.onload = function () {
                        var canvas,
                            ctx,
                            blob;

                        if (image.width <= width && image.height <= height) {
                            blob = file;
                        } else {
                            canvas = document.createElement("canvas");
                            ctx = canvas.getContext("2d");

                            if (image.width > width) {
                                image.height *= width / image.width;
                                image.width = width;
                            }
                            if (image.height > height) {
                                image.width *= height / image.height;
                                image.height = height;
                            }
                            canvas.width = image.width;
                            canvas.height = image.height;

                            ctx.drawImage(image, 0, 0, image.width, image.height);
                            blob = file.type == "image/jpeg" ? dataURL2Blob(canvas.toDataURL("image/jpeg", 0.94)) : dataURL2Blob(canvas.toDataURL(file.type));
                        }

                        appendFileToImages(element, file, blob, message);
                    };
                    image.src = dataUrl;
                }

                var attr, width, height, file, message, reader, i,
                    element = this;
                attr = $(this).attr("data-image");
                if (!attr) return;
                attr = attr.split("x");
                if (attr.length != 2) return;
                width = Number(attr[0]);
                height = Number(attr[1]);
                if (isNaN(width) || width < 1 || isNaN(height) || height < 1) return;

                $(this).trigger("dealing");
                $(this).data("images", null);
                if (this.files.length == 0) {
                    $(this).trigger("dealt");
                    return;
                }

                message = $app.message("图片处理中");
                for (i = 0; i < this.files.length; i++) {
                    file = this.files[i];
                    if (!file.type.match(/image.*/)) {
                        appendFileToImages(this, file, file, message);
                        continue;
                    }
                    reader = new FileReader();
                    reader.onload = function (e) {
                        render(element, file, e.target.result, width, height, message);
                    };
                    reader.readAsDataURL(file);
                }
            },
            verify: function (form) {
                function check() {
                    var valid = true,
                        list = [],
                        name;
                    form.find("[data-verify]").each(function () {
                        var input = $(this),
                            name = input.attr("name");
                        if (!name) name = input.attr("data-input");
                        if (!name) return;
                        if (!list[name]) list[name] = { verify: input.attr("data-verify"), input: [] };
                        if (!form.data("verify")) input.on("change", check);
                        list[name].input.push(input);
                    });
                    for (name in list) {
                        if (!util.verification.verify(list[name].verify, list[name].input)) {
                            valid = false;
                            break;
                        }
                    }
                    if (!form.data("verify")) {
                        form.data("verify", true);
                        form.on("change", check);
                    }

                    if (valid) {
                        form.removeClass("not-ready");
                    } else {
                        form.addClass("not-ready");
                    }
                    if (variables.event.form.verify.completed.execute(form, valid) === false) return false;
                    return valid;
                }
                if (variables.event.form.verify.before.execute(form) === false) return false;
                return check();
            },
            getFormData: function (form) {
                var data = new FormData();
                form.find("input[type!=file]").each(function () {
                    var input = $(this),
                        name = input.attr("name"),
                        type = input.attr("type");
                    if (!name || input.prop("readonly") || input.prop("disabled")) return;
                    if (type == "checkbox" || type == "radio") {
                        if (!input.prop("checked")) return;
                    }
                    data.append(name, $.trim(input.val()));
                });
                form.find("input[type=file]").each(function () {
                    var input = $(this),
                        name = input.attr("name"),
                        images = input.data("images"),
                        image,
                        i;
                    if (!name || input.prop("readonly") || input.prop("disabled")) return;
                    if (images) {
                        for (i = 0; i < images.length; i++) {
                            image = images[i];
                            if (!image) continue;
                            data.append(name, image.blob, image.name);
                        }
                    } else {
                        if (this.files.length == 0) {
                            data.append(name, new Blob([], { type: "application/octet-stream" }), "");
                        }
                        for (i = 0; i < this.files.length; i++) {
                            data.append(name, this.files[i], this.files[i].name);
                        }
                    }
                });
                form.find("select").each(function () {
                    var input = $(this),
                        name = input.attr("name");
                    if (!name || input.prop("readonly") || input.prop("disabled")) return;
                    data.append(name, input.val());
                });
                form.find("textarea").each(function () {
                    var input = $(this),
                        name = input.attr("name");
                    if (!name || input.prop("readonly") || input.prop("disabled")) return;
                    data.append(name, $.trim(input.val()));
                });
                return data;
            },
            submit: function () {
                var form = $(this),
                    action = form.attr("action"),
                    formData = util.form.getFormData(form),
                    target = form.attr("target"),
                    loading,
                    beforeResult;
                beforeResult = variables.event.form.submit.before.execute(form);
                if (beforeResult === false) return false;
                if (beforeResult === true) return;
                if (target == "_none") return;
                if (target == "_blank") return;
                if (!util.form.verify(form)) return false;

                if (target == "_open") {
                    $app.open(action, util.form.serialize(formData));
                    return false;
                }
                if (target && target[0] != "_" && $webapp.currentViewNodeFind(target).length == 0) {
                    return;
                }

                loading = $webapp.loadingTip.show();
                $.ajax({
                    url: action ? action : variables.defaultHref,
                    data: formData,
                    type: constant.loadType.post,
                    contentType: false,
                    processData: false
                }).done(function (content, textStatus, jqXHR) {
                    loading.hide();
                    var xRespondedJson = jqXHR.getResponseHeader("X-Responded-JSON"),
                        json,
                        type = jqXHR.getResponseHeader("content-type").split(";")[0],
                        view;

                    if (xRespondedJson) {
                        json = JSON.parse(xRespondedJson);
                        if (json.status == 401) {
                            if (variables.event.unauthorized.execute(href, json.headers ? json.headers.location : null) !== false) {
                                if (json.headers && json.headers.location) {
                                    document.location = json.headers.location;
                                }
                            }
                        }
                    }

                    variables.event.form.submit.after.execute(form, content, textStatus, jqXHR);
                    if (type == "application/json") {
                        util.deal.json(content);
                    } else {
                        if (target && target[0] != "_") {
                            view = new definition.view(variables.viewer.inner.name, 0, action, util.form.serialize(formData), content);
                            variables.viewer.inner.replaceLastView(target, view);
                        } else {
                            view = variables.viewer.manager.get().getView();
                            variables.viewer.manager.get().replaceLastView(new definition.view(view.name, view.index, action, util.form.serialize(formData), content));
                        }
                        $webapp.refresh();
                    }
                    variables.event.form.submit.completed.execute(form);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    loading.hide();
                    $app.alert($(jqXHR.responseText).eq(1).text(), jqXHR.statusText);
                });
                return false;
            }
        },
        initialization: function (mainViewSelector, defaultHref) {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                $.ajaxSetup({ cache: false });
            }
            $(document).on("click", "a,.a", util.click);
            $(document).on("submit", "form", util.form.submit);
            $(document).on("click", ".webapp-close", function (e) {
                e.preventDefault();
                $webapp.viewClose($(this).attr("data-close"));
            });
            $(document).on("change", "form input[type=file][data-image]", util.form.image)
            $webapp.configEvent().refresh($webapp.resetWindowScrollBar);
            $webapp.configEvent().refresh($webapp.dealScrollToVisibleLoading);
            $(window).on("scroll", $webapp.refresh);
            $(window).on("resize", $webapp.refresh);
            $(document).on("touchmove", definition.dealTouchMove);

            variables.defaultHref = defaultHref;
            variables.viewer.window = new definition.windowViewer();
            variables.viewer.main = new definition.mainViewer(mainViewSelector);
            variables.viewer.manager.push(variables.viewer.main);
            variables.event.initialled.execute();
            return variables.option;
        }
    };

    variables = {
        hasSetup: false,
        hideMainViewFirstLoadingTips: false,
        replacePCScrollBar: false,
        defaultHref: null,
        viewer: {
            main: null,
            window: null,
            manager: new definition.viewerManager(),
            inner: new definition.innerViewer()
        },
        event: {
            initialled: new definition.action(),
            globalView: new definition.viewEvent(),
            loadedView: new definition.viewEvent(),
            loadTimeout: new definition.action(),
            unauthorized: new definition.action(),
            refresh: new definition.action(),
            visibleLoaded: new definition.action(),
            form: {
                dealCustomized: new definition.action(),
                verify: new definition.actionEvent(),
                submit: new definition.actionEvent()
            }
        },
        windowScrollBar: null,
        hrefTargetDealer: {
            _link: function (href) {
                $webapp.linker.link(href);
            },
            _add: function (href) {
                $webapp.linker.add(href);
            },
            _same: function (href) {
                $webapp.linker.same(href);
            },
            _open: function (href) {
                $webapp.openWindow(href);
            }
        },
        option: new function () {
            this.defaultHref = function (href) {
                if (!href) return variables.defaultHref;
                variables.defaultHref = href;
                return this;
            }
            this.unauthorized = function (fn) {
                variables.event.unauthorized.add(fn);
                return this;
            }
            this.loadTimeout = function (fn) {
                variables.event.loadTimeout.add(fn);
                return this;
            }
            this.replacePCScrollBar = function (b) {
                variables.replacePCScrollBar = b;
                return this;
            }
            this.viewLoaded = function (fn) {
                variables.event.globalView.load.add(fn);
                return this;
            }
            this.viewActived = function (fn) {
                variables.event.globalView.active.add(fn);
                return this;
            }
            this.viewInactived = function (fn) {
                variables.event.globalView.inactive.add(fn);
                return this;
            }
            this.viewUnloaded = function (fn) {
                variables.event.globalView.unload.add(fn);
                return this;
            }
            this.visibleLoaded = function (fn) {
                variables.event.visibleLoaded.add(fn);
                return this;
            }
        }
    };

    this.bodyManagement = new function () {
        var count = 0;

        this.expand = function () {
            if (count == 0) {
                $("body").addClass("layout-expanded");
                if (variables.windowScrollBar) {
                    variables.windowScrollBar.reset();
                }
            }
            count++;
        }
        this.shrink = function () {
            count--;
            if (count == 0) {
                $("body").removeClass("layout-expanded");
                if (variables.windowScrollBar) {
                    variables.windowScrollBar.reset();
                }
            }
            if (count < 0) {
                console.error("shrink error");
            }
        }
    }

    this.loadingTip = new function () {
        var element,
            valid = false;

        function initElement() {
            if (element != null) {
                return;
            }
            element = $("<div></div>").addClass("loading-background").addClass("box-background");
            var dialog = $("<div></div>").addClass("loading-box").addClass("box-panel"),
                text = $("<span></span>").text(config.text.loading);

            dialog.append(text);
            element.append($("<div></div>").addClass("layout-center").append($("<div></div>").addClass("layout-center-content").append(dialog)));
            element.prependTo($("body"));
        }
        this.show = function () {
            initElement();
            if (valid) return this;
            $webapp.bodyManagement.expand();
            element.stop(true, true);
            element.fadeIn(config.setting.loading_show_time);
            valid = true;
            return this;
        }
        this.hide = function (fn) {
            if (!valid) return this;
            initElement();
            element.stop(true);
            element.fadeOut(config.setting.loading_hide_time, function () {
                $webapp.bodyManagement.shrink();
                if (typeof (fn) == "function") fn();
            });
            valid = false;
            return this;
        }
    }

    this.dialog = new function () {
        var list = [],
            messages = [];
        function elementBuilder() {
            var element = $("<div></div>").addClass("dialog-box").addClass("box-panel");

            this.head = function (title) {
                var header = $("<div></div>").addClass("dialog-header");
                header.append($("<h4></h4>").text(title));
                element.append(header);
            }
            this.body = function (text) {
                var body = $("<div></div>").addClass("dialog-body");
                if (text.indexOf("\n") > -1) {
                    $.each(text.split("\n"), function (i, n) {
                        body.append($("<p></p>").text(n));
                    });
                } else {
                    body.text(text);
                }
                element.append(body);
            }
            this.footer = function (shield) {
                var footer = $("<div></div>").addClass("dialog-footer");

                function returnOption(node) {
                    this.set = function (text, className) {
                        var closeCallback = new definition.action(),
                            button = $("<button></button>").text(text).addClass(className);

                        button.click(function () {
                            shield.close(function () {
                                closeCallback.execute();
                            });
                        });
                        node.append(button);
                        return new function () {
                            this.setCallback = function (fn) {
                                closeCallback.add(fn);
                            }
                        }
                    }
                }
                element.append(footer);
                return new returnOption(footer);
            }
            this.getNode = function () {
                return element;
            }
        }

        this.custom = function (node) {
            var shield = new definition.shield(".dialog-ares", node, true, "dialog-background"),
                index = list.length,
                force = false;
            list[index] = shield;
            shield.event().close.before.add(function () {
                delete list[index];
            });
            shield.click(function () {
                if (!force) shield.close();
            });
            return new function () {
                this.close = function (fn) {
                    shield.close(fn);
                }
                this.force = function () {
                    force = true;
                    return this;
                }
            }
        }
        this.alert = function (content, title) {
            var okButton,
                builder = new elementBuilder(),
                shield,
                index = list.length;

            function returnOption(button) {
                this.ok = function (fn) {
                    button.setCallback(fn);
                    return this;
                }
            }
            if (title) {
                builder.head(title);
            }
            builder.body(content);
            shield = new definition.shield(".dialog-ares", builder.getNode(), true, "dialog-background");
            list[index] = shield;
            shield.event().close.before.add(function () {
                delete list[index];
            });
            okButton = builder.footer(shield).set(config.text.ok, "ok");
            return new returnOption(okButton);
        }
        this.confirm = function (content, title) {
            var footer,
                builder = new elementBuilder(),
                shield,
                index = list.length;

            function returnOption(yesButton, noButton) {
                this.yes = function (fn) {
                    yesButton.setCallback(fn);
                    return this;
                }
                this.no = function (fn) {
                    noButton.setCallback(fn);
                    return this;
                }
            }
            if (title) {
                builder.head(title);
            }
            builder.body(content);
            shield = new definition.shield(".dialog-ares", builder.getNode(), true, "dialog-background");
            list[index] = shield;
            shield.event().close.before.add(function () {
                delete list[index];
            });
            footer = builder.footer(shield);
            return new returnOption(footer.set(config.text.yes, "yes"), footer.set(config.text.no, "no"));
        }
        this.message = function (content) {
            if (arguments.length == 0) {
                if (messages.length == 0) return null;
                return messages[messages.length - 1];
            }
            var builder = new elementBuilder(),
                custom;
            builder.body(content);
            custom = $webapp.dialog.custom(builder.getNode()).force();
            return new function () {
                this.close = function (fn) {
                    custom.close(fn);
                    messages.pop();
                }
                this.change = function (text) {
                    builder.getNode().find(".dialog-body").text(text);
                }
                messages.push(this);
            }
        }
        this.clear = function () {
            var i;
            for (i in list) {
                list[i].close();
            }
            list = [];
        }
    }

    this.linker = new function () {
        var inited = false,
            lastHash = null,
            changeCallback = new definition.action(),
            changeCompleted = null;

        function fixHref(href) {
            if (!href) return href;
            if (href.substr(0, 1) == "#") return href.substr(1);
            return href;
        }
        function callLeave() {
            changeCallback.execute(lastHash);
        }
        function hashChange() {
            var hash = new util.linkParser(window.location.hash).getHash();
            if (lastHash == hash) {
                return;
            }
            lastHash = hash;
            callLeave();
        }

        this.setChangeCompleted = function (fn) {
            if (typeof (fn) != "function") return;
            changeCompleted = fn;
        }
        this.callChangeCompleted = function (isNewContent) {
            if (!changeCompleted) {
                return;
            }
            changeCompleted(isNewContent);
            changeCompleted = null;
        }
        this.createHref = function (href) {
            var hash = new util.linkParser(href).getHash(),
                base = document.location.origin + document.location.pathname;
            if (hash == "") return base;
            return base + "#" + hash;
        }
        this.createHash = function (input) {
            return new util.linkParser(input).getHash();
        }
        this.hrefs = function () {
            return new util.linkParser(window.location.hash).getHrefs();
        }
        this.modify = function (hash) {
            window.location.hash = hash;
            lastHash = new util.linkParser(hash).getHash();
        }
        this.hash = function (hash) {
            if (hash == undefined) {
                return window.location.hash;
            }

            window.location.hash = hash;
            if (hash == lastHash) {
                callLeave();
            }
            return hash;
        }
        this.link = function () {
            if (arguments.length == 0) {
                return variables.viewer.manager.get().href;
            }
            
            var link = new util.linkParser(Array.from(arguments)),
                hash;

            hash = link.getHash();
            window.location.hash = hash;
            if (hash == lastHash) {
                callLeave();
            }
        }
        this.add = function (href) {
            var link = new util.linkParser(window.location.hash);
            link.add(href);
            window.location.hash = link.getHash();
        }
        this.back = function () {
            var link = new util.linkParser(window.location.hash);
            if (link.count() == 1) {
                return;
            }
            link.pop();
            window.location.hash = link.getHash();
        }
        this.same = function (href) {
            var link = new util.linkParser(window.location.hash);
            link.last(href);
            window.location.hash = link.getHash();
            if (link.getHash() == lastHash) {
                callLeave();
            }
        }
        this.refresh = function () {
            callLeave();
        }
        this.onChange = function (fn) {
            changeCallback.add(fn);
            if (inited) return;
            inited = true;

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

    this.form = util.form;

    this.linkEncode = function (text) {
        if (!text) return "";
        if (text.indexOf("#") == 0) return text.substr(1, text.length - 1);
        return text.replace(/\(/g, "(9)").replace(/\?/g, "(0)").replace(/\//g, "(1)").replace(/_/g, "(2)").replace(/#/g, "(3)").replace(/&/g, "(4)");
    }

    this.linkDecode = function (code) {
        if (!code) return "";
        return code.replace(/\(0\)/g, "?").replace(/\(1\)/g, "/").replace(/\(2\)/g, "_").replace(/\(3\)/g, "#").replace(/\(4\)/g, "&").replace(/\(9\)/g, "(");
    }

    this.redirect = function (href, data) {
        return variables.viewer.manager.get().redirect(href, data);
    }

    this.openWindow = function (href, data) {
        return variables.viewer.window.open(href, data);
    }

    this.modalWindow = function (href, data) {
        return variables.viewer.window.modal(href, data);
    }

    this.viewClose = function () {
        return variables.viewer.manager.get().close();
    }

    this.viewReload = function (fn) {
        return variables.viewer.manager.get().reload(fn);
    }

    this.viewEvent = function () {
        return new function () {
            this.onLoad = function (fn) {
                variables.event.loadedView.load.add(fn);
                return this;
            }
            this.onUnload = function (fn) {
                variables.event.loadedView.unload.add(fn);
                return this;
            }
            this.onActive = function (fn) {
                variables.event.loadedView.active.add(fn);
                return this;
            }
            this.onInactive = function (fn) {
                variables.event.loadedView.inactive.add(fn);
                return this;
            }
        }
    }

    this.currentViewNode = function () {
        var view = variables.viewer.manager.get().getView();
        if (view == null) return null;
        return view.node;
    }

    this.currentViewNodeFind = function (selector) {
        return $webapp.currentViewNode().find(selector);
    }

    this.resetWindowScrollBar = function () {
        if (variables.windowScrollBar) {
            variables.windowScrollBar.reset();
            return;
        }
        if ("ontouchmove" in document) {
            return;
        }
        if (!variables.replacePCScrollBar) {
            return;
        }
        variables.windowScrollBar = new definition.scrollBar("body");
    }

    this.dealScrollToVisibleLoading = function (rangeNode) {
        var loading,
            src,
            top;
        if (!$webapp.currentViewNode()) return;

        if (rangeNode && typeof (rangeNode.find) == "function") {
            loading = rangeNode.find(".webapp-loading:visible").first();
        } else {
            loading = $(".webapp-loading:visible").first();
        }

        if ($webapp.currentViewNode().hasClass("open-view")) {
            top = -$webapp.currentViewNode().position().top;
        } else {
            top = $(window).scrollTop();
        }

        if (loading.length > 0 && !loading.data("work") && top + $(window).height() > loading.offset().top) {
            loading.data("work", true);
            src = loading.attr("data-src");
            if (!src) {
                return;
            }
            $.get(src, function (data) {
                loading.before(data);
                loading.remove();
                $webapp.refresh(rangeNode);
                variables.event.visibleLoaded.execute();
            });
        }
    }

    this.refresh = function (range) {
        variables.event.refresh.execute(range);
    }

    this.configEvent = function () {
        return new function () {
            this.refresh = function (fn) {
                variables.event.refresh.add(fn);
            }
            this.formDealCustomized = function (fn) {
                variables.event.form.dealCustomized.add(fn);
            }
            this.formSubmit = function () {
                return variables.event.form.submit;
            }
            this.formVerify = function () {
                return variables.event.form.verify;
            }
        }
    }

    this.configSetting = function (fn) {
        if (typeof (fn) == "function") fn(config.setting);
    }

    this.configText = function (fn) {
        if (typeof (fn) == "function") fn(config.text);
    }

    this.configTarget = function (fn) {
        if (typeof (fn) == "function") fn(variables.hrefTargetDealer);
    }

    this.option = function () {
        return variables.option;
    }

    this.initialled = function (fn) {
        variables.event.initialled.add(fn);
    }

    this.setup = function (mainViewSelector, defaultHref, hideFirstLoading) {
        if (!variables.hasSetup) {
            variables.hasSetup = true;
        } else {
            throw new Error("Has been setup");
        }
        var result = util.initialization(mainViewSelector, defaultHref);
        $(function () {
            if (hideFirstLoading) variables.hideMainViewFirstLoadingTips = true;
            $webapp.linker.onChange(variables.viewer.main.linkerChange);
        });
        return result;
    }

    this.setupLayout = function (layoutSelector, layoutHref, mainViewSelector, defaultHref) {
        if (!variables.hasSetup) {
            variables.hasSetup = true;
        } else {
            throw new Error("Has been setup");
        }
        var result = util.initialization(mainViewSelector, defaultHref);
        $(function () {
            $.ajax({
                mimeType: 'text/html; charset=' + config.setting.server_charset,
                url: layoutHref,
                type: 'GET',
                timeout: config.setting.timeover
            }).done(function (data, textStatus, jqXHR) {
                var json = jqXHR.getResponseHeader("X-Responded-JSON"),
                    responded;

                if (json) {
                    responded = JSON.parse(json);
                    if (responded.status == 401) {
                        if (variables.event.unauthorized.execute(layoutHref, responded.headers ? responded.headers.location : null) !== false) {
                            if (responded.headers && responded.headers.location) {
                                document.location = responded.headers.location;
                            }
                        }
                        return;
                    }
                }

                if (util.isHtmlDocument(data)) {
                    alert("You try to load wrong content: " + layoutHref);
                    return;
                }
                $(layoutSelector).html(data).children().unwrap();
                variables.hideMainViewFirstLoadingTips = true;
                $webapp.linker.onChange(variables.viewer.main.linkerChange);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 401) {
                    if (variables.event.unauthorized.execute(layoutHref) === false) {
                        return;
                    }
                } else if (jqXHR.status == 0 && textStatus == "timeout") {
                    variables.event.loadTimeout.execute($(layoutSelector));
                    return;
                }
                $webapp.dialog.alert(config.text.load_layout_error, errorThrown).ok(function () {
                    document.location.reload();
                });
            });
        });
        return result;
    }

    window.$app = {
        configSetting: $webapp.configSetting,
        configText: $webapp.configText,
        configEvent: $webapp.configEvent,
        definition: {
            action: definition.action,
            actionEvent: definition.actionEvent
        },
        util: {
            delay: new definition.delay(),
            loader: new definition.loader()
        },
        alert: $webapp.dialog.alert,
        confirm: $webapp.dialog.confirm,
        message: $webapp.dialog.message,
        loading: function () {
            return $webapp.loadingTip.show();
        },
        hash: $webapp.linker.hash,
        link: $webapp.linker.link,
        add: $webapp.linker.add,
        same: $webapp.linker.same,
        open: $webapp.openWindow,
        modal: $webapp.modalWindow,
        reload: $webapp.viewReload,
        close: $webapp.viewClose,
        event: $webapp.viewEvent,
        current: $webapp.currentViewNode,
        find: $webapp.currentViewNodeFind,
        option: $webapp.option,
        setup: $webapp.setup,
        setupLayout: $webapp.setupLayout
    };
})();