class Treat_And_Trick_User_Settings {

	static init(){

	}

	static display_settings_icon(){
		let $icon = $("<div class='treat-and-trick-settings-icon'><img src='" + Treat_And_Trick.IMAGES.settings + "' title='Your settings' /></div>");

		$icon.on("click", () => {


		});

		$icon.appendTo(".treat-and-trick-icon-wrapper");
	}

}