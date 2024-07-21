/*
 * TiledToLuaSlim.js
 *
 * This extension adds the "Defold files" type to the "Export As" menu,
 * which generates Defold style tilemaps, tilesources and atlases.
 * 
 * The tile maps are generated by finding tilesets and creating individual tilemaps
 * to use tiles from the tileset.
 *
 * Copyright (c) 2022 John Charles
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */


let filePath = "";
let fileBaseName = "";
let count = 0;
let collection = "";
let globalMap = null;
let globalFileName = null;
let tileset = null;
let mapSource = "";


//--------------------------------
//
// Main write function
//
//--------------------------------
function processMap(map, fileName) {

    let newPath = "";

    // Split full filename path into the filename (without extension) and the directory
    fileBaseName = FileInfo.completeBaseName(fileName).replace(/[^a-zA-Z0-9-_]/g, "_");
    filePath = FileInfo.path(fileName) + "/";

    // Replace the ‘/’ characters in the file path for ‘\’ on Windows
    filePath = FileInfo.toNativeSeparators(filePath);

    //Find first tile layer
    let currentLayer;
    let tilesourceFileData = "";
    count = 0;
    globalMap = map;
    globalFileName = fileName;

    // Check for map property 'create_dir' exist
    let mapProps = getProperties(map, "");
    let create_dir = mapProps.toLowerCase();
    //create_dir = create_dir.match("create_dir");

    //tiled.log(mapProps + " " + create_dir);
    // if (create_dir != null) {
    //     // Create the new folder
    //     filePath = filePath.replace(/\\/g, "/");
    //     fileBaseName = fileBaseName.replace(/\\/g, "/");
    //     newPath = filePath + fileBaseName + "/";
    //     File.makePath(newPath);
    // } else {
    newPath = filePath;// + "/";
    //console.log(newPath);
    //    }

    //tiled.log(newPath + ", " + fileBaseName);

    //--------------------------------------
    //
    // Process all Tilemaps first
    //
    //--------------------------------------
    for (let j = 0; j < map.tilesets.length; j++) {

        let tileset = map.tilesets[j];
        let fName = null;
        let baseName = null;
        let fPath = null;
        let re = null;

        //
        //console.log(FileInfo.baseName(tileset.image));
        tilesourceFileData = "";

        //-------------------------------------------
        // Tileset MUST be a single image in order 
        // to be considered a tilesource for Defold
        //-------------------------------------------
        if (tileset.image == "") {

            // Use UNDERSCORE as a flag to NOT export a tilelayer. IE: sml_ground
            // tiled.log(tileset.name)
            // console.log(tileset.name)
            //
            if (tileset.name.match('enemies') || tileset.name.match('backdrops'))
                continue;

            // tiled.log(newPath + tileset.name + ".atlas")
            // console.log(newPath + tileset.name + ".atlas");
            //            Atlas creation using a collection of images.Defold uses 2048x2048 max I believe
            tilesourceFileData = processImageCollection(tileset);

            //          Write tilesource file
            let tilesource = new TextFile(newPath + tileset.name + ".atlas", TextFile.WriteOnly);

            tilesource.write(tilesourceFileData);
            tilesource.commit();

            continue;
        }
        else {
            if (mapSource == "")
                mapSource = FileInfo.baseName(tileset.image);

        }
    }


    //let mapProps = getProperties(map, "");
    let luaString = "return {\n" +
        "  width = " + map.width + ",\n" +
        "  height = " + map.height + ",\n" +
        "  tilewidth = " + map.tileWidth + ",\n" +
        "  tileheight = " + map.tileHeight + ",\n" +
        "  levelname = \"" + map.className + "\",\n" +
        "  tilesource = \"" + mapSource + "\",\n" +
        //(mapProps != "" ? "  properties = {\n    " + mapProps + "\n  },\n" : "  properties = {},\n") +
        "  layers = {\n";

    //let tileset;
    let fName = null;
    let baseName = null;
    let fPath = null;
    let re = null;
    let stored = false;

    //------------------------------------
    //
    // Loop through the tile layers
    //
    //------------------------------------
    for (let i = 0; i < map.layerCount; ++i) {

        currentLayer = map.layerAt(i);
        stored = false;
        tilesourceFileData = "";

        //-------------------------------------------
        // Must be a Tile layer, and hasto be visible
        //-------------------------------------------
        if (currentLayer.isTileLayer && currentLayer.visible) {

            // Reset tileset ref to load the set
            tileset = null;
            let tempString = exportTileLayer(currentLayer);

            if (tempString != "") {

                // if (tileset == null || tileset.name.match('_'))
                //     continue;

                // Use UNDERSCORE as a flag to NOT export a tilelayer. IE: sml_ground
                if (currentLayer.name.match('_'))
                    continue;

                luaString += tempString;
                stored = true;

                // if (tileset != null) {
                //     let re_dir = removeBaseDirectory(tileset.image, globalFileName);
                //     re = RegExp(re_dir, "ig");
                //     fName = tileset.image.replace(re, '');
                //     fPath = FileInfo.path(fileName);
                //     baseName = FileInfo.completeBaseName(tileset.image);

                //     // Tilesource data creation
                //     tilesourceFileData +=
                //         //"image: \"/main/" + fileBaseName + "/" + tileset.name + ".png\"\n" +
                //         "image: \"/" + fName + "\"\n" +
                //         "tile_width: " + tileset.tileWidth + "\n" +
                //         "tile_height: " + tileset.tileHeight + "\n" +
                //         "tile_margin: " + tileset.margin + "\n" +
                //         "tile_spacing: " + tileset.tileSpacing + "\n" +
                //         "collision: \"/" + fName + "\"\n" +
                //         "material_tag: \"tile\"\n" +
                //         "collision_groups: \"ground\"\n" +
                //         "extrude_borders: 4\n" +
                //         "inner_padding: 0\n" +
                //         "sprite_trim_mode: SPRITE_TRIM_MODE_OFF\n";

                //     // Write tilesource file
                //     let tilesource = new TextFile(newPath + tileset.name + ".tilesource", TextFile.WriteOnly);
                //     tilesource.write(tilesourceFileData);
                //     tilesource.commit();
                // }
            }
        }
        else if (currentLayer.isObjectLayer && currentLayer.visible) {

            // // Must have objects
            // if (currentLayer.objectCount == 0)
            // {
            //     continue;
            // }

            let tempMap = null;
            let count = 0;

            while (tempMap == null && count < 10) {
                tempMap = exportObjects(currentLayer);
                //console.log(currentLayer.name, count);
                //tempMap = exportObjects(map, i);
                count++;
            }

            //            tiled.log("Objects: " + ((tempMap == null) ? "null" : "good") + " after " + count + " tries.")

            if (tempMap != "") {
                luaString += tempMap;
                stored = true;
            }
        }

        // Only write if a map processed
        if (stored == true) {
            luaString += "\n    }";
            if ((i + 1) < map.layerCount)
                luaString += ",  \n";
        }
    }

    luaString += "\n  }"; // layer
    luaString += "\n}";  // return
    // Write tilesource file
    //tiled.log(fileName);

    //console.log(newPath + fileBaseName + ".lua");
    let luaFile = new TextFile(newPath + fileBaseName + ".lua", TextFile.WriteOnly);
    luaFile.write(luaString);
    luaFile.commit();

    return "";
}


