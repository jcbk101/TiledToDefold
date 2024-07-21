/// <reference types="@mapeditor/tiled-api" />

/*
 * rectangle-chain.js
 *
 * Example tool that places rectangle objects when the mouse is dragged over
 * the map.
 */


tiled.registerTool("ObjectChain", {
	name: "Draw Multiple Objects",
	icon: "object-chain.svg",
	targetLayerType: Layer.ObjectGroupType,
	targetLayerType: Layer.ObjectGroupType,
	lastModifiedTile: { x: null, y: null },

	activated() {
		this.showPreview(this.tilePosition.x, this.tilePosition.y);
		this.lastX = -1;
		this.lastY = -1;
		this.mapSet = tiled.mapEditor.tilesetsView;
	},

	tilePositionChanged() {
		this.showPreview(this.tilePosition.x, this.tilePosition.y);
	},

	getRandomInt(max) {
		return Math.floor(Math.random() * max);
	},

	mouseMoved(x, y /*, modifiers */) {
		if (!this.pressed) {
			// for (obj of this.mapSet.selectedTiles) {
			// 	tiled.log(obj.imageFileName);
			// }
			// tiled.log(this.mapSet.selectedTiles.length);
			return;
		}


		const classes = [
			"gift-box",
			"collectible",
			"coin"
		];

		var dx = Math.floor(x / 64); //Math.abs(this.x - x);
		var dy = Math.floor(y / 64); //Math.abs(this.y - y);
		var lastdx = Math.floor(this.lastX / 64);
		var lastdy = Math.floor(this.lastY / 64);

		//tiled.log("MOVE =  DX/DX -> LDX/LDY: " + dx + "/" +  dy + " -> " + lastdx + "/" + lastdy );

		//this.distance += Math.sqrt(dx*dx + dy*dy);
		// this.x = x;
		// this.y = y;

		//if (this.distance > 64) {
		if (dx != lastdx || dy != lastdy) {
			/** @type ObjectGroup */
			var objectLayer = this.map.currentLayer;

			if (objectLayer && objectLayer.isObjectLayer) {
				// const brush = tiled.mapEditor.currentBrush.layerAt(0)
				// const tile = brush.tileAt(0, 0)
				var tile = this.selectedTile;

				if (this.mapSet.selectedTiles.length > 1) {
					//tiled.log("MULTI: " + this.getRandomInt(this.mapSet.selectedTiles.length) + " -> " + this.mapSet.selectedTiles[this.getRandomInt(this.mapSet.selectedTiles.length)]);
					tile = this.mapSet.selectedTiles[this.getRandomInt(this.mapSet.selectedTiles.length)];
					//tiled.log(tile);
				}

				var name = "";

				// Extract the name from the file
				// If anunderscore exist, then read no more of the name
				if (tile.className == "gift-box" || tile.className == "collectible" || tile.className == "coin") {
					//tiled.log("\"" + tile.className + "\"");

					name = FileInfo.completeBaseName(tile.imageFileName);
					var index = name.indexOf("_");
					tiled.log(index);

					if (index > -1) {
						name = name.substring(0, index).toUpperCase();
					}
					//
					tiled.log(name);
				}
				else {
					name = "";
				}

				//var object = new MapObject(MapObject.Rectangle, "name " + ++this.counter);
				var object = new MapObject(MapObject.Rectangle, name);
				object.tile = tile;
				object.x = Math.floor(x / 64) * 64; //Math.min(this.lastX, x);
				object.y = Math.floor(y / 64) * 64; //Math.min(this.lastY, y);
				object.width = tile.width; //64; //Math.abs(this.lastX - x);
				object.height = tile.height; //;//Math.abs(this.lastY - y);
				objectLayer.addObject(object);
				object.selected = true;
			}

			this.distance = 0;
			this.lastX = x;
			this.lastY = y;
		}
	},

	mousePressed(button, x, y /*, modifiers */) {
		this.pressed = true;
		this.x = x;
		this.y = y;
		this.distance = 0;
		this.counter = 0;
		// this.lastX = -1;
		// this.lastY = -1;

		const classes = [
			"gift-box",
			"collectible",
			"coin"
		];

		var dx = Math.floor(x / 64); //Math.abs(this.x - x);
		var dy = Math.floor(y / 64); //Math.abs(this.y - y);
		var lastdx = Math.floor(this.lastX / 64);
		var lastdy = Math.floor(this.lastY / 64);

		//tiled.log("MOVE =  DX/DX -> LDX/LDY: " + dx + "/" +  dy + " -> " + lastdx + "/" + lastdy );

		//this.distance += Math.sqrt(dx*dx + dy*dy);
		// this.x = x;
		// this.y = y;

		//if (this.distance > 64) {
		if (dx != lastdx || dy != lastdy) {
			/** @type ObjectGroup */
			var objectLayer = this.map.currentLayer;

			if (objectLayer && objectLayer.isObjectLayer) {
				// const brush = tiled.mapEditor.currentBrush.layerAt(0)
				// const tile = brush.tileAt(0, 0)
				var tile = this.selectedTile;

				if (this.mapSet.selectedTiles.length > 1) {
					//tiled.log("MULTI: " + this.getRandomInt(this.mapSet.selectedTiles.length) + " -> " + this.mapSet.selectedTiles[this.getRandomInt(this.mapSet.selectedTiles.length)]);
					tile = this.mapSet.selectedTiles[this.getRandomInt(this.mapSet.selectedTiles.length)];
					//tiled.log(tile);
				}

				var name = "";

				// Extract the name from the file
				// If anunderscore exist, then read no more of the name
				if (tile.className == "gift-box" || tile.className == "collectible" || tile.className == "coin") {
					tiled.log("\"" + tile.className + "\"");

					name = FileInfo.completeBaseName(tile.imageFileName);
					var index = name.indexOf("_");
					tiled.log(index);

					if (index > -1) {
						name = name.substring(0, index).toUpperCase();
					}
					//
					tiled.log(name);
				}
				else {
					name = "";
				}

				//var object = new MapObject(MapObject.Rectangle, "name " + ++this.counter);
				var object = new MapObject(MapObject.Rectangle, name);
				object.tile = tile;
				object.x = Math.floor(x / 64) * 64; //Math.min(this.lastX, x);
				object.y = Math.floor(y / 64) * 64; //Math.min(this.lastY, y);
				object.width = tile.width; //64; //Math.abs(this.lastX - x);
				object.height = tile.height; //;//Math.abs(this.lastY - y);
				objectLayer.addObject(object);
				object.selected = true;
			}

			this.distance = 0;
			this.lastX = x;
			this.lastY = y;
		}
	},

	mouseReleased(/* button, x, y, modifiers */) {
		this.pressed = false;
		this.lastX = -1;
		this.lastY = -1;
	},

	showPreview(x, y) {
		let preview = new TileMap();
		preview.setSize(this.map.width, this.map.height);
		preview.setTileSize(this.map.tileWidth, this.map.tileHeight);

		let layer = new TileLayer();
		//let layer = new ObjectGroup();
		preview.addLayer(layer);

		//tiled.log("TILE: " + this.selectedTile);

		let layerEdit = layer.edit();
		layerEdit.setTile(x, y, this.selectedTile); //the tile you want to display. flags are optional.

		//var object = new MapObject(MapObject.Rectangle);
		//object.tile = this.selectedTile;
		//layer.addObject(object);

		layerEdit.apply();
		this.preview = preview;
	}
});
