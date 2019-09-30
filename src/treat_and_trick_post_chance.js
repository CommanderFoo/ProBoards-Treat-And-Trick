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