/* version 0.2.12 */
oldmansoft.webapp.extend = {};
oldmansoft.webapp.extend.form_verify = function (form) {
	function checkReady() {
		var valid = true,
            checkedInput = {};
		form.find("input,textarea").each(function () {
			var $input = $(this),
                verify = $input.attr("data-verify");
			if (!verify) return;
			if (verify.indexOf("required") > -1) {
				if ($input.attr("type") == "radio" || $input.attr("type") == "checkbox") {
					if ($input.prop("checked")) {
					    checkedInput[$input.attr("name")] = true;
					} else if (checkedInput[$input.attr("name")] == undefined) {
					    checkedInput[$input.attr("name")] = false;
					}
				} else if ($.trim($input.val()) == "") {
					valid = false;
					return false;
				}
			}
		});
		for (var item in checkedInput) {
		    if (checkedInput[item] == false) {
				valid = false;
				form.find("input[name=" + item + "]").parent().addClass("verify-invalid");
		    } else {
		        form.find("input[name=" + item + "]").parent().removeClass("verify-invalid");
		    }
		}

		if (form.data("verify").has()) valid = false;

		if (valid) {
			if (form.hasClass("not-ready")) {
				form.removeClass("not-ready");
				form.trigger("change");
			}
		} else {
			if (!form.hasClass("not-ready")) {
				form.addClass("not-ready");
				form.trigger("change");
			}
		}
	}

	if (form.length == 0) return;
	if (form.find("[data-verify]").length == 0) return;

	form.data("verify", new function () {
		var items = [];
		this.add = function (item) {
			for (var i = 0; i < items.length; i++) {
				if (items[i] == item) return;
			}
			items.push(item);
			checkReady();
		}
		this.remove = function (item) {
			for (var i = 0; i < items.length; i++) {
				if (items[i] == item) {
					items.splice(i, 1);
					checkReady();
					return;
				}
			}
		}
		this.has = function () {
			return items.length > 0;
		}
	});
	form.find("input,textarea").each(function () {
		var $input = $(this),
            verify = $input.attr("data-verify");
		if (!verify) return;
		$input.on("change keyup", checkReady);
	});
	form.data("check", checkReady);
	checkReady();
}

oldmansoft.webapp.extend.deal = new function () {
	var result;
	function action() {
		if (result.script) {
			eval(result.script);
		}

		if (result.redirect) {
			$app.same(result.redirect);
		} else if (result.refresh) {
			$app.reload();
		}
	}

	function close() {
		if (result.close) {
		    $app.close().completed(action);
			return;
		}
		action();
	}

	this.execute = function (service) {
		result = service;
		if (service.message != null) {
			$app.alert(service.message).ok(function () {
				close();
			});
			return;
		}
		close();
	}
}

oldmansoft.webapp.extend.link_script_click = function () {
    var link = $(this),
        confirmCall = link.attr("data-confirm-call"),
        confirm = link.attr("data-confirm"),
        call = link.attr("data-call");
    function click() {
        var loading;
        if (call) eval(call);
        loading = $app.loading();
        $.ajax({
            url: link.attr("href"),
            type: "POST"
        }).done(function (result) {
            loading.hide();
            oldmansoft.webapp.extend.deal.execute(result);
        }).fail(function (error) {
            loading.hide();
            alert(error.statusText);
        });
    }
    if (link.hasClass("disabled")) return false;
    if (confirmCall) {
        var confirmContent = eval(confirmCall);
        if (confirmContent) {
            $app.confirm(confirmContent, "请确认").yes(click);
        } else {
            click();
        }
    } else if (confirm) {
        $app.confirm(confirm, "请确认").yes(click);
    } else {
        click();
    }
    return false;
}

