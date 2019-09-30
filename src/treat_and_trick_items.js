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