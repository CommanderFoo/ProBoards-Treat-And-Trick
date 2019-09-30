class Treat_And_Trick_User_Data {

	constructor(user_id = 0, {t = {}, s = 10, i = {}} = {}){
		this._id = user_id;
		this._DATA = {

			t, s, i

		};
	}

	save(callback = null){
		yootil.key.set(Treat_And_Trick.PLUGIN_USER_KEY, this._DATA, this._id, callback);
	}

	get_data(){
		return this._DATA;
	}

}