//--------------------------------------
//
// Remove common directory path to make
// path relative
//
//--------------------------------------
function removeBaseDirectory(fName, fileName) {
    let name = "";
    let i = 0;

    while (fName[i] == fileName[i]) {
        i++;
    }

    if (i > 0) {
        name = fileName.substring(0, i);
        //tiled.log(name);
    }

    return name;
}



//--------------------------------------
//
// Export image collection as an atlas
//
//--------------------------------------
function processImageCollection(tileset) {

    let stringData = "";
    let animations = "";
    let duration = 0;
    let fName = "";
    let re = "";
    let re_dir = "";

    //
    for (let c = 0; c < tileset.tiles.length; c++) {

        if (tileset.tiles[c] == null)
            continue;

        re_dir = removeBaseDirectory(tileset.tiles[c].imageFileName, globalFileName);
        re = RegExp(re_dir, "ig");

        fName = tileset.tiles[c].imageFileName.replace(re, '');

        //Header info
        stringData += "images {\n" +
            "  image: \"/" + fName + "\"" + "\n" +
            "  sprite_trim_mode: SPRITE_TRIM_MODE_OFF\n" +
            "}\n";


        //console.log("Animated: " + fName);
        // Save animation data should it exist
        //tiled.log(tileset.tiles[c].name);

        if (tileset.tiles[c] != null && tileset.tiles[c].animated != null && tileset.tiles[c].animated == true) {
            //console.log("Animated Name: " + fName);

            //let first = getTileOfId(tileset.tiles, tile.frames[0].tileId);
            //let anim = FileInfo.fileName(FileInfo.completeBaseName(first.imageFileName));
            let anim = FileInfo.fileName(FileInfo.completeBaseName(fName));
            //console.log("Animated Name: " + anim);

            animations += "animations {\n" +
                //"  id: \"anim-" + c + "\"\n";
                "  id: \"" + anim + "_anim\"\n";

            duration = 0;

            for (let i = 0; i < tileset.tiles[c].frames.length; i++) {
                let frame = tileset.tiles[c].frames[i];

                let realTile = getTileOfId(tileset.tiles, frame.tileId);

                if (realTile != null) {
                    // Add all durations together
                    duration += frame.duration;

                    re_dir = removeBaseDirectory(realTile.imageFileName, globalFileName);
                    re = RegExp(re_dir, "ig");
                    fName = realTile.imageFileName.replace(re, '');

                    animations += "  images {\n" +
                        //"    image: \"/" + realTile.imageFileName + "\"" + "\n" +
                        "    image: \"/" + fName + "\"" + "\n" +
                        "    sprite_trim_mode: SPRITE_TRIM_MODE_OFF\n" +
                        "  }\n";
                }
            }

            // Calcution an average of time per frame. 'Duration / frames' = based milliseconds for fps calculation
            //  fps = (1000 / Duration_base)
            // tiled.log(duration + " -> " + tileset.tiles[c].frames.length);
            duration /= tileset.tiles[c].frames.length;

            //tiled.log(tileset.tiles[c].className)
            //console.log("PROB: " + tileset.tiles[c].probability);
            if (tileset.tiles[c].className == "loop" || tileset.tiles[c].probability < 1.0) {
                animations += "  playback: PLAYBACK_LOOP_FORWARD\n" +
                    "  fps: " + parseInt(1000 / duration) + "\n" +
                    "  flip_horizontal: " + (tileset.tiles[c].FlippedHorizontally == true ? 1 : 0) + "\n" +
                    "  flip_vertical: " + (tileset.tiles[c].FlippedVertically == true ? 1 : 0) + "\n" +
                    "}\n";
            }
            else {
                animations += "  playback: PLAYBACK_ONCE_FORWARD\n" +
                    "  fps: " + parseInt(1000 / duration) + "\n" +
                    "  flip_horizontal: " + (tileset.tiles[c].FlippedHorizontally == true ? 1 : 0) + "\n" +
                    "  flip_vertical: " + (tileset.tiles[c].FlippedVertically == true ? 1 : 0) + "\n" +
                    "}\n";
            }
        }
    }

    if (stringData != "")
        return stringData + animations +
            "margin: 0\n" +
            "extrude_borders: 4\n" +
            "inner_padding: 0\n";
    else
        return "";
}


