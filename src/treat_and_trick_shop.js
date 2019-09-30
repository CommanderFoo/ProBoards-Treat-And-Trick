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