oldmansoft.webapp.extend.form_auto_submit = function() {
    var form = $(this),
        result;

	function dealAction() {
		if (result.script) {
			eval(result.script);
		}

		if (result.redirect) {
			$app.same(result.redirect);
		} else if (result.refresh) {
			$app.reload();
		}
	}
	function dealClose() {
		if (result.close) {
		    $app.close().completed(dealAction);
			return;
		}
		dealAction();
	}

	function GetFormData(form, formData) {
	    form.find("input[type!=file]").each(function () {
	        var $this = $(this);
	        if (!$this.attr("name")) return;
	        if ($this.prop("readonly") || $this.prop("disabled")) return;
	        if ($this.attr("type") == "checkbox" || $this.attr("type") == "radio") {
	            if (!$this.prop("checked")) return;
	        }
	        formData.append($this.attr("name"), $this.val());
	    });
	    form.find("input[type=file]").each(function () {
	        var $this = $(this);
	        if (!$this.attr("name")) return;
	        if ($this.prop("readonly") || $this.prop("disabled")) return;
	        if ($this.data("images")) {
	            for (var i = 0; i < $this.get(0).files.length; i++) {
	                formData.append($this.attr("name"), $this.data("images")[i], $this.get(0).files[i].name);
	            }
	        } else {
	            if ($this.get(0).files.length == 0) {
	                formData.append($this.attr("name"), new Blob([], { type: "application/octet-stream" }), "");
	            }
	            for (var i = 0 ; i < $this.get(0).files.length; i++) {
	                formData.append($this.attr("name"), $this.get(0).files[i], $this.get(0).files[i].name);
	            }
	        }
	    });
	    form.find("select").each(function () {
	        var $this = $(this);
	        if (!$this.attr("name")) return;
	        if ($this.prop("readonly") || $this.prop("disabled")) return;
	        formData.append($this.attr("name"), $this.val());
	    });
	    form.find("textarea").each(function () {
	        var $this = $(this);
	        if (!$this.attr("name")) return;
	        if ($this.prop("readonly") || $this.prop("disabled")) return;
	        formData.append($this.attr("name"), $this.val());
	    });
	}

	function ImageDealSubmit(form) {
	    var formData = new FormData();
	    GetFormData(form, formData);

	    var result = $.ajax({
	        url: form.attr("action"),
	        type: "POST",
	        xhr: function () {
	            return $.ajaxSettings.xhr();
	        },
	        data: formData,
	        contentType: false,
	        processData: false
	    });
	    return result;
	}

	var FormGetSubmit = function (form) {
	    var data = new (function () {
	        var content = [];
	        this.append = function (name, value) {
	            content.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
	        }
	        this.get = function (splitChar) {
	            if (content.length == 0) return "";
	            return splitChar + content.join("&");
	        }
	    })();
	    GetFormData(form, data);
	    if (form.attr("target") && oldmansoft.webapp.getDealHrefTarget()[form.attr("target")]) {
	        oldmansoft.webapp.getDealHrefTarget()[form.attr("target")](form.attr("action") + data.get(form.attr("action").indexOf("?") > -1 ? "&" : "?"))
	    } else {
	        $app.link(form.attr("action") + data.get(form.attr("action").indexOf("?") > -1 ? "&" : "?"));
	    }
	}

	function submitForm() {
		var loading,
            submit = null;
		if (form.attr("data-script")) {
		    submit = eval(form.attr("data-script"));
		    return;
		} else if (!form.attr("method") || form.attr("method").toLowerCase() != "post") {
			FormGetSubmit(form);
			return;
		}

		loading = $app.loading();
		if (form.hasClass("image-deal")) {
			submit = ImageDealSubmit(form);
		} else {
			submit = form.ajaxSubmit().data("jqxhr");
		}
		submit.done(function (service) {
			loading.hide();
			result = service;
			if (service.message != null) {
				$app.alert(service.message).ok(function () {
					dealClose();
				});
				return;
			}
			dealClose();
		}).fail(function (error) {
			loading.hide();
			$app.alert($(error.responseText).eq(1).text(), error.statusText);
		});
	}

	if (form.hasClass("not-ready")) return false;
	if (form.hasClass("disabled")) return false;
	if (form.attr("data-confirm-call")) {
		var confirmContent = eval(form.attr("data-confirm-call"));
		if (confirmContent) {
			$app.confirm(confirmContent, "请确认").yes(submitForm);
		} else {
			submitForm();
		}
	} else if (form.attr("data-confirm")) {
		$app.confirm(form.attr("data-confirm"), "请确认").yes(submitForm);
	} else {
		submitForm();
	}

	return false;
}

