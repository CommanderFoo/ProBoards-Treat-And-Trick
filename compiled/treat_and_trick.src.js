$.widget("ui.treat_and_trick", $.ui.dialog, {

	_create(){
		$.ui.dialog.prototype._create.call(this);

		this.uiDialog.addClass("treat-and-trick-dialog");

		if(this.options.buttonPaneExtra){
			this.uiDialog.find(".ui-dialog-buttonset").addClass("treat-and-trick-buttonset").prepend(this.options.buttonPaneExtra);
		}
	}

});

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

Treat_And_Trick.api = class {

	static init(){
		//let data = (yootil.user.logged_in())? this.get(yootil.user.id()).data() : {};

		//this._sync = new Treat_And_Trick_Sync(data, Treat_And_Trick_Sync_Handler);
	}

	static sync(){

		console.log("Sync");

	}

};

Treat_And_Trick.api.refresh = class {

	static user_data(){
		Treat_And_Trick.setup_user_data();
	}

	static posts_data(){
		Treat_And_Trick.setup_posts_data();
	}

};

Treat_And_Trick.api.user = class {

	static data(user_id = 0){
		let id = parseInt(user_id, 10);

		if(id > 0){
			if(!Treat_And_Trick._USER_KEY_DATA.has(id)){
				Treat_And_Trick._USER_KEY_DATA.set(id, {

					t: {},
					s: Treat_And_Trick.SETTINGS.starting_tokens,
					i: {}

				});
			}

			return Treat_And_Trick._USER_KEY_DATA.get(id);
		}

		return {t: {}, s: 10, i: {}};
	}

	static clear(user_id = 0){
		let user_data = this.data(user_id);

		return {

			data(){
				user_data = {t: {}, s: 10, i: {}};
			}

		};
	}

	static has(user_id = 0){
		let user_data = this.data(user_id);

		return {

			inventory_items(){
				let inventory = user_data.i;
				let has_inventory = false;

				for(let k in inventory){
					if(parseInt(inventory[k], 10) > 0){
						has_inventory = true;
						break;
					}
				}

				return has_inventory;
			}

		}
	}

	static get(user_id = 0){
		let user_data = this.data(user_id);

		return {

			unlimited(){
				if(yootil.user.is_staff() && $.inArrayLoose(user_id, Treat_And_Trick.SETTINGS.unlimited_keys) > -1){
					return true;
				}

				return false;
			},

			tokens(){
				return parseInt(user_data.s, 10);
			},

			data(){
				return user_data;
			},

			inventory(){
				return user_data.i;
			},

			inventory_trick_count(id){
				let inventory = user_data.i;

				if(inventory[id]){
					return inventory[id];
				}

				return 0;
			}

		};
	}

	static set(user_id = 0){
		let user_data = this.data(user_id);

		return {

			data(data){
				user_data = data;
			},

			inventory(inventory = {}){
				user_data.i = inventory;
			}

		};
	}

	static increase(user_id = 0){
		let user_data = this.data(user_id);

		return {

			tokens(amount = 0){
				user_data.s += parseInt(amount, 10);
			},

			inventory_trick(id, amount){
				let inventory = user_data.i;

				if(inventory[id]){
					inventory[id] += amount || 1;
				} else {
					inventory[id] = 1;
				};

				user_data.i = inventory;
			}

		};
	}

	static decrease(user_id = 0){
		let user_data = this.data(user_id);

		return {

			tokens(amount = 0){
				let current_tokens = Treat_And_Trick.api.user.get(user_id).tokens();
				let new_amount = current_tokens - parseInt(amount, 10);

				if(new_amount < 0){
					new_amount = 0;
				}

				user_data.s = new_amount;
			},

			inventory_trick(id, amount){
				let inventory = Treat_And_Trick.api.user.get(user_id).inventory();

				if(inventory[id]){
					inventory[id] -= amount || 1;

					if(inventory[id] <= 0){
						delete inventory[id];
					}
				}

				user_data.i = inventory;
			}

		};
	}

	static save(user_id = 0, callback = null){
		return yootil.key.set(Treat_And_Trick.PLUGIN_USER_KEY, this.data(user_id), user_id, callback);
	}

	static space(user_id = 0){
		let user_data = this.data(user_id);

		return {

			used(){
				return JSON.stringify(user_data).length;
			},

			left(){
				return (pb.data("plugin_max_key_length") - Treat_And_Trick.api.user.space(user_id).used());
			}

		}
	}

	static sync(user_id){
		if(user_id != yootil.user.id()){
			return;
		}

		let user_data = this.data(user_id);

		if(!user_data){
			return null;
		}

		this._sync.update(user_data);
	}

};

