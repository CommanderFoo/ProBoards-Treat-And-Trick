class Treat_And_Trick_Dialog {

	constructor({title = "Error", html = "An unknown error has occurred.", width = 350, height = 200, extra = "", buttons = [], klass = "", modal = true, draggable = false} = {}){
		return $("<div></div>").append(html).treat_and_trick({

			title,
			modal,
			resizable: false,
			draggable,
			autoOpen: false,
			width,
			height,
			dialogClass: "treat-and-trick-info-dialog " + klass,
			id,
			buttonPaneExtra: extra,
			buttons

		});
	}

}