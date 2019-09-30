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