Treat_And_Trick.api.member = class {

	static save(id){

		let data = Treat_And_Trick.api.user.get(id).data() || {};

		return {

			avatar(flipped){
				if(!data.t){
					data.t = {};
				}

				data.t.af = [flipped, parseInt(yootil.user.id(), 10)];

				yootil.key.set(Treat_And_Trick.PLUGIN_USER_KEY, data, id);
			}

		};

	}

	static get(id){
		let data = yootil.key.value(Treat_And_Trick.PLUGIN_USER_KEY, id) || {};

		return {

			data(){
				return data;
			},

			avatar_flipped(){
				if(data && data.t && data.t.af && Array.isArray(data.t.af) && data.t.af[0]){
					return true;
				}

				return false;
			},

			avatar_flipped_last_user(){
				if(data && data.t && data.t.af && Array.isArray(data.t.af)){
					if(data.t.af[1] == parseInt(yootil.user.id(), 10)){
						return true;
					}
				}

				return false;
			}

		}
	}

};

Treat_And_Trick.api.post = class {

	static data(post_id = 0){
		let id = parseInt(post_id, 10);

		if(id > 0){
			if(Treat_And_Trick._POST_KEY_DATA.has(id)){
				return Treat_And_Trick._POST_KEY_DATA.get(id);
			}
		}

		return {};
	}

	static get(post_id){
		let data = this.data(post_id);
		let key_data = (data && data.key)? data.key : {};

		return {

			data(){
				return data;
			},

			avatar_flipped(){
				if(key_data.t && key_data.t.af && Array.isArray(key_data.t.af) && key_data.t.af[0]){
					return true;
				}

				return false;
			},

			avatar_flipped_last_user(){
				if(key_data.t && key_data.t.af && Array.isArray(key_data.t.af)){
					if(key_data.t.af[1] == parseInt(yootil.user.id(), 10)){
						return true;
					}
				}

				return false;
			},

			created_by(){
				return data.created_by;
			}

		};

	}

	static save(post_id){
		let data = this.get(post_id);
		let key_data = (data && data.key)? data.key : {};

		return {

			avatar_flipped(flipped){
				if(!key_data.t){
					key_data.t = {};
				}

				key_data.t.af = [flipped, parseInt(yootil.user.id(), 10)];

				yootil.key.set(Treat_And_Trick.PLUGIN_POST_KEY, key_data, post_id);
			}

		}
	}

};

Treat_And_Trick.permissions = class {

	static member_banned(user_id = 0){
		if(!Treat_And_Trick.SETTINGS.banned_members.length){
			return false;
		}

		user_id = user_id || yootil.user.id();

		if($.inArrayLoose(user_id, Treat_And_Trick.SETTINGS.banned_members) > -1){
			return true;
		}

		return false;
	}

	static group_can_trick(){
		if(!Treat_And_Trick.SETTINGS.allowed_to_trick.length){
			return true;
		}

		let user_groups = yootil.user.group_ids();

		for(let g = 0, l = user_groups.length; g < l; g ++){
			if($.inArrayLoose(user_groups[g], Treat_And_Trick.SETTINGS.allowed_to_trick) > -1){
				return true;
			}
		}

		return false;
	}

};

class Treat_And_Trick_Post_Chance {