jQuery.fn.extend({
	imageDeal: function (finish, start) {
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

		function completed(element, file, message) {
		    var done = $(element).data("done") + 1;
		    $(element).data("done", done);
		    if (done == element.files.length) {
		        message.close();
		        if (finish) finish(file);
		        $(element).trigger("dealt");
		    }
		}

		function render(dataUrl, file, element, message, width, height, deal) {
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
				    if (deal == "cut") {
				        if (image.width <= image.height && image.width > width) {
				            image.height *= width / image.width;
				            image.width = width;
				        } else if (image.width >= image.height && image.height > height) {
				            image.width *= height / image.height;
				            image.height = height;
				        }
				        canvas.width = image.width > width ? width : image.width;
				        canvas.height = image.height > height ? height : image.height;
				    } else {
				        if (image.width >= image.height && image.width > width) {
				            image.height *= width / image.width;
				            image.width = width;
				        } else if (image.width <= image.height && image.height > height) {
				            image.width *= height / image.height;
				            image.height = height;
				        }
				        canvas.width = image.width;
				        canvas.height = image.height;
				    }
				    ctx.drawImage(image, 0, 0, image.width, image.height);
				    blob = file.type == "image/jpeg" ? dataURL2Blob(canvas.toDataURL("image/jpeg", 0.95)) : dataURL2Blob(canvas.toDataURL(file.type));
				}

				if (!$(element).data("images")) $(element).data("images", []);
				$(element).data("images").push(blob);
				completed(element, file, message);
			};
			image.src = dataUrl;
		}

		function loadImage(file, element, message, width, height, deal) {
			if (!file.type.match(/image.*/)) {
				window.alert("只能选择图片文件");
				return;
			}
			var reader = new FileReader();

			reader.onload = function (e) {
			    render(e.target.result, file, element, message, width, height, deal);
			};
			reader.readAsDataURL(file);
		}
		var width = this.attr("data-width"),
            height = this.attr("data-height"),
            deal = this.attr("data-deal");

		if (width && height) {
			this.on("change", function () {
			    $(this).data("images", null);
			    $(this).data("done", 0);
			    if (start) start();
			    $(this).trigger("dealing");
				if (this.files.length == 0) {
					if (finish) finish(null);
					$(element).trigger("dealt");
					return;
				}
				var message = $app.message("图片处理中")
				for (var i = 0; i < this.files.length; i++) {
				    loadImage(this.files[i], this, message, Number(width), Number(height), deal);
				}
			});
		}
		return this;
	}
});

oldmansoft.webapp.initialled(function () {
    $(document).on("submit", "form.auto", oldmansoft.webapp.extend.form_auto_submit);
    $(document).on("click", "a[target=_script]", oldmansoft.webapp.extend.link_script_click);
	$app.option().viewLoaded(function (view) {
	    view.node.find("form.auto input[type=file][data-width][data-height]").each(function () {
			var $this = $(this);
			$this.imageDeal(function (file) {
			    $this.parentsUntil("body", "form").addClass("image-deal");
			    if ($this.hasClass("file-input")) $this.next().text(file == null ? "" : file.name);
			}).on("dealing", function () {
			    if ($this.hasClass("file-input")) $this.next().text("处理中...");
			});
			if ($this.hasClass("file-input")) {
			    $this.next().click(function () {
			        $this.click();
			    });
			}
	    });

	    view.node.find("form").each(function () {
	        oldmansoft.webapp.extend.form_verify($(this));
	    });
	});
});