//--------------------------------------
//
// Return the actual to for tileId
//
//--------------------------------------
function getTileOfId(tiles, id) {

    for (let i = 0; i < tiles.length; i++) {

        //tiled.log("ID" + tiles[i].id + " " + id);
        if (tiles[i].id == id) {
            return tiles[i];
        }
    }

    return null;
}


//--------------------------------------
//
// Export image collection as an atlas
//
//--------------------------------------
function exportObjects(objectLayer) {

    //let stringData = "return {\n";
    let mapHeight = globalMap.height * globalMap.tileHeight;
    const shapes = [
        "rectangle",
        "polygon",
        "polyline",
        "ellipse",
        "text",
        "point"
    ];

    let layerObjs = getProperties(objectLayer, "  ");

    var c = 0;
    var fName = "";
    let stringData = "    {\n" +
        "      type = \"objectgroup\",\n" +
        "      id = " + objectLayer.id + ",\n" +
        "      class = \"" + objectLayer.className + "\",\n" +
        "      name = \"" + objectLayer.name + "\",\n" +
        "      width = " + (objectLayer.width ? objectLayer.width : 0) + ",\n" +
        "      height = " + (objectLayer.height ? objectLayer.height : 0) + ",\n" +
        "      visible = " + objectLayer.visible + ",\n" +
        (layerObjs != "" ? "      properties = {\n    " + layerObjs + "\n  },\n" : "      properties = {},\n") +
        "      objects = {\n";


    //tiled.log("Number of objects: " + objectLayer.objectCount);

    for (c = 0; c < objectLayer.objectCount; c++) {

        if (objectLayer.objects[c] == null) {
            //tiled.log("index: " + c);
            return null;
        }


        fName = "";
        if (objectLayer.objects[c].tile != null /*&& objectLayer.objects[c].tile.tileset != null*/) {

            // tiled.log( "ID: " + objectLayer.objects[c].id + " = " + objectLayer.objects[c].tile.tileset.name + " -> " + objectLayer.objects[c].tile.imageFileName + " @ " + objectLayer.objects[c].x + " " + objectLayer.objects[c].y );
            try {
                //console.log("ID: " + objectLayer.objects[c].id + " = " + objectLayer.objects[c].tile.tileset.name + " -> " + objectLayer.objects[c].tile.imageFileName + " @ " + objectLayer.objects[c].x + " " + objectLayer.objects[c].y);
                fName = "          img_src = \"" + FileInfo.fileName(FileInfo.completeBaseName(objectLayer.objects[c].tile.tileset.name)) + "\",\n";
                //fName = "          img_src = \"" + FileInfo.fileName(FileInfo.completeBaseName(objectLayer.objects[c].tile.asset.name)) + "\",\n";
            }
            catch (err) {
                //
                //console.log("ID: " + objectLayer.objects[c].id + " = " + objectLayer.objects[c].tile.imageFileName + " @ " + objectLayer.objects[c].x + " " + objectLayer.objects[c].y);

                console.log(objectLayer.objects[c].id + " -> Failed shit: " + err);
                //return null;
                //fName = "          img_src = \"objects\",\n";
            }
        }


        if (objectLayer.objects[c] != null) {
            stringData += "        {\n" +
                "          id = " + objectLayer.objects[c].id + ",\n" +
                "          class = \"" + (objectLayer.objects[c].className == "loop" ? "" : objectLayer.objects[c].className) + "\",\n" +

                fName +

                "          loop = " + (objectLayer.objects[c].className == "loop" ? true : false) + ",\n" +
                //"          name = \"" + objectLayer.objects[c].name + "\",\n" +
                "          x = " + (objectLayer.objects[c].x) + ",\n" +
                "          y = " + (mapHeight - objectLayer.objects[c].y) + ",\n" +
                "          width = " + objectLayer.objects[c].width + ",\n" +
                "          height = " + objectLayer.objects[c].height + ",\n" +
                "          rotation = " + objectLayer.objects[c].rotation + ",\n" +
                "          flip_x = " + ((objectLayer.objects[c].tileFlippedHorizontally == true) ? 1 : 0) + ",\n" +
                "          flip_y = " + ((objectLayer.objects[c].tileFlippedVertically == true) ? 1 : 0) + ",\n" +
                (objectLayer.objects[c].tile != null ? "          sprite = \"" + FileInfo.fileName(FileInfo.completeBaseName(objectLayer.objects[c].tile.imageFileName)) + "\",\n" : "") +
                "          visible = " + objectLayer.objects[c].visible;

            // IF Text
            if (shapes[objectLayer.objects[c].shape] == "text") {

                //tiled.log(shapes[objectLayer.objects[c].shape]);
                stringData += ",\n" +
                    "          fontsize = " + objectLayer.objects[c].font.pixelSize + ",\n" +
                    "          text = \"" + objectLayer.objects[c].text + "\"";
            }

            //tiled.log("Shape: " + shapes[objectLayer.objects[c].shape]);

            // IF Polyline / polygon
            //if (objectLayer.objects[c].polygon.length) {
            if (shapes[objectLayer.objects[c].shape] == "polygon" || shapes[objectLayer.objects[c].shape] == "polyline") {

                //tiled.log(shapes[objectLayer.objects[c].shape]);
                stringData += ",\n" +
                    "          shape = \"" + shapes[objectLayer.objects[c].shape] + "\",\n" +
                    "          " + shapes[objectLayer.objects[c].shape] + " = {\n";

                for (let i = 0; i < objectLayer.objects[c].polygon.length; i++) {
                    //stringData += "            { x = " + objectLayer.objects[c].polygon[i].x + ", y = " + objectLayer.objects[c].polygon[i].y + " }";                    
                    stringData += "            { x = " + objectLayer.objects[c].polygon[i].x + ", y = " + (-objectLayer.objects[c].polygon[i].y) + " }";

                    mapHeight - objectLayer.objects[c].y
                    if ((i + 1) < objectLayer.objects[c].polygon.length)
                        stringData += ",\n";
                    else
                        stringData += "\n";
                }

                stringData += "          }";
            }


            //---------------------------------------
            // Show properties only if the exist
            //---------------------------------------
            let objs = getProperties(objectLayer.objects[c], "          ");
            if (objs != "") {
                stringData += ",\n          properties = {\n" +
                    objs +
                    "\n          }";
            }

            // No unneccessary commas in the Lua code
            if ((c + 1) < objectLayer.objectCount)
                stringData += "\n        },\n";
            else
                stringData += "\n        }\n";
        }
    }

    // Close this segment for good
    stringData += "      }";

    return stringData;
}