	static init(){
		this._submitted = false;
		this._tokens_added = 0;
		this._hook = (yootil.location.posting_thread())? "thread_new" : ((yootil.location.thread())? "post_quick_reply" : "post_new");

		let $the_form = yootil.form.any_posting();

		if($the_form.length){
			$the_form.on("submit", () => {

				this._submitted = true;
				this.set_on();

			});
		}
	}

	static set_on(){
		if(!yootil.location.editing()){
			let user_id = yootil.user.id();
			let tokens_to_add = this.token_chance();

			if(tokens_to_add){
				if(this._submitted){
					if(this._tokens_added){
						Treat_And_Trick.api.user.decrease(user_id).tokens(this._tokens_added);
					}

					this._tokens_added = tokens_to_add;

					Treat_And_Trick.api.user.increase(user_id).tokens(tokens_to_add);
					yootil.key.set_on(Treat_And_Trick.PLUGIN_USER_KEY, Treat_And_Trick.api.user.get(user_id).data(), user_id, this._hook);
					Treat_And_Trick.api.sync();
				}
			}
		}
	}

	static token_chance(){
		let current_tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();

		//if(current_tokens > 0){
		//	return;
		//}

		let rand = Math.random() * 100;
		let tokens = 0;

		if(rand < 1){
			tokens = 20;
		} else if(rand < 10){
			tokens = 12;
		} else if(rand < 40){
			tokens = 6;
		} else if(rand < 50){
			tokens = 5;
		} else if(rand < 60){
			tokens = 3;
		} else if(rand < 70){
			tokens = 2;
		} else if(rand < 80){
			tokens = 1;
		}

		return tokens;
	}

}

class Treat_And_Trick_Sync {

	constructor(data = {}, handler = null){
		if(!handler || typeof handler.change == "undefined"){
			return;
		}

		this._trigger_caller = false;
		this._handler = handler;
		this._key = "treat_and_trick_data_sync_" + yootil.user.id();

		// Need to set the storage off the bat

		yootil.storage.set(this._key, data, true, true);

		// Delay adding event (IE issues yet again)

		setTimeout(() => $(window).on("storage", (evt) => {
			if(evt && evt.originalEvent && evt.originalEvent.key == this._key){

				// IE fix

				if(this._trigger_caller){
					this._trigger_caller = false;
					return;
				}

				let event = evt.originalEvent;
				let old_data = event.oldValue;
				let new_data = event.newValue;

				// If old == new, don't do anything

				if(old_data != new_data){
					this._handler.change(JSON.parse(new_data), JSON.parse(old_data));
				}
			}
		}), 100);
	}

	// For outside calls to trigger a manual update

	update(data = {}){
		this._trigger_caller = true;
		yootil.storage.set(this._key, data, true, true);
	}

	get key(){
		return this._key;
	}

};

class Treat_And_Trick_Sync_Handler {

	/*static change(new_data, old_data){
		this._new_data = new_data;
		this._old_data = old_data;

		Treat_And_Trick.api.set(yootil.user.id()).data(this._new_data);

		$(this.ready.bind(this));
	}

	static ready(){
		this.update_mini_profile();
	}

	static update_mini_profile(){
		let location_check = (

			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts()

		);

		if(location_check){
			let user_id = yootil.user.id();
			let $mini_profiles = yootil.get.mini_profiles(user_id);

			if($mini_profiles.length){
				let $elems = $mini_profiles.find(".treat-and-trick-user-stats");

				if($elems.length){
					let $sent = $elems.find(".treat-and-trick-stats-sent span");

					if($sent.length){
						$sent.text(yootil.number_format(Treat_And_Trick.api.get(user_id).total_tricks_sent()))
					}

					let $tokens = $elems.find(".treat-and-trick-stats-tokens span");

					if($tokens.length){
						$tokens.text(yootil.number_format(Treat_And_Trick.api.get(user_id).tokens()))
					}
				}
			}
		}
	}

	static get old_data(){
		return this._old_data;
	}

	static get new_data(){
		return this._new_data;
	}*/

};

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

class Treat_And_Trick_Shop {

