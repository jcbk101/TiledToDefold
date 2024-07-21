/// <reference types="@mapeditor/tiled-api" />

/*
 * find-object-by-id.js
 *
 * This extension adds a 'Find Object by ID' (Ctrl+Shift+F) action to the Map
 * menu, which can be used to quickly jump to and select an object when you
 * know its ID.
 *
 * The script relies on the recently added TileMap.pixelToScreen conversion
 * function to work properly for isometric maps.
 */

/* global tiled */
function findObjectById(thing, id) {
	for (let i = thing.layerCount - 1; i >= 0; i--) {
		const layer = thing.layerAt(i);

		if (layer.isGroupLayer) {
			const obj = findObjectById(layer, id);
			if (obj) {
				return obj;
			}
		} else if (layer.isObjectLayer) {
			for (const obj of layer.objects) {
				if (obj.id == id) {
					return obj;
				}
			}
		}
	}

	return null;
}


function changeObjName(map) {
	//tiled.log("COUNT: " + map.layerCount)

	for (let i = 0; i < map.layerCount; i++) {
		const layer = map.layerAt(i);

		// if (layer.isGroupLayer) {
		// 	changeObjName(layer);
		//} else 
		if (layer.isObjectLayer && layer.visible) {
			for (const obj of layer.objects) {
				var name = getIdProperties(obj);
				if (name != null) {
					//tiled.log("NAME-DONE: " + name);
					obj.name = name;
				}
			}
		}
	}

	return null;
}


//-----------------------------------------------
//
// Export properties in a simple form
// Custom Enums / classes only support numbers
//
//-----------------------------------------------
function getIdProperties(object) {

	//let props = object.properties();
	let props = object.resolvedProperties();
	let hidden_name = null;

	//tiled.log("CLASSNAME: " + object.className);

	for (const [key, value] of Object.entries(props)) {

		//--------------------------------
		// Check for special properties
		//--------------------------------
		if (key == "item") {
			if (typeof value == "object") {
				//tiled.log("CLASSNAME: " + object.className);
				//tiled.log("ITEM-OBJECT: " + key + " " + value);
				var name = getIdEntries(value, object.className);
				if (name != null)
					//return name;
					hidden_name = (hidden_name == null) ? name : hidden_name + "[ " + name+ " ]";

			}
		} else {
			if (key == "hidden") {
				if (value == true)
					hidden_name = "HIDDEN->";
			}
			else if (key == "hard_mode")
				if (value == true)
					return "HARD MODE";
				else
					return "";
			else if (key == "level_end")
				if (value == true)
					return "LEVEL END"
				else
					return "CHECK POINT";
			else if (key == "regenerate")
				return "CRUMBLE";
			else {
				//tiled.log("ITEM-VALUE: " + key + " " + value);
			}
		}
	}

	if (hidden_name)
		return hidden_name;
	else
		return null;
}

//----------------------------------------
//
//----------------------------------------
function getIdEntries(object, className) {

	const items = [
		"coin", "COIN",
		"clock", "CLOCK",
		"heart", "1-UP",
		"shuriken", "SHURIKENS",
		"magnet", "MAGNET",
		"bomb", "BOMBS",
		"power_up", "POWER UP",
		"warp", "WARP",
		"key", "KEY",
		"gold_star", "GOLD STAR",
		"none", "EMPTY"
	];
	var name = "";
	var typeId = -1;
	var index = -1;
	var item = false;

	for (const [key, value] of Object.entries(object)) {

		if (typeof value == 'object') {
			//tiled.log("OBJECT: " + key + " = " + value);
		}
		else {
			//			tiled.log("TYPE: " + typeof key + " -> " + key + " = " + value);
			if (key == "typeName" && typeof value == "string" && value == "ItemsList") {
				item = true;
			} else if (key == "typeId") {
				typeId = value;
			} else if (key == "value") {
				index = value;
			}
		}
	}

	if (item) {
		//tiled.log(items[1 + index * 2]);
		return items[1 + index * 2];
	}

	return null;
}


let jumpToObject = tiled.registerAction("JumpToObject", function (/* action */) {
	const map = tiled.activeAsset;
	if (!map.isTileMap) {
		tiled.alert("Not a tile map!");
		return;
	}

	let id = tiled.prompt("Please enter an object ID:");
	if (id == "") {
		return;
	}

	id = Number(id);

	const object = findObjectById(map, id);
	if (!object) {
		tiled.alert("Failed to find object with ID " + id);
		return;
	}

	const pos = map.pixelToScreen ? map.pixelToScreen(object.pos) : object.pos;
	tiled.mapEditor.currentMapView.centerOn(pos.x, pos.y);

	map.selectedObjects = [object];
});


// Qt.QComboBox.currentIndexChanged.connect(function (string) {
// 	tiled.log("CHANGED: " + string);
// });

tiled.assetAboutToBeSaved.connect(function (map) {
	//const map = tiled.activeAsset;
	//tiled.log("NAME: " + map.fileName);

	//tiled.log(p);
	changeObjName(map);
});


jumpToObject.text = "Find Object by ID";
jumpToObject.shortcut = "Ctrl+Shift+F";

tiled.extendMenu("Map", [
	{ separator: true },
	{ action: "JumpToObject" },
]);
