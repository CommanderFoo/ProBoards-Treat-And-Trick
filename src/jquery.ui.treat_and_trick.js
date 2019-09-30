$.widget("ui.treat_and_trick", $.ui.dialog, {

	_create(){
		$.ui.dialog.prototype._create.call(this);

		this.uiDialog.addClass("treat-and-trick-dialog");

		if(this.options.buttonPaneExtra){
			this.uiDialog.find(".ui-dialog-buttonset").addClass("treat-and-trick-buttonset").prepend(this.options.buttonPaneExtra);
		}
	}

});