	constructor(){
		let tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();
		let user_id = yootil.user.id();

		if(tokens <= 0 && !Treat_And_Trick.api.user.get(user_id).unlimited()){
			new Treat_And_Trick_Dialog({

				title: "No Treats",
				msg: "You currently have no treats, however, you have a chance to earn more when you post.",
				width: 350,
				height: 150

			});

			return false;
		}

		// Change this to check total tricks the user has current bought,
		// and then check the space left.

		if(!Treat_And_Trick.api.user.space(user_id).left()){
			new Treat_And_Trick_Dialog({

				title: "Error",
				msg: "You can not buy anymore tricks from the shop, your inventory is full.",
				width: 350,
				height: 150

			});

			return false;
		}

		this.show_shop();
	}

	show_shop(){
		let $dialog = new Treat_And_Trick_Dialog({

			title: "Treat and Trick - Shop",
			html: this.create_shop_html(),
			width: 750,
			height: 450,
			draggable: true,
			extra: this.build_button_pane_extra(),
			klass: "treat-and-trick-dialog-shop",

			buttons: [

				{

					text: "Close",
					click: function(){
						$(this).treat_and_trick("close");
					}

				}

			]

		});

		$dialog.treat_and_trick("open");
	}

	build_button_pane_extra(){
		let $extra = $("<div class='treat-and-trick-dialog-button-pane-extra'></div>");
		let tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();

		if(Treat_And_Trick.api.user.get(yootil.user.id()).unlimited()){
			tokens = "Unlimited";
		}

		$extra.append($('<button type="button" id="treat-and-trick-left-button" class="ui-button"><span class="ui-button-text"><span id="treat-and-trick-left-counter"><img src="' + Treat_And_Trick.IMAGES.candy16 + '" /> <span>' + tokens + '</span></span></span></button>').on("click", () => {

			new Treat_And_Trick_Dialog({

				title: "Treats",
				html: "This is the amount of treats you have left to send.<br /><br />When posting, you have chance to earn more treats.",
				width: 350,
				height: 160

			}).treat_and_trick("open");

		}));

		$extra.append(this.create_pane_inventory());

		return $extra;
	}

	create_pane_inventory(){
		let $html = $("<span class='treat-and-trick-dialog-pane-inventory'></span>");
		let item_list = Treat_And_Trick.ITEMS.get_list();

		for(let key in item_list){
			let count = Treat_And_Trick.api.user.get(yootil.user.id()).inventory_trick_count(key);

			if(count > 99){
				count = "99+";
			}

			$html.append("<span data-inventory-id='" + key + "' class='treat-and-trick-dialog-pane-inventory-item trick-tiptip' title='" + item_list[key].desc + "'><img src='" + item_list[key].image + "' /><span class='treat-and-trick-dialog-pane-inventory-item-count'>" + count + "</span></span>");
		}

		$html.find(".trick-tiptip").tipTip({

			defaultPosition: "right",
			maxWidth: "350px"

		});

		return $html;
	}

	create_shop_html(){
		//let shop = "<div class='treat-and-trick-shop-list-header'><img src='" + Treat_And_Trick.IMAGES.info + "' /> &nbsp; Here you can spend your earned treats on tricks that you can use on other members.</div>";

		let shop = "";

		shop += "<table class='treat-and-trick-shop-list list'>";

		shop += "<thead><tr class='head'>";
		shop += "<th style='width: 90px; border-top-width: 1px;'>&nbsp;</th>";
		shop += "<th style='width: 75%; border-top-width: 1px;' class='main'>Description</th>";
		shop += "<th style='width: 100px; border-top-width: 1px;'>Price</th>";
		shop += "<th style='width: 100px; border-top-width: 1px;'>&nbsp;</th>";
		shop += "</tr></thead><tbody class='treat-and-trick-shop-list-content list-content'>";

		let counter = 1;
		let item_list = Treat_And_Trick.ITEMS.get_list();

		for(let key in item_list){
			let tmp = item_list[key];

			tmp.first = (counter == 1)? true : false;
			tmp.id = key;

			shop += this.create_row(tmp);

			counter ++;
		}

		shop += "</tbody></table>";

		return this.bind_shop_events(shop);
	}

