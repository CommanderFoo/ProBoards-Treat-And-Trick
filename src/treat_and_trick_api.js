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