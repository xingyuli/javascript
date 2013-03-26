/*
 * The PopupWindow is based on prototype.js, effects.js and dom.js
 *
 * Supported options:
 *     renderToId
 *     width
 *     height
 *     withOkButton
 *     wichCancelButton
 *	   okAction
 *     cancelAction
 */
function PopupWindow(options) { 
	this.renderToId = options.renderToId;
	this.defaultWidth = options.width;
	this.defaultHeight = options.height;
	this.width = options.width;
	this.height = options.height;
	this.click = options.click;
	this.options = options;
	
	this._initialize();
}

PopupWindow.prototype = {

	_initialize : function() {
		var widget = this;
	
		Dom.$(this.renderToId).addClass('popup_window');
		if (this.options.click) {
			$(this.renderToId).observe('click', this.options.click);
		}
		
		var blanketDom = Dom.create('div');
		Dom.$(blanketDom).addClass('blanket');
		this.blanket = $(blanketDom);
		this.blanket.observe('click', function() {
			widget.hide();
		});
		
		var dialogDom = Dom.create('div');
		Dom.$(dialogDom).addClass('dialog');
		this.dialog = $(dialogDom);
		if (this.options.withCancelButton) {
			var cancelBtnDom = Dom.create('div');
			Dom.$(cancelBtnDom).addClass('cancel_btn');
			this.cancelBtn = $(cancelBtnDom);
			this.cancelBtn.update('x');
			this.cancelBtn.observe('click', function() {
				widget.fit();
				widget.hide();
				if (widget.options.cancelAction) {
					widget.options.cancelAction();
				}
			});
			this.dialog.appendChild(this.cancelBtn);	
		}
		
		var titleDom = Dom.create('div');
		Dom.$(titleDom).addClass('title');
		var title = $(titleDom);
		
		var detailDom = Dom.create('div');
		Dom.$(detailDom).addClass('text');
		var detail = $(detailDom);
		
		var contentDom = Dom.create('div');
		Dom.$(contentDom).addClass('content');
		this.content = $(contentDom);
		
		this.content.appendChild(title);
		this.content.appendChild(detail);
		this.dialog.appendChild(this.content);
		
		if (this.options.withOkButton) {
			var btnContainerDom = Dom.create('div');
			Dom.$(btnContainerDom).addClass('btn_container');
			var btnContainer = $(btnContainerDom);
			
			var okBtnDom = Dom.create('span');
			Dom.$(okBtnDom).addClass('ok_btn');
			this.okBtn = $(okBtnDom);
			this.okBtn.update('OK');
			this.okBtn.observe('click', function() {
				widget.fit();
				widget.hide();
				if (widget.options.okAction) {
					widget.options.okAction();
				}
			});
			btnContainer.appendChild(this.okBtn);
			this.dialog.appendChild(btnContainer);
		}
		
		$(this.renderToId).appendChild(this.blanket);
		$(this.renderToId).appendChild(this.dialog);
		
		$(document.body).appendChild($(this.renderToId));
	},
	
	fit : function() {
		var blanket_height = Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight
		);
		this.blanket.setStyle({'height' : blanket_height});
		
		// 50px above the top center
		this.dialog.setStyle({'top' : (document.body.clientHeight - this.height) / 2 + Dom.ViewPort.getScroll().y - 50});
		this.dialog.setStyle({'left' : (document.body.clientWidth - this.width) / 2});
		
		// adapte the position when scrolling
		var widget = this;
		this.scrollAction = function() {
			widget.dialog.setStyle({'top' : (document.body.clientHeight - widget.height) / 2 + Dom.ViewPort.getScroll().y - 50});
		};
		Event.observe(window, 'scroll', this.scrollAction);
	},

	/*
	 * Supported options:
	 *     title
	 *     text
	 *     width
	 *     height
	 */
	popup : function(options) {
		var title = options.title || 'Information';
		var text= options.text || '';
		this.content.down('div.title').update(title);
		this.content.down('div.text').update(text);
	
		this.width = options.width || this.defaultWidth;
		this.height = options.height || this.defaultHeight;
		
		this.dialog.setStyle({'width' : this.width});
		this.dialog.setStyle({'height' : this.height});
		
		this.fit();
		this.show();
	},
	
	hide : function() {
		Dom.Fade.out(this.blanket, {from : 0.65});
		Dom.Fade.out(this.dialog, {from : 0.85});
		Dom.Fade.out(this.renderToId);
		Event.stopObserving(window, 'scroll', this.scrollAction);
	},
	
	show : function() {
		Dom.Fade.show(this.blanket, {to : 0.65});
		Dom.Fade.show(this.dialog, {to : 0.85});
		Dom.Fade.show(this.renderToId);
	}
	
};