//-----------------------------------
//
// Handle exporting the tilemaps
//
//-----------------------------------
function exportTileLayer(currentLayer) {

    let flags = 0;
    let layerObjs = getProperties(currentLayer, "      ");
    let stringData = "    {\n" +
        "      type = \"tilelayer\",\n" +
        "      id = " + currentLayer.id + ",\n" +
        "      class = \"" + currentLayer.className + "\",\n" +
        "      name = \"" + currentLayer.name + "\",\n" +
        "      width = " + currentLayer.width + ",\n" +
        "      height = " + currentLayer.height + ",\n" +
        "      visible = " + currentLayer.visible + ",\n" +
        (layerObjs != "" ? "      properties = {\n    " + layerObjs + "\n  },\n" : "      properties = {},\n") +
        "      data = {\n        ";

    for (let y = 0; y < currentLayer.height; y++) {
        for (let x = 0; x < currentLayer.width; x++) {

            let currentTile = currentLayer.cellAt(x, y);

            //Only write tile data for tiles map entries that exist
            if (currentTile.tileId != -1) {

                let value = 0;

                // If this is set, then X and Y flips get swapped for each other
                if (currentTile.flippedAntiDiagonally) {
                    console.log("ROTATE");
                    // Set rotate flag
                    value = 0x20000000;

                    if (!currentTile.flippedHorizontally) {
                        value += 0x40000000;
                    }
                    if (currentTile.flippedVertically) {
                        value += 0x80000000;
                    }
                } else {
                    // Clear rotate flag
                    value = 0;

                    if (currentTile.flippedHorizontally) {
                        value += 0x80000000;
                    }
                    if (currentTile.flippedVertically) {
                        value += 0x40000000;
                    }
                }

                // Add final adjustment
                stringData += (currentTile.tileId + value + 1);
            }
            else {
                stringData += "0";
            }

            if ((y * currentLayer.width + x + 1) < (currentLayer.width * currentLayer.height))
                stringData += ",";

            if ((x + 1) == currentLayer.width) {
                if ((y + 1) < currentLayer.height)
                    stringData += "\n        ";
            }
        }
    }

    return stringData + "\n      }";
}


