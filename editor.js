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

			me = this;

			this.editor.find('textarea')
				.css('font-family', 'monospace')
				.on('keyup', function(e){
					me.saveEditor();
				})
				.on('keydown', function(e){
					// Prevent shifting focus when Tab is pressed
					if (e.which === 9) {
						var start = this.selectionStart;
						var end   = this.selectionEnd;
						var value = $(this).val();

						$(this).val(value.substr(0, start) + "\t" + value.substr(end));
						this.selectionStart = this.selectionEnd = start + 1;

						return false;
					}
				});

			// Click events for save/close buttons
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

			this.editor.find('textarea').stripIndentation();
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

	$.fn.stripIndentation = function() {
		return this.each(function(){
			var text = $(this).val();

			// Kill initial carriage returns
			while (text.charAt(0) === '\n')
				text = text.substr(1);

			// Scan the start of the string for whitespace
			var regexp = /^([\s]+)/;
			var match = regexp.exec(text);

			console.log(match);

			text = text.replace(match[0], '');

			$(this).val(text);
		});
	}

	$.fn.editable = function() {
		this.find('[data-editable]').each(function(){
			var editable = $.extend({}, EDITABLE);
			editable.init(this, {});
		})
		return this;
	}
})(this.Zepto || this.jQuery);