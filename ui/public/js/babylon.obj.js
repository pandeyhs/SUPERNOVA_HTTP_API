/// <reference path="../References/babylon.2.1.d.ts"/>
/// <reference path="../References/waa.d.ts"/>
var BABYLON;
(function (BABYLON) {
    /**
     * Class reading and parsing the MTL file bundled with the obj file.
     */
    var MTLFileLoader = (function () {
        function MTLFileLoader() {
            // All material loaded from the mtl will be set here
            this.materials = [];
            /**
             * This function will read the mtl file and create each material described inside
             * This function could be improve by adding :
             * -some component missing (Ni, Tf...)
             * -including the specific options available
             *
             * @param scene
             * @param data
             * @param rootUrl
             */
            this.parseMTL = function (scene, data, rootUrl) {
                //Split the lines from the file
                var lines = data.split('\n');
                //Space char
                var delimiter_pattern = /\s+/;
                //Array with RGB colors
                var color;
                //New material
                var material;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    line = line.trim();
                    // Blank line or comment
                    if (line.length === 0 || line.charAt(0) === '#') {
                        continue;
                    }
                    //Get the first parameter (keyword)
                    var pos = line.indexOf(' ');
                    var key = (pos >= 0) ? line.substring(0, pos) : line;
                    key = key.toLowerCase();
                    //Get the data following the key
                    var value = (pos >= 0) ? line.substring(pos + 1) : "";
                    value = value.trim();
                    //This mtl keyword will create the new material
                    if (key === "newmtl") {
                        //Check if it is the first material.
                        // Materials specifications are described after this keyword.
                        if (material) {
                            //Add the previous material in the material array.
                            this.materials.push(material);
                        }
                        //Create a new material.
                        // value is the name of the material read in the mtl file
                        material = new BABYLON.StandardMaterial(value, scene);
                    }
                    else if (key === "kd") {
                        // Diffuse color (color under white light) using RGB values
                        //value  = "r g b"
                        color = value.split(delimiter_pattern, 3);
                        //color = [r,g,b]
                        //Set tghe color into the material
                        material.diffuseColor = BABYLON.Color3.FromArray(color);
                    }
                    else if (key === "ka") {
                        // Ambient color (color under shadow) using RGB values
                        //value = "r g b"
                        color = value.split(delimiter_pattern, 3);
                        //color = [r,g,b]
                        //Set tghe color into the material
                        material.ambientColor = BABYLON.Color3.FromArray(color);
                    }
                    else if (key === "ks") {
                        // Specular color (color when light is reflected from shiny surface) using RGB values
                        //value = "r g b"
                        color = value.split(delimiter_pattern, 3);
                        //color = [r,g,b]
                        //Set the color into the material
                        material.specularColor = BABYLON.Color3.FromArray(color);
                    }
                    else if (key === "ns") {
                        //value = "Integer"
                        material.specularPower = value;
                    }
                    else if (key === "d") {
                        //d is dissolve for current material. It mean alpha for BABYLON
                        material.alpha = value;
                    }
                    else if (key === "map_ka") {
                        // ambient texture map with a loaded image
                        //We must first get the folder of the image
                        material.ambientTexture = new BABYLON.Texture(rootUrl + value, scene);
                    }
                    else if (key === "map_kd") {
                        // Diffuse texture map with a loaded image
                        material.diffuseTexture = new BABYLON.Texture(rootUrl + value, scene);
                    }
                    else if (key === "map_ks") {
                        // Specular texture map with a loaded image
                        //We must first get the folder of the image
                        material.specularTexture = new BABYLON.Texture(rootUrl + value, scene);
                    }
                    else if (key === "map_ns") {
                    }
                    else if (key === "map_bump") {
                        //The bump texture
                        material.bumpTexture = new BABYLON.Texture(rootUrl + value, scene);
                    }
                    else if (key === "map_d") {
                        // The dissolve of the material
                        material.opacityTexture = new BABYLON.Texture(rootUrl + value, scene);
                    }
                    else if (key === "illum") {
                        //Illumination
                        if (value === "0") {
                        }
                        else if (value === "1") {
                        }
                        else if (value === "2") {
                        }
                        else if (value === "3") {
                        }
                        else if (value === "4") {
                        }
                        else if (value === "5") {
                        }
                        else if (value === "6") {
                        }
                        else if (value === "7") {
                        }
                        else if (value === "8") {
                        }
                        else if (value === "9") {
                        }
                        else if (value === "10") {
                        }
                    }
                    else {
                    }
                }
                //At the end of the file, add the last material
                this.materials.push(material);
            };
        }
        return MTLFileLoader;
    })();
    BABYLON.MTLFileLoader = MTLFileLoader;
    var OBJFileLoader = (function () {
        function OBJFileLoader() {
            this.extensions = ".obj";
            this.obj = /^o/;
            this.group = /^g/;
            this.mtllib = /^mtllib /;
            this.usemtl = /^usemtl /;
            this.smooth = /^s /;
            this.vertexPattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
            // vn float float float
            this.normalPattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
            // vt float float
            this.uvPattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;
            // f vertex vertex vertex ...
            this.facePattern1 = /f\s(([\d]{1,}[\s]?){3,})+/;
            // f vertex/uvs vertex/uvs vertex/uvs ...
            this.facePattern2 = /f\s((([\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
            // f vertex/uvs/normal vertex/uvs/normal vertex/uvs/normal ...
            this.facePattern3 = /f\s((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
            // f vertex//normal vertex//normal vertex//normal ...
            this.facePattern4 = /f\s((([\d]{1,}\/\/[\d]{1,}[\s]?){3,})+)/;
        }
        /**
         * Calls synchronously the MTL file attached to this obj.
         * Load function or importMesh function don't enable to load 2 files in the same time asynchronously.
         * Without this function materials are not displayed in the first frame (but displayed after).
         * In consequence it is impossible to get material information in your HTML file
         *
         * @param url The URL of the MTL file
         * @param rootUrl
         * @param onSuccess Callback function to be called when the MTL file is loaded
         * @private
         */
        OBJFileLoader.prototype._loadMTL = function (url, rootUrl, onSuccess) {
            //XMLHTTP object to load the file
            var request = new XMLHttpRequest();
            //The complete path to the mtl file
            var pathOfFile = BABYLON.Tools.BaseUrl + rootUrl + url;
            //Get the file synchronously
            request.open('GET', pathOfFile, false);
            //Check the server status
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200 || BABYLON.Tools.ValidateXHRData(request, 1)) {
                        //Data are loaded
                        onSuccess(request.responseText);
                    }
                    else {
                        //File not found
                        console.warn("Error status: " + request.status + " - Unable to load " + pathOfFile);
                    }
                }
            };
            request.send(null);
        };
        OBJFileLoader.prototype.importMesh = function (meshesNames, scene, data, rootUrl, meshes, particleSystems, skeletons) {
            //get the meshes from OBJ file
            var loadedMeshes = this._parseSolid(meshesNames, scene, data, rootUrl);
            //Push each mesh from OBJ file into the variable mesh of this function
            if (meshes) {
                loadedMeshes.forEach(function (mesh) {
                    meshes.push(mesh);
                });
            }
            return true;
        };
        OBJFileLoader.prototype.load = function (scene, data, rootUrl) {
            //Get the 3D model
            return this.importMesh(null, scene, data, rootUrl, null, null, null);
        };
        /**
         * Read the OBJ file and create an Array of meshes.
         * Each mesh contains all information given by the OBJ and the MTL file.
         * i.e. vertices positions and indices, optional normals values, optional UV values, optional material
         *
         * @param meshesNames
         * @param scene BABYLON.Scene The scene where are displayed the data
         * @param data String The content of the obj file
         * @param rootUrl String The path to the folder
         * @returns Array<AbstractMesh>
         * @private
         */
        OBJFileLoader.prototype._parseSolid = function (meshesNames, scene, data, rootUrl) {
            var positions = []; //values for the positions of vertices
            var normals = []; //Values for the normals
            var uvs = []; //Values for the textures
            var meshesFromObj = []; //[mesh] Contains all the obj meshes
            var handledMesh; //The current mesh of meshes array
            var indicesForBabylon = []; //The list of indices for VertexData
            var wrappedPositionForBabylon = []; //The list of position in vectors
            var wrappedUvsForBabylon = []; //Array with all value of uvs to match with the indices
            var wrappedNormalsForBabylon = []; //Array with all value of normals to match with the indices
            var tuplePosNorm = []; //Create a tuple with indice of Position, Normal, UV  [pos, norm, uvs]
            var hasMeshes = false; //Meshes are defined in the file
            var unwrappedPositionsForBabylon = []; //Value of positionForBabylon w/o Vector3() [x,y,z]
            var unwrappedNormalsForBabylon = []; //Value of normalsForBabylon w/o Vector3()  [x,y,z]
            var unwrappedUVForBabylon = []; //Value of uvsForBabylon w/o Vector3()      [x,y,z]
            var triangles = []; //Indices from new triangles coming from polygons
            var materialName = ""; //The name of the current material
            var fileToLoad = ""; //The name of the mtlFile to load
            var materialsFromMTLFile = new MTLFileLoader();
            /**
             * Search for obj in the given array.
             * This function is called to check if a couple of data already exists in an array.
             *
             * If found, returns the index of the founded tuple index. Returns -1 if not found
             * @param arr Array<BABYLON.Vector2>
             * @param obj BABYLON.Vector2
             * @returns {number}
             */
            var isInArray = function (arr, obj) {
                //Default value : not found
                var res = -1;
                for (var i = 0; i < arr.length; i++) {
                    var element = arr[i];
                    //Comparison of each element of the tuple
                    if (element.x === obj.x && element.y === obj.y) {
                        res = i;
                    }
                }
                //Return the indice of the founded element
                return res;
            };
            /**
             * This function set the data for each triangle.
             * Data are position, normals and uvs
             * If a tuple of (position, normal) is not set, add the data into the corresponding array
             * If the tuple already exist, add only their indice
             *
             * @param indicePositionFromObj Integer The index in positions array
             * @param indiceNormalFromObj Integer The index in normals array
             * @param positionVectorFromOBJ Vector3 The value of position at index objIndice
             * @param textureVectorFromOBJ Vector3 The value of uvs
             * @param normalsVectorFromOBJ Vector3 The value of normals at index objNormale
             */
            var setData = function (indicePositionFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ) {
                //Create a new tuple composed with the indice of position and normal
                var tuple = new BABYLON.Vector2(indicePositionFromObj, indiceNormalFromObj);
                //Check if this tuple already exists in the list of tuples
                var _index = isInArray(tuplePosNorm, tuple);
                //If it not exists
                if (_index == -1) {
                    //Add an new indice.
                    //The array of indices is only an array with his length equal to the number of triangles - 1.
                    //We add vertices data in this order
                    indicesForBabylon.push(wrappedPositionForBabylon.length);
                    //Push the position of vertice for Babylon
                    //Each element is a BABYLON.Vector3(x,y,z)
                    wrappedPositionForBabylon.push(positionVectorFromOBJ);
                    //Push the uvs for Babylon
                    //Each element is a BABYLON.Vector3(u,v)
                    wrappedUvsForBabylon.push(textureVectorFromOBJ);
                    //Push the normals for Babylon
                    //Each element is a BABYLON.Vector3(x,y,z)
                    wrappedNormalsForBabylon.push(normalsVectorFromOBJ);
                    //Add the tuple in the comparison list
                    tuplePosNorm.push(tuple);
                }
                else {
                    //The tuple already exists
                    //Add the index of the already existing tuple
                    //At this index we can get the value of position, normal and uvs of vertex
                    indicesForBabylon.push(_index);
                }
            };
            /**
             * Transform BABYLON.Vector() object onto 3 digits in an array
             */
            var unwrapData = function () {
                for (var l = 0; l < wrappedPositionForBabylon.length; l++) {
                    //Push the x, y, z values of each element in the unwrapped array
                    unwrappedPositionsForBabylon.push(wrappedPositionForBabylon[l].x, wrappedPositionForBabylon[l].y, wrappedPositionForBabylon[l].z);
                    unwrappedNormalsForBabylon.push(wrappedNormalsForBabylon[l].x, wrappedNormalsForBabylon[l].y, wrappedNormalsForBabylon[l].z);
                    unwrappedUVForBabylon.push(wrappedUvsForBabylon[l].x, wrappedUvsForBabylon[l].y); //z is an optional value not supported by BABYLON
                }
            };
            /**
             * Create triangles from polygons by recursion
             * The best to understand how it works is to draw it in the same time you get the recursion.
             * It is important to notice that a triangle is a polygon
             * We get 4 patterns of face defined in OBJ File :
             * facePattern1 = ["1","2","3","4","5","6"]
             * facePattern2 = ["1/1","2/2","3/3","4/4","5/5","6/6"]
             * facePattern3 = ["1/1/1","2/2/2","3/3/3","4/4/4","5/5/5","6/6/6"]
             * facePattern4 = ["1//1","2//2","3//3","4//4","5//5","6//6"]
             * Each pattern is divided by the same method
             * @param face Array[String] The indices of elements
             * @param v Integer The variable to increment
             */
            var getTriangles = function (face, v) {
                //Work for each element of the array
                if (v + 1 < face.length) {
                    //Add on the triangle variable the indexes to obtain triangles
                    triangles.push(face[0], face[v], face[v + 1]);
                    //Incrementation for recursion
                    v += 1;
                    //Recursion
                    getTriangles(face, v);
                }
                //Result obtained after 2 iterations:
                //Pattern1 => triangle = ["1","2","3","1","3","4"];
                //Pattern2 => triangle = ["1/1","2/2","3/3","1/1","3/3","4/4"];
                //Pattern3 => triangle = ["1/1/1","2/2/2","3/3/3","1/1/1","3/3/3","4/4/4"];
                //Pattern4 => triangle = ["1//1","2//2","3//3","1//1","3//3","4//4"];
            };
            /**
             * Create triangles and push the data for each polygon for the pattern 1
             * In this pattern we get vertice positions
             * @param face
             * @param v
             */
            var setDataForCurrentFaceWithPattern1 = function (face, v) {
                //Get the indices of triangles for each polygon
                getTriangles(face, v);
                for (var k = 0; k < triangles.length; k++) {
                    // Set position indice
                    var indicePositionFromObj = parseInt(triangles[k]) - 1;
                    //In the pattern 1, normals and uvs are not defined
                    //Default values are set
                    var indiceUvsFromObj = 0;
                    var indiceNormalFromObj = 0;
                    //Get the vectors data
                    var positionVectorFromOBJ = positions[indicePositionFromObj];
                    //Create default vectors
                    var textureVectorFromOBJ = new BABYLON.Vector2(0, 0);
                    var normalsVectorFromOBJ = new BABYLON.Vector3(0, 1, 0);
                    setData(indicePositionFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ);
                }
                //Reset variable for the next line
                triangles = [];
            };
            /**
             * Create triangles and push the data for each polygon for the pattern 2
             * In this pattern we get vertice positions and uvs
             * @param face
             * @param v
             */
            var setDataForCurrentFaceWithPattern2 = function (face, v) {
                //Get the indices of triangles for each polygon
                getTriangles(face, v);
                for (var k = 0; k < triangles.length; k++) {
                    //triangle[k] = "1/1"
                    //Split the data for getting position and uv
                    var point = triangles[k].split("/"); // ["1", "1"]
                    //Set position indice
                    var indicePositionFromObj = parseInt(point[0]) - 1;
                    //Set uv indice
                    var indiceUvsFromObj = parseInt(point[1]) - 1;
                    //Default value for normals
                    var indiceNormalFromObj = 0;
                    //Get the values for each element
                    var positionVectorFromOBJ = positions[indicePositionFromObj];
                    var textureVectorFromOBJ = uvs[indiceUvsFromObj];
                    //Default value for normals
                    var normalsVectorFromOBJ = new BABYLON.Vector3(0, 1, 0);
                    setData(indicePositionFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ);
                }
                //Reset variable for the next line
                triangles = [];
            };
            /**
             * Create triangles and push the data for each polygon for the pattern 3
             * In this pattern we get vertice positions, uvs and normals
             * @param face
             * @param v
             */
            var setDataForCurrentFaceWithPattern3 = function (face, v) {
                //Get the indices of triangles for each polygon
                getTriangles(face, v);
                for (var k = 0; k < triangles.length; k++) {
                    //triangle[k] = "1/1/1"
                    //Split the data for getting position, uv, and normals
                    var point = triangles[k].split("/"); // ["1", "1", "1"]
                    // Set position indice
                    var indicePositionFromObj = parseInt(point[0]) - 1;
                    // Set uv indice
                    var indiceUvsFromObj = parseInt(point[1]) - 1;
                    // Set normal indice
                    var indiceNormalFromObj = parseInt(point[2]) - 1;
                    //Set the vector for each component
                    var positionVectorFromOBJ = positions[indicePositionFromObj];
                    var textureVectorFromOBJ = uvs[indiceUvsFromObj];
                    var normalsVectorFromOBJ = normals[indiceNormalFromObj];
                    setData(indicePositionFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ);
                }
                //Reset variable for the next line
                triangles = [];
            };
            /**
             * Create triangles and push the data for each polygon for the pattern 4
             * In this pattern we get vertice positions and normals
             * @param face
             * @param v
             */
            var setDataForCurrentFaceWithPattern4 = function (face, v) {
                getTriangles(face, v);
                for (var k = 0; k < triangles.length; k++) {
                    //triangle[k] = "1//1"
                    //Split the data for getting position and normals
                    var point = triangles[k].split("//"); // ["1", "1"]
                    // We check indices, and normals
                    var indicePositionFromObj = parseInt(point[0]) - 1;
                    var indiceNormalFromObj = parseInt(point[1]) - 1;
                    //Default value for uv
                    var indiceUvsFromObj = 1;
                    //Get each vector of data
                    var positionVectorFromOBJ = positions[indicePositionFromObj];
                    var textureVectorFromOBJ = new BABYLON.Vector2(0, 0);
                    var normalsVectorFromOBJ = normals[indiceNormalFromObj];
                    setData(indicePositionFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ);
                }
                //Reset variable for the next line
                triangles = [];
            };
            //Main function
            //Split the file into lines
            var lines = data.split('\n');
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.trim();
                var result;
                //Comment or newLine
                if (line.length === 0 || line.charAt(0) === '#') {
                    continue;
                }
                else if ((result = this.vertexPattern.exec(line)) !== null) {
                    //Create a Vector3 with the position x, y, z
                    //Value of result:
                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
                    var vectVertex = new BABYLON.Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                    //Add the Vector in the list of positions
                    positions.push(vectVertex);
                }
                else if ((result = this.normalPattern.exec(line)) !== null) {
                    //Create a Vector3 with the normals x, y, z
                    //Value of result
                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
                    var vectNormals = new BABYLON.Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                    //Add the Vector in the list of normals
                    normals.push(vectNormals);
                }
                else if ((result = this.uvPattern.exec(line)) !== null) {
                    //Create a Vector2 with the normals u, v
                    //Value of result
                    // ["vt 0.1 0.2 0.3", "0.1", "0.2"]
                    var vectUV = new BABYLON.Vector2(parseFloat(result[1]), parseFloat(result[2]));
                    //Add the Vector in the list of uvs
                    uvs.push(vectUV);
                }
                else if ((result = this.facePattern3.exec(line)) !== null) {
                    //Value of result:
                    //["f 1/1/1 2/2/2 3/3/3", "1/1/1 2/2/2 3/3/3"...]
                    result = result[1].trim();
                    var face = result.split(" "); // ["1/1/1", "2/2/2", "3/3/3"]
                    //Set the data for this face
                    setDataForCurrentFaceWithPattern3(face, 1);
                }
                else if ((result = this.facePattern4.exec(line)) !== null) {
                    //Value of result:
                    //["f 1//1 2//2 3//3", "1//1 2//2 3//3"...]
                    result = result[1].trim();
                    var face = result.split(" "); // ["1//1", "2//2", "3//3"]
                    //Set the data for this face
                    setDataForCurrentFaceWithPattern4(face, 1);
                }
                else if ((result = this.facePattern2.exec(line)) !== null) {
                    //Value of result:
                    //["f 1/1 2/2 3/3", "1/1 2/2 3/3"...]
                    result = result[1].trim();
                    var face = result.split(" "); // ["1/1", "2/2", "3/3"]
                    //Set the data for this face
                    setDataForCurrentFaceWithPattern2(face, 1);
                }
                else if ((result = this.facePattern1.exec(line)) !== null) {
                    //Value of result
                    //["f 1 2 3", "1 2 3"...]
                    result = result[1].trim();
                    var face = result.split(" "); // ["1", "2", "3"]
                    //Set the data for this face
                    setDataForCurrentFaceWithPattern1(face, 1);
                }
                else if (this.group.test(line) || this.obj.test(line)) {
                    //Create a new mesh corresponding to the name of the group.
                    //Definition of the mesh
                    var objMesh = {
                        name: line.substring(2).trim(),
                        indices: undefined,
                        positions: undefined,
                        normals: undefined,
                        uvs: undefined,
                        materialName: ""
                    };
                    //Check if it is not the first mesh. Otherwise we don't have data.
                    if (meshesFromObj.length > 0) {
                        //Get the previous mesh for applying the data about the faces
                        //=> in obj file, faces definition append after the name of the mesh
                        handledMesh = meshesFromObj[meshesFromObj.length - 1];
                        //Set the data into Array for the mesh
                        unwrapData();
                        // Reverse tab. Otherwise face are displayed in the wrong sens
                        indicesForBabylon.reverse();
                        //Set the information for the mesh
                        //Slice the array to avoid rewriting because of the fact this is the same var which be rewrited
                        handledMesh.indices = indicesForBabylon.slice();
                        handledMesh.positions = unwrappedPositionsForBabylon.slice();
                        handledMesh.normals = unwrappedNormalsForBabylon.slice();
                        handledMesh.uvs = unwrappedUVForBabylon.slice();
                        //Reset the array for the next mesh
                        indicesForBabylon = [];
                        unwrappedPositionsForBabylon = [];
                        unwrappedNormalsForBabylon = [];
                        unwrappedUVForBabylon = [];
                    }
                    //Push the last mesh created with only the name
                    meshesFromObj.push(objMesh);
                    //Set this variable to indicate that now meshesFromObj has objects defined inside
                    hasMeshes = true;
                }
                else if (this.usemtl.test(line)) {
                    //Get the name of the material
                    materialName = line.substring(7).trim();
                    //If meshes are already defined
                    if (hasMeshes) {
                        var m = meshesFromObj.length;
                        //Set the material name to the previous mesh (1 material per mesh)
                        meshesFromObj[m - 1].materialName = materialName;
                    }
                }
                else if (this.mtllib.test(line)) {
                    //Get the name of mtl file
                    fileToLoad = line.substring(7).trim();
                }
                else if (this.smooth.test(line)) {
                }
                else {
                    //If there is another possibility
                    console.log("Unhandled expression at line : " + line);
                }
            }
            //At the end of the file, add the last mesh into the meshesFromObj array
            if (hasMeshes) {
                //Set the data for the last mesh
                handledMesh = meshesFromObj[meshesFromObj.length - 1];
                //Reverse indices for displaying faces in the good sens
                indicesForBabylon.reverse();
                //Get the good array
                unwrapData();
                //Set array
                handledMesh.indices = indicesForBabylon;
                handledMesh.positions = unwrappedPositionsForBabylon;
                handledMesh.normals = unwrappedNormalsForBabylon;
                handledMesh.uvs = unwrappedUVForBabylon;
            }
            //If any o or g keyword found, create a mesj with a random id
            if (!hasMeshes) {
                //If there is no object name or no mesh name
                var myname = BABYLON.Geometry.RandomId();
                // reverse tab of indices
                indicesForBabylon.reverse();
                //Get positions normals uvs
                unwrapData();
                //Set data for one mesh
                meshesFromObj.push({
                    name: myname,
                    indices: indicesForBabylon,
                    positions: unwrappedPositionsForBabylon,
                    normals: unwrappedNormalsForBabylon,
                    uvs: unwrappedUVForBabylon,
                    materialName: materialName
                });
            }
            //Create a BABYLON.Mesh list
            var vertexData = new BABYLON.VertexData(); //The container for the values
            var babylonMeshesArray = []; //The mesh for babylon
            var materialToUse = [];
            for (var j = 0; j < meshesFromObj.length; j++) {
                //check meshesNames (stlFileLoader)
                if (meshesNames && meshesFromObj[j].name) {
                    if (meshesNames instanceof Array) {
                        if (meshesNames.indexOf(meshesFromObj[j].name) == -1) {
                            continue;
                        }
                    }
                    else {
                        if (meshesFromObj[j].name !== meshesNames) {
                            continue;
                        }
                    }
                }
                //Get the current mesh
                //Set the data with VertexBuffer for each mesh
                handledMesh = meshesFromObj[j];
                //Create a BABYLON.Mesh with the name of the obj mesh
                var babylonMesh = new BABYLON.Mesh(meshesFromObj[j].name, scene);
                //Push the name of the material to an array
                //This is indispensable for the importMesh function
                materialToUse.push(meshesFromObj[j].materialName);
                //Set the data for the babylonMesh
                vertexData.positions = handledMesh.positions;
                vertexData.normals = handledMesh.normals;
                vertexData.uvs = handledMesh.uvs;
                vertexData.indices = handledMesh.indices;
                //Set the data from the VertexBuffer to the current BABYLON.Mesh
                vertexData.applyToMesh(babylonMesh);
                //Push the mesh into an array
                babylonMeshesArray.push(babylonMesh);
            }
            //load the materials
            //Check if we have a file to load
            if (fileToLoad !== "") {
                //Load the file synchronously
                this._loadMTL(fileToLoad, rootUrl, function (dataLoaded) {
                    //Create materials thanks MTLLoader function
                    materialsFromMTLFile.parseMTL(scene, dataLoaded, rootUrl);
                    for (var n = 0; n < materialsFromMTLFile.materials.length; n++) {
                        //Get the index of the MTL material corresponding with the BABYLON.Mesh material
                        var _index = materialToUse.indexOf(materialsFromMTLFile.materials[n].name);
                        if (_index == -1) {
                            //If the material is not needed, remove it
                            materialsFromMTLFile.materials[n].dispose();
                        }
                        else {
                            //Apply the material to the BABYLON.Mesh
                            babylonMeshesArray[_index].material = materialsFromMTLFile.materials[n];
                        }
                    }
                });
            }
            //Return an array with all BABYLON.Mesh
            return babylonMeshesArray;
        };
        return OBJFileLoader;
    })();
    BABYLON.OBJFileLoader = OBJFileLoader;
    //Add this loader into the register plugin
    BABYLON.SceneLoader.RegisterPlugin(new OBJFileLoader());
})(BABYLON || (BABYLON = {}));