//-----------------------------------------------
//
// Export properties in a simple form
// Custom Enums / classes only support numbers
//
//-----------------------------------------------
function getProperties(object, spaces) {

    let stringData = "";
    //let props = object.properties();
    let props = object.resolvedProperties();

    for (const [key, value] of Object.entries(props)) {

        let str = "";

        //--------------------------------
        // Check for special properties
        //--------------------------------
        if (key == "items") {
            let num = value.value;
            let index = 1;

            if (num > 0) str = spaces + "  " + key + " = {";

            //----------------------------------
            while (num > 0) {
                if (num & 1) {
                    if (index == 1)
                        str += " " + index;
                    else
                        str += ", " + index;
                }

                num >>= 1;
                index++;
            }

            if (str != "") str += " },\n";

            stringData += str; + 1
        }
        else {
            if (typeof value == 'object') {

                // Is it a ref to an object?
                if (value.typeName == null) {
                    // IE: Target_id
                    if (value.id == null) {
                        if (Object.entries(value) != "")
                            str = spaces + "  " + key + " = {\n" + getEntries(value, spaces + "  ") + "\n" + spaces + "  },\n";
                        else
                            //str = spaces + "  " + key + " = " + value + ",\n";

                            // String object
                            str = spaces + "  " + key + " = \"" + value + "\",\n";
                    } else
                        // Map object
                        //str = spaces + "  " + key + " = { id = " + value.id + " },\n";
                        str = spaces + "  " + key + " = " + value.id + ",\n";

                } else {
                    str = spaces + "  " + key + " = " + value.value + ",\n";
                }
            }
            else {
                if (typeof (value) == "string")
                    str = spaces + "  " + key + " = \"" + value + "\",\n";
                else {
                    if (value.id == null)
                        str = spaces + "  " + key + " = " + value + ",\n";
                    else {
                        str = spaces + "  " + key + " = { id = " + value.id + " },\n";
                    }
                }
                //                str = spaces + "  " + key + " = " + value + ",\n";
            }

            stringData += str;
        }
    }

    // Remove the last comma set
    if (stringData != "") {
        stringData = stringData.slice(0, -2);// + "\n";
    }

    return stringData;
}


