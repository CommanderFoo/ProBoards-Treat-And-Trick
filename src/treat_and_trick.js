class Treat_And_Trick {

	static init(){
		this.PLUGIN_ID = "pd_treat_and_trick";
		this.PLUGIN_USER_KEY = "pd_treat_and_trick_user";
		this.PLUGIN_POST_KEY = "pd_treat_and_trick_post";

		this._USER_KEY_DATA = new Map();
		this._POST_KEY_DATA = new Map();

		this._inventory_icon_displayed = false;
		this._shop_icon_displayed = false;

		this.IMAGES = {};
		this.SETTINGS = {};

		this.inventory = null;

		this.setup();
		this.setup_user_data();
		this.setup_posts_data();

		this.ITEMS.init();

		this.api.init();

		$(this.ready.bind(this));
	}

	static ready(){
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(location_check){
			Treat_And_Trick_Mini_Profile.init();
		}

		if(yootil.user.logged_in()){
			if(!this.permissions.member_banned()){
				if(yootil.location.posting() || yootil.location.thread()){
					Treat_And_Trick_Post_Chance.init();
				}

				this.create_icon_wrapper();

				Treat_And_Trick_User_Settings.init();

				if(this.api.user.get(yootil.user.id()).tokens() > 0){
					this.display_shop_icon();
				}

				if(this.api.user.has(yootil.user.id()).inventory_items()){
					this.display_inventory_icon();
				}

				Treat_And_Trick_User_Settings.display_settings_icon();

				Treat_And_Trick_Droppables.init();
			}
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.SETTINGS = plugin.settings;
			this.IMAGES = plugin.images;

			this.SETTINGS.starting_tokens = parseInt(this.SETTINGS.starting_tokens, 10);
		}
	}

	static setup_user_data(){
		let user_data = proboards.plugin.keys.data[this.PLUGIN_USER_KEY];

		for(let key in user_data){
			let id = parseInt(key, 10) || 0;

			if(id && !this._USER_KEY_DATA.has(id)){
				let value = (!user_data[key])? {

					// Tricks received

					t: {},

					// Starting sweets (tokens)

					s: this.SETTINGS.starting_tokens,

					// Inventory

					i: {}

				} : user_data[key];

				this._USER_KEY_DATA.set(id, value);
			}
		}
	}

	static setup_posts_data(){
		this._POST_KEY_DATA.clear();

		let posts = pb.data("proboards.post");

		if(posts){
			for(let key in posts){
				let id = parseInt(key, 10) || 0;

				if(id && !this._POST_KEY_DATA.has(id)){
					this._POST_KEY_DATA.set(id, {

						created_by: parseInt(posts[id].created_by, 10),
						key: yootil.key.value(this.PLUGIN_POST_KEY, id) || {}

					});
				}
			}
		}
	}

	static create_icon_wrapper(){
		$("<div class='treat-and-trick-icon-wrapper'></div>").appendTo($("body"));
	}

	static display_shop_icon(){
		if(this._shop_icon_displayed){
			return;
		}

		this._shop_icon_displayed = true;

		let $icon = $("<div class='treat-and-trick-shop-icon'><img src='" + this.IMAGES.shopicon + "' title='Spend your treats at the shop' /></div>");

		$icon.on("click", () => new Treat_And_Trick_Shop());
		$icon.appendTo(".treat-and-trick-icon-wrapper");
	}

	static hide_shop_icon(){
		if(this._shop_icon_displayed){
			$(".treat-and-trick-shop-icon").remove();
			this._shop_icon_displayed = false;
		}
	}

	static display_inventory_icon(){
		if(this._inventory_icon_displayed){
			return;
		}

		this._inventory_icon_displayed = true;

		let $icon = $("<div class='treat-and-trick-inventory-icon'><img src='" + this.IMAGES.inventory + "' title='Your bag of tricks' /></div>");

		if(!this.inventory){
			this.inventory = new Treat_And_Trick_Inventory();
		}

		$icon.on("click", () => this.inventory.open());
		$icon.appendTo(".treat-and-trick-icon-wrapper");
	}

	static hide_inventory_icon(){
		if(this._inventory_icon_displayed){
			$(".treat-and-trick-inventory-icon").remove();
			this._inventory_icon_displayed = false;
		}
	}

}