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