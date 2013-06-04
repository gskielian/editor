/*
	editable.js

	This plugin needs:

	1. An editable area
		<div data-editable="unique">
		</div>
	2. An editor
		<div data-editable-editor="unique">
			<textarea data-editable-htmleditor></textarea>
		</div>
	3. Optionally, a button to show/hide the editor
		<a data-editable-trigger="unique">Edit</a>

	Initialize it with:

	$(document).editable();
*/

;(function($){
	var EDITABLE = {
		options: {},

		target_html: null,
		target_css: null,
		target_js: null,

		editor: null,
		html_editor: null,
		css_editor: null,
		js_editor: null,

		trigger: null,

		/*
			Initializer function. Inserts user settings and runs other initializers.

			@param element: DOM element or jQuery object
			@param options: User settings
		*/
		init: function(element, options) {
			$.extend(this.options, options);

			var target_name = element.getAttribute('data-editable');

			this.initiFrame(element);
			this.initEditor(target_name);
		},

		/*
			Builds an iFrame to replace the editing area. This encapsulates all of
			the HTML, CSS, and JavaScript into the isolation chamber.

			TODO: Add a means to inject a plugin (i.e., jQuery) along with the inline JS

			@param element: DOM element or jQuery object
		*/
		initiFrame: function(element) {
			// Unmodified target area
			var target = $(element);

			// New iFrame
			var iframe = $('<iframe />', {frameborder: '0', width: 500, height: 400,}).insertAfter(target);
			var iframe_body = $(iframe[0].contentDocument.body);
			// Give the iFrame's body the attributes of the original wrapper
			iframe_body.copyAttributesFrom(target);

			// Copy the contents of the target container into the iFrame
			iframe_body[0].innerHTML = target[0].innerHTML;

			// Select the HTML, CSS, and JavaScript of the new iFrame for later use
			this.target_html = iframe_body.children('div')[0];
			this.target_css  = iframe_body.children('style')[0];
			this.target_js   = iframe_body.children('script')[0];

			// Remove the target
			target.remove();
		},

		/*
			Initialize the editor to be paired with an editing area.

			@param target: unique ID of the editable area (pulled from the data-attribute of the editable area)
		*/
		initEditor: function(target) {
			this.editor  = $('[data-editable-editor="'+target+'"]');
			this.trigger = $('[data-editable-trigger="'+target+'"]');

			var save_button  = this.editor.find('[data-editable-saveeditor]');
			var close_button = this.editor.find('[data-editable-closeeditor]');

			// Find the editing areas that exist
			this.html_editor = this.editor.find('[data-editable-htmleditor]');
			this.css_editor  = this.editor.find('[data-editable-csseditor]');
			this.js_editor   = this.editor.find('[data-editable-jseditor]');

			// Click events for save/close buttons
			me = this;
			save_button.on('click', function(){
				me.saveEditor();
			});
			close_button.on('click', function(){
				me.closeEditor();	
			});

			// If a trigger button exists, hide the editor and initialize the trigger
			if (this.trigger.length > 0) {
				this.editor.hide();
				this.initTrigger();
			}
			else {
				this.updateEditor();
				this.editor.show();
			}
		},

		/*
			Initialize a trigger to toggle the visibility of the editor
		*/
		initTrigger: function() {
			me = this;
			this.trigger.on('click', function() {
				if (me.editor.css('display') === 'none') {
					me.updateEditor();
					me.editor.show();
					console.log(me);
				}
				else {
					me.editor.hide();
				}
			})
		},

		/*
			Pulls the HTML, CSS, and JS from the iFrame into the editor.
			Called when the editor is first initialized and then every time it's opened.
		*/
		updateEditor: function() {
			this.html_editor.val(this.target_html.innerHTML);
			this.css_editor.val($(this.target_css).text());
		},

		/*
			Put the HTML, CSS, and JS from the editor into the iFrame.
		*/
		saveEditor: function() {
			this.target_html.innerHTML = this.html_editor.val();
			$(this.target_css).text(this.css_editor.val());
		},

		/*
			Close the editor. This doesn't save the user's changes.
		*/
		closeEditor: function() {
			this.editor.hide();
		}
	}

	$.fn.copyAttributesFrom = function(elem) {
		var targets = this;
		var attributes = $(elem).prop('attributes');
		return this.each(function(){
			$.each(attributes, function(){
				targets.attr(this.name, this.value);
			});
		});
	}

	$.fn.editable = function() {
		this.find('[data-editable]').each(function(){
			var editable = $.extend({}, EDITABLE);
			editable.init(this, {});
		})
		return this;
	}

	$.fn.editableold = function() {
		this.find('[data-editable]').each(function(){
			$(this).click(function(){
				// Find the HTML element
				var target = $('#'+this.getAttribute('data-editable'));
				if (target.length === 0) {
					console.log('No element with an ID of '+this.getAttribute('data-editable')+' was found.');
					return;
				}

				// Container
				var editor = $('<div />', {class: 'editable-modal'})
					.appendTo('body');
				// Box for HTML
				var html_editor = $(document.createElement('textarea'))
					.appendTo(editor)
					.val(target.children('div')[0].innerHTML);
				// Box for CSS
				var css_editor = $(document.createElement('textarea'))
					.appendTo(editor)
					.val(target.find('style').text());
				// Box for JS
				// ------

				// Save/cancel buttons
				$('<a />', { text: 'Save', href: '#', })
					.click(function(){
						target.children('div')[0].innerHTML = html_editor[0].value;
						target.children('style').text(css_editor[0].value);
						$(this).parent().remove();
					})
					.appendTo(editor);
				$('<a />', { text: 'Cancel', href: '#', })
					.click(function(){
						$(this).parent().remove();
					})
					.appendTo(editor);
			});
		});
	}
})(this.Zepto || this.jQuery);