	bind_shop_events(shop){
		let $shop = $(shop);

		$shop.find(".treat-and-trick-shop-list-item-buy-button").on("click", function(){

			let id = $(this).attr("data-shop-item-id");
			let item = Treat_And_Trick.ITEMS.get_item(id);

			if(item != null && item.price > 0){
				let user_id = parseInt(yootil.user.id(), 10);
				let current_tokens = Treat_And_Trick.api.user.get(user_id).tokens();

				if(current_tokens >= item.price){
					Treat_And_Trick.api.user.decrease(user_id).tokens(item.price);

					$("#treat-and-trick-left-counter span").text(Treat_And_Trick.api.user.get(user_id).tokens());

					Treat_And_Trick.api.user.increase(user_id).inventory_trick(id);
					Treat_And_Trick.api.user.save(user_id);

					Treat_And_Trick.display_inventory_icon();

					let $img = $("#treat-and-trick-shop-row-" + id).find(".treat-and-trick-shop-list-item-image img");
					let $clone = $img.clone();
					let $panel_item = $(".treat-and-trick-dialog-pane-inventory-item[data-inventory-id=" + id + "]");

					$clone.offset({

						top: $img.offset().top,
						left: $img.offset().left

					}).css({

						opacity: "0.5",
						position: "absolute",
						height: $img.height(),
						width: $img.width(),
						"z-index": 1005,
						display: ""

					}).appendTo($("body")).animate({

						top: $panel_item.offset().top + 12,
						left: $panel_item.offset().left + 21,
						width: $img.width() / 4,
						height: $img.height() / 4

					}, {
						duration: 2000,
						easing: "easeInOutExpo",
						queue: true,
						complete: function(){
							let $count = $panel_item.find(".treat-and-trick-dialog-pane-inventory-item-count");
							let current_total = parseInt($count.text(), 10);

							if(current_total >= 99){
								$count.text("99+");
							} else {
								$count.text(parseInt($count.text(), 10) + 1);
							}

							$(this).remove();
						}
					});
				}
			}
		});

		return $shop;
	}

	create_row({first = false, image = "", desc = "", price = "", id = ""} = {}){
		let row = "<tr class='item" + ((first)? " first" : "") + "' id='treat-and-trick-shop-row-" + id + "'>";

		row += "<td class='treat-and-trick-shop-list-item-image'><img src='" + image + "' /></td>";
		row += "<td class='treat-and-trick-shop-list-item-desc'>" + desc + "</td>";
		row += "<td class='treat-and-trick-shop-list-item-price'><img src='" + Treat_And_Trick.IMAGES.candy32 + "' /> " + price + "</td>";
		row += "<td class='treat-and-trick-shop-list-item-buy'><img src='" + Treat_And_Trick.IMAGES.buy + "' data-shop-item-id='" + id + "' class='treat-and-trick-shop-list-item-buy-button' /></td>";
		row += "</tr>";

		return row;
	}

}

Treat_And_Trick.ITEMS = class {

	static init(){
		this._items = Object.assign(Object.create(null), {});
		this.setup_items();
	}

	static setup_items(){

		this._items["1"] = {

			image: Treat_And_Trick.IMAGES.bat,
			desc: "This will flip a members avatar.  This can be used on posts or members profiles by dragging the item onto the avatar.",
			price: 10,
			klass: "avatar-flip"

		};

		this._items["2"] = {

			image: Treat_And_Trick.IMAGES.dracula,
			desc: "Something something",
			price: 10,
			klass: ""

		};

		this._items["3"] = {

			image: Treat_And_Trick.IMAGES.ghost,
			desc: "Something something",
			price: 10,
			klass: ""

		};

		this._items["4"] = {

			image: Treat_And_Trick.IMAGES.broom,
			desc: "Something something",
			price: 10,
			klass: ""

		};

	}

	static get_item(id = ""){
		if(this._items[id]){
			return this._items[id];
		}

		return null;
	}

	static get_list(){
		return this._items;
	}

};

