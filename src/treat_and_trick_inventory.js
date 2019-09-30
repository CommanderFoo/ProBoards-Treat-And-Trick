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