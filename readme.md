# editor.js

A jQuery/Zepto-compatible library which allows you to take a chunk of HTML, CSS, and JavaScript, isolate it, and make it editable by your users in the browser. Still a work in progress.

## Markup

The markup has three components: an editable area (`data-editable`), an editor for your users (`data-editable-editor`), and optionally a button to toggle the visibility of the editor (`data-editable-trigger`). To connect to each other, these three components must have unique, matching values in their `data-editable-` attributes.

	<!-- Editable area (converted to an iFrame on initialization) -->
	<div data-editable="editable">
		<div>
			<!-- Store your editable HTML in here -->
		</div>

		<style type="text/css">
			<!-- Same for your CSS -->
		</style>
		<script type="text/javascript">
			<!-- And your JavaScript -->
		</style>
	</div>

	<!-- Editor -->
	<div data-editable-editor="editable">
		<div>
			<p>HTML</p>
			<textarea data-editable-htmleditor></textarea>
		</div>
		<div>
			<p>CSS</p>
			<textarea data-editable-csseditor></textarea>
		</div>
		<a data-editable-saveeditor>Save</a> <!-- Updates the editable code -->
		<a data-editable-closeeditor>Close</a> <!-- Closes without saving -->
	</div>

	<!-- Trigger -->
	<a data-editable-trigger="editable">Edit</a>