class Treat_And_Trick_Inventory {

	open(){
		this.show_inventory();
	}

	close(){
		$(".treat-and-trick-dialog-inventory .ui-dialog-content").treat_and_trick("close");
	}

	show_inventory(){
		let $dialog = new Treat_And_Trick_Dialog({

			title: "Treat and Trick - Inventory",
			html: this.create_inventory_html(),
			width: 530,
			height: 300,
			klass: "treat-and-trick-dialog-inventory",
			draggable: true,
			modal: false,
			extra: this.build_info_pane(),

			buttons: [

				{

					text: "Close",
					click: function(){
						$(this).treat_and_trick("destroy").remove();
					}

				}

			]

		});

		$dialog.treat_and_trick("open");
	}

	create_inventory_html(){
		let inventory_html = "<div class='treat-and-trick-inventory-wrapper'>";
		let inventory = Treat_And_Trick.api.user.get(yootil.user.id()).inventory();
		let item_list = Treat_And_Trick.ITEMS.get_list();

		for(let id in inventory){
			if(item_list[id]){
				let count = inventory[id];

				inventory_html += "<div title='" + item_list[id].desc + "' class='treat-and-trick-inventory-item trick-tiptip' data-trick-id='" + id + "'><img class='treat-and-trick-" + item_list[id].klass + "-trick' src='" + item_list[id].image + "' data-trick-id='" + id + "' /><span class='treat-and-trick-dialog-pane-inventory-item-count'>x" + count + "</span></div>";
			}
		}

		return this.bind_inventory_events(inventory_html);
	}

	bind_inventory_events(inventory){
		let $inventory = $(inventory);

		$inventory.find("img").draggable({

			appendTo: "body",
			zIndex: 1500,
			cursor: "move",
			helper: "clone"

		});

		$inventory.find(".trick-tiptip").tipTip({

			defaultPosition: "right",
			maxWidth: "350px"

		});

		return $inventory;
	}

	build_info_pane(){
		let $extra = $("<span id='treat-and-trick-dialog-info-pane'></span>");

		return $extra;
	}

	set_error(msg){
		$("#treat-and-trick-dialog-info-pane").html(msg);
	}

}

class Treat_And_Trick_Droppables {

	static init(){
		if(yootil.location.recent_posts() || yootil.location.search_results() || yootil.location.thread()){
			yootil.event.after_search(this.apply_post_droppables, this);
			this.apply_post_droppables();
		}

		if(yootil.location.profile_home()){
			this.apply_profile_droppables();
		}
	}

	static apply_post_droppables(){
		let $posts = yootil.get.posts();

		$posts.each(function(){
			let post_id = parseInt($(this).attr("id").split("post-")[1], 10);

			if(!post_id){
				return;
			}

			let $post = $(this);
			let $mini_profile = $post.find(".mini-profile");
			let $user_link = $mini_profile.find("a.user-link");

			Treat_And_Trick_Droppables.flip_avatar($post, post_id);
		});
	}

