/*
 * Select all objects using the same GID
 *
  * Copyright (c) 2022 John Charles
 * 
 * This extension adds a 'Select all objects using the same GID' (F1) action to the Map
 * menu, which can be used to quickly select objects when you have a similar
 * object already selected. The object must have a tile assigned to it.
 *
 */


//-----------------------------------
//
// Handle selecting multiple objects
//
//-----------------------------------
function traverseLayer(map, objectLayer, tile) {
    let i = 0;
    var array = [];
    let gid = tile.id;
    let tileset = tile.tileset;

    for (let c = 0; c < objectLayer.objectCount; c++) {
        let obj = objectLayer.objects[c];

        if (obj.tile == null)
            continue;

        if (obj.tile.id == gid && obj.tile.tileset == tileset) {
            array.push(obj);
        }
    }

    if (array.length > 0)
        map.selectedObjects = array;
}


let jumpToObject = tiled.registerAction("JumpToObject", function (/* action */) {

    const map = tiled.activeAsset;

    if (!map.isTileMap) {
        tiled.alert("Not a tile map!");
        return;
    }

    //
    for (let i = 0; i < map.layerCount; ++i) {

        currentLayer = map.layerAt(i);

        //-------------------------------------------
        // Must be a Tile layer, and hasto be visible
        //-------------------------------------------
        if (currentLayer.isObjectLayer && currentLayer.visible) {

            //tiled.log(map.selectedObjects.length);

            if (map.selectedObjects.length == 1) {
                let object = map.selectedObjects[0];

                //tiled.log(object + " " + object.tile);
                if (object.tile != null) {

                    // Process the request
                    traverseLayer(map, currentLayer, object.tile);
                    break;
                }
                else {
                    tiled.alert("This object does not contain an image.");
                    return;
                }

            }
            else if (map.selectedObjects.length == 0) {
                tiled.alert("One object must be selected to process this request.");
            } else {
                tiled.alert("Only one object can be selected for this action..");
            }
        }
    }
});


jumpToObject.text = "Select Objects with the same GID";
jumpToObject.shortcut = "ctrl+]";

tiled.extendMenu("Map", [
    { separator: true },
    { action: "JumpToObject" },
]);