//----------------------------------------
//
//----------------------------------------
function getEntries(object, spaces) {

    let stringData = "";

    for (const [key, value] of Object.entries(object)) {

        let str = "";

        if (typeof value == 'object') {

            // Is it a ref to an object?
            if (value.typeName == null) {

                if (value.id == null) {
                    if (Object.entries(value) != "")

                        str = spaces + "  " + key + " = { \n" + getEntries(value, spaces + "  ") + "\n" + spaces + "  },\n";

                    else
                        //str = spaces + "  " + key + " = " + value + ",\n";

                        // String object
                        str = spaces + "  " + key + " = \"" + value + "\",\n";
                } else
                    // Map object
                    //str = spaces + "  " + key + " = { id = " + value.id + " },\n";
                    str = spaces + "  " + key + " = " + value.id + ",\n";

            } else {
                str = spaces + "  " + key + " = " + value.value + ",\n";
            }
        }
        else {
            //console.log(typeof(value));
            if (typeof value == 'string') {
                str = spaces + "  " + key + " = \"" + value + "\",\n";
            }
            else {
                str = spaces + "  " + key + " = " + value + ",\n";
            }
        }

        stringData += str;
    }

    // Remove the last comma set
    if (stringData != "") {
        stringData = stringData.slice(0, -2);// + "\n";
    }

    return stringData;
}

const defold_custom =
{
    name: 'Custom Lua Export',
    extension: 'lua',
    write: processMap
};


// Register this action to the "Export As" menu selection
tiled.registerMapFormat('DefoldCustom', defold_custom);