	static flip_avatar($post, post_id){
		let $avatar = $post.find(".avatar-wrapper");

		if($avatar.length > 0){
			let user_id = parseInt(yootil.user.id(), 10);

			if(Treat_And_Trick.api.post.get(post_id).avatar_flipped()){
				$avatar.addClass("treat-and-trick-avatar-flipped");
			}

			$avatar.droppable({

				accept: ".treat-and-trick-avatar-flip-trick",
				tolerance: "pointer",
				activeClass: "treat-and-trick-highlight",

				drop(event, ui){
					let post_api = Treat_And_Trick.api.post;
					let post_data = post_api.get(post_id).data();
					let item_id = parseInt($(ui.draggable).attr("data-trick-id"), 10);

					let can_drop = Treat_And_Trick_Droppables.can_drop_on_post_avatar(post_id);
					let is_owner = Treat_And_Trick_Droppables.is_owner_post(post_id);

					if(can_drop){
						if(item_id && Treat_And_Trick.ITEMS.get_item(item_id)){
							if(Treat_And_Trick.api.user.get(user_id).inventory_trick_count(item_id) > 0){
								let flipped = false;

								if(post_data.avatar_flipped){
									$avatar.removeClass("treat-and-trick-avatar-flipped");
									flipped = false;
								} else {
									$avatar.addClass("treat-and-trick-avatar-flipped");
									flipped = true;
								}

								Treat_And_Trick.api.post.save(post_id).avatar_flipped(flipped);

								// Consider adding to the API to update an entry instead
								// of rebuilding the whole post map

								Treat_And_Trick.api.refresh.posts_data();

								Treat_And_Trick.api.user.decrease(user_id).inventory_trick(item_id);
								Treat_And_Trick.api.user.save(user_id);
							}
						}
					} else {
						if(is_owner){
							Treat_And_Trick.inventory.set_error("You can't perform this action on your own posts.");
						} else {
							Treat_And_Trick.inventory.set_error("You can't perform this action as you were the last to perform it on this post.");
						}
					}
				}

			});
		}
	}

	static apply_profile_droppables(){
		let profile_id = parseInt(yootil.page.member.id(), 10);

		this.apply_avatar_droppable(profile_id);
	}

	static apply_avatar_droppable(profile_id){
		let $avatar = $(".show-user").find(".avatar-wrapper.avatar-" + profile_id);

		if($avatar.length > 0){
			if(Treat_And_Trick.api.member.get(profile_id).avatar_flipped()){
				$avatar.addClass("treat-and-trick-avatar-flipped");
			}

			$avatar.droppable({

				accept: ".treat-and-trick-avatar-flip-trick",
				tolerance: "pointer",
				activeClass: "treat-and-trick-highlight",

				drop(event, ui){
					let member_api = Treat_And_Trick.api.member;
					let member_data = member_api.get(profile_id).data();
					let item_id = parseInt($(ui.draggable).attr("data-trick-id"), 10);

					let can_drop = Treat_And_Trick_Droppables.can_drop_on_profile_avatar(profile_id);
					let is_owner = Treat_And_Trick_Droppables.is_owner_profile(profile_id);

					if(can_drop){
						if(item_id && Treat_And_Trick.ITEMS.get_item(item_id)){
							if(Treat_And_Trick.api.user.get(yootil.user.id()).inventory_trick_count(item_id) > 0){
								let flipped = false;

								if(member_data.avatar_flipped){
									$avatar.removeClass("treat-and-trick-avatar-flipped");
									flipped = false;
								} else {
									$avatar.addClass("treat-and-trick-avatar-flipped");
									flipped = true;
								}

								member_api.save(profile_id).avatar(flipped);
								Treat_And_Trick.api.user.decrease(yootil.user.id()).inventory_trick(item_id);
								Treat_And_Trick.api.user.save(yootil.user.id());
							}
						}
					} else {
						if(is_owner){
							Treat_And_Trick.inventory.set_error("You can't perform this action on your own profile.");
						} else {
							Treat_And_Trick.inventory.set_error("You can't perform this action as you were the last to perform iton this profile.");
						}
					}
				}

			});
		}
	}

	static can_drop_on_post_avatar(post_id){
		let can_drop = (Treat_And_Trick.api.post.get(post_id).avatar_flipped_last_user())? false : true;

		if(this.is_owner_post(post_id)){
			can_drop = false;
		}

		return can_drop;
	}

	static is_owner_post(post_id){
		return Treat_And_Trick.api.post.get(post_id).created_by() == parseInt(yootil.user.id(), 10);
	}

	static can_drop_on_profile_avatar(profile_id){
		let can_drop = (Treat_And_Trick.api.member.get(profile_id).avatar_flipped_last_user())? false : true;

		if(this.is_owner_profile(profile_id)){
			can_drop = false;
		}

		return can_drop;
	}

	static is_owner_profile(profile_id){
		if(profile_id == parseInt(yootil.user.id(), 10)){
			return true;
		}

		return false;
	}

}

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

Treat_And_Trick.init();