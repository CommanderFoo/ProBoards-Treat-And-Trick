class Treat_And_Trick_Mini_Profile {

	static init(){
		this.using_custom = false;
		this.add_stats_to_mini_profiles();
		yootil.event.after_search(this.add_stats_to_mini_profiles, this);
	}

	static add_stats_to_mini_profiles(){
		let $mini_profiles = yootil.get.mini_profiles();

		if(!$mini_profiles.length || $mini_profiles.find(".treat-and-trick-user-stats").length){
			return;
		}

		$mini_profiles.each((index, item) => {
			let $mini_profile = $(item);
			let $elem = $mini_profile.find(".treat-and-trick-user-stats");
			let $user_link = $mini_profile.find("a.user-link:first");
			let $info = $mini_profile.find(".info");

			if(!$elem.length && !$info.length){
				return;
			}

			if($user_link.length == 1){
				let user_id = parseInt($user_link.attr("data-id"), 10);

				if(!user_id){
					return;
				}

				Treat_And_Trick.api.refresh.user_data();
				Treat_And_Trick.api.refresh.posts_data();

				let using_info = false;

				if($elem.length){
					this.using_custom = true;
				} else {
					using_info = true;
					$elem = $("<div class='treat-and-trick-user-stats'></div>");
				}

				let tokens = yootil.number_format(Treat_And_Trick.api.user.get(user_id).tokens());

				let html = "";

				html += "<span class='treat-and-trick-stats-tokens'>Treats: <img title='Treats Earned' src='" + Treat_And_Trick.IMAGES.candy16 + "' /> x " + tokens + "</span>";

				$elem.html(html);

				if(using_info){
					$info.prepend($elem);
				}

				$elem.show();
			}

		});
	}

};