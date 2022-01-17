// imatge treta d'internet google images imagesprite.png bubble shooter en un github que no me acuerdo como se llamaba jeje pero eficiencia de trabajo con menos horas gastadas
// La funcion se llama cuyo la ventana está totalmente cargada
window.onload = function() {
    // Get del canvas y el context 2d
    var canvas = document.getElementById("pagina");
    var context = canvas.getContext("2d");
    alert("Así es como funciona dispara bolas --> se trata de explotar un conjunto de bolas por color en porciones de almenos 3, así hasta que se acaben todas, ir con cuidado si no os dais prisa se van introduciendo más línias de bolas! y tienes poco tiempo para completarlo!");
    // Timing y frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    var iniciado = false;
    
    // nivel
    var nivel = {
        x: 4,           // X posicion
        y: 83,          // Y posicion
        width: 0,       // Width, se calcula
        height: 0,      // Height, se calcula
        columns: 15,    // Numero de columnas
        rows: 14,       // Numero de filas
        tilewidth: 40,  // Anchura visual
        tileheight: 40, // Altura visual
        rowheight: 34,  // Altura linia
        radius: 20,     // Burbuja radio colision ellas
        tiles: []       // Array bi-dimaensional losas
    };

    // Definimos clase tile (losa)
    var Tile = function(x, y, type, shift) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.borradas = false;
        this.shift = shift;
        this.velocity = 0;
        this.alpha = 1;
        this.processed = false;
    };
    
    // jugador (aka amado cliente)
    var jugador = {
        x: 0,
        y: 0,
        angle: 0,
        tiletype: 0,
        bola: {
                    x: 0,
                    y: 0,
                    angle: 0,
                    speed: 600,
                    soltarspeed: 900,
                    tiletype: 0,
                    visible: false
                },
        nextbola: {
                        x: 0,
                        y: 0,
                        tiletype: 0
                    }
    };
    
    // Tabla Desplazamiento al lado
    var neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // fila par tiles
                            [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // fila impar tiles
    
    // Numero de diferentes colores (se puede hasta 7) img sacada de internet
    var bolacolors = 4;
    
    // Estados del canvas
    var gamestates = { init: 0, ready: 1, shootbola: 2, borrarcluster: 3, gameover: 4 };
    var gamestate = gamestates.init;
    // Puntuacion
    var score = 0;
    var turncounter = 0;
    var rowoffset = 0;
    // Variables Animacion info video
    var animationstate = 0;
    var animationtime = 0;
    
    // Clusters info video
    var showcluster = false;
    var cluster = [];
    var floatingclusters = [];
    
    // Imagenes
    var images = [];
    var bolaimage;
    
    // Imagenes cargo variables globales
    var loadcount = 0;
    var loadtotal = 0;
    var preloaded = false;
/*
igual te hago un while
igual te hago un while
*/
/*
    function setCircleDasharray() {
        let fraccioTempsRestant =  calculateTimeFraction();
        const circleDasharray = (fraccioTempsRestant * 283); //Anem modificant la fracció de temps a mesura que ens quedem sense temps.
        document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", (circleDasharray + ' 283')); //Amb l'atribut stroke-dasharray definim el traç de la figura que volem dibuixar.
    }*/
    /*
    function updateRejoj() {
        var tiempoTotal=100;
        document.getElementById('countdown').innerHTML = tiempoTotal;
        for(tiempoTotal=100;tiempoTotal>0;tiempoTotal--){
            //setTimeout("updateReloj()",1000);
            console.log(i);
            document.getElementById('countdown').innerHTML += (101-i);
        }
        if (tiempoTotal == 0) {
            //alert('final');
            gamestate == gamestates.gameover;
        }else{
            tiempoTotal-=1;
            //setTimeout("updateReloj()",1000);
        }
    }*/
    // Imagenes cargadas
    function loadImages(imagefiles) {
        // Iniciamos variables
        loadcount = 0;
        loadtotal = imagefiles.length;
        preloaded = false;
        
        // Cargamos las imagenes
        var loadedimages = [];
        for (var i=0; i<imagefiles.length; i++) {
            // Creamos el objeto imagen
            var image = new Image();
            // Añadimos el cargo evento 
            image.onload = function () {
                loadcount++;
                if (loadcount == loadtotal) {
                    // Carga completada
                    preloaded = true;
                }
            };
            
            // Poner en origen url de la imagen
            image.src = imagefiles[i];
            
            // Guardar la imagen en el array
            loadedimages[i] = image;
        }
        // Devolvemos el array imagenes cargadas
        return loadedimages;
    }
    
    // Iniciamos el canvas
    function init() {
        // imagenes cargadas
        images = loadImages(["bola-sprites.png"]);
        bolaimage = images[0];
    
        // Añadimos los mouse events (IMPORTANTE)
        /*----------------------------------------------------------------------------*/
        /*----------------------------------------------------------------------------*/
        /*---------------*/
        /*---------------*/
        /*---------------*/
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
/*------------------------------------------------------------------------------------------------------------------------------------------------------------------*/
        // Iniciamos el array bidimensional
        for (var i=0; i<nivel.columns; i++) {
            nivel.tiles[i] = [];
            for (var j=0; j<nivel.rows; j++) {
                // Definir un tipo de mosaico y un parámetro de cambio para la animación.
                nivel.tiles[i][j] = new Tile(i, j, 0, 0);
            }
        }
        
        nivel.width = nivel.columns * nivel.tilewidth + nivel.tilewidth/2;
        nivel.height = (nivel.rows-1) * nivel.rowheight + nivel.tileheight;
        
        // Iniciamos el jugador
        jugador.x = nivel.x + nivel.width/2 - nivel.tilewidth/2;
        jugador.y = nivel.y + nivel.height;
        jugador.angle = 90;
        jugador.tiletype = 0;
        
        jugador.nextbola.x = jugador.x - 2 * nivel.tilewidth;
        jugador.nextbola.y = jugador.y;
        
        // Nuevo canvas
        newGame();
        
        // Entar en el canvas (bucle)
        main(0);
    }
    
    // canvas pricipal bucle
    function main(tframe) {
        // Request animation frames
        window.requestAnimationFrame(main);
        
        if (!iniciado) {
            // Preloader
            
            // Limpiar canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Dibujo del marco
            drawFrame();
            
            // Dibuja barra de progreso
            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#ff8080";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#ff8080";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);
            
            // Dibujo progreso del texto 
            var loadtext = "Loaded " + loadcount + "/" + loadtotal + " images";
            context.fillStyle = "#000000";
            context.font = "16px Verdana";
            context.fillText(loadtext, 18, 0.5 + canvas.height - 63);
            
            if (preloaded) {
                // Añadimos delay para mejor demostracion
                /*------------------------------------------------------------------------------------------------*/
                setTimeout(function(){iniciado = true;}, 1000);
            }
        } else {
            // Actualización y Render del canvas
            update(tframe);
            render();
        }
    }
    
    // Actualizar el estado del canvas
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;
        
        // Actualizar contador fps
        updateFps(dt);
        
        if (gamestate == gamestates.ready) {
            // Si el canvas esta preparado para el input del cliente / jugador
        } else if (gamestate == gamestates.shootbola) {
            // bola en movimiento
            stateShootbola(dt);
        } else if (gamestate == gamestates.borrarcluster) {
            // borrar cluster y soltar tiles
            stateborrarCluster(dt);
        }
    }
    
    function setGameState(newgamestate) {
        gamestate = newgamestate;
        animationstate = 0;
        animationtime = 0;
    }
    
    function stateShootbola(dt) {
        // bola en movimiento

        //los videos youtube nunca fallan
        // Movimiento de la bola en la direction del raton
        jugador.bola.x += dt * jugador.bola.speed * Math.cos(degToRad(jugador.bola.angle));
        jugador.bola.y += dt * jugador.bola.speed * -1*Math.sin(degToRad(jugador.bola.angle));
        
        // izquierda y derecha colisiones con el siguiente nivel
        if (jugador.bola.x <= nivel.x) {
            // Borde de la izquierda
            jugador.bola.angle = 180 - jugador.bola.angle;
            jugador.bola.x = nivel.x;
        } else if (jugador.bola.x + nivel.tilewidth >= nivel.x + nivel.width) {
            // Borde de la derecha
            jugador.bola.angle = 180 - jugador.bola.angle;
            jugador.bola.x = nivel.x + nivel.width - nivel.tilewidth;
        }
 
        // Colisiones con el top del nivel
        if (jugador.bola.y <= nivel.y) {
            // Colision del top
            jugador.bola.y = nivel.y;
            snapbola();
            return;
        }
        
        // Colision con otras tiles
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows; j++) {
                var tile = nivel.tiles[i][j];
                
                // Salto vacio de tiles
                if (tile.type < 0) {
                    continue;
                }
                
                // Comprobar si hay intersecciones al momento
                var coord = getTileCoordinate(i, j);
                if (circleIntersection(jugador.bola.x + nivel.tilewidth/2,
                                       jugador.bola.y + nivel.tileheight/2,
                                       nivel.radius,
                                       coord.tilex + nivel.tilewidth/2,
                                       coord.tiley + nivel.tileheight/2,
                                       nivel.radius)) {
                                        
                    // Interseccion con el nivel bola
                    snapbola();
                    return;
                }
            }
        }
    }
    //parte sacada de internet
    function stateborrarCluster(dt) {
        if (animationstate == 0) {
            resetborradas();
            
            // Marcamos las tiles como "prestada"
            //esta parte sacada de internet
            for (var i=0; i<cluster.length; i++) {
                // Set the borradas flag
                cluster[i].borradas = true;
            }
            const cargarSonido = function (fuente) {
                const sonido2 = document.createElement("audio");
                sonido2.src = fuente;
                sonido2.setAttribute("preload", "auto");
                sonido2.setAttribute("controls", "none");
                sonido2.style.display = "none"; // <-- oculto
                document.body.appendChild(sonido2);
                return sonido2;
            };
            /*----------------------------------- */
            /*----------------------------------- */
            const sonido2 = cargarSonido("./burbuja_colision.mp3");
            sonido2.play();
            // Add cluster score
            score += cluster.length * 10;
            // Find floating clusters
            floatingclusters = findFloatingClusters();
            //esta parte sacada de internet
            if (floatingclusters.length > 0) {
                // Configurar animacion soltar
                for (var i=0; i<floatingclusters.length; i++) {
                    for (var j=0; j<floatingclusters[i].length; j++) {
                        var tile = floatingclusters[i][j];
                        tile.shift = 0;
                        tile.shift = 1;
                        tile.velocity = jugador.bola.soltarspeed;
                        //añadir sonido
                        /*----------------------------------- */
                        /*----------------------------------- */
                        const cargarSonido = function (fuente) {
                            const sonido = document.createElement("audio");
                            sonido.src = fuente;
                            sonido.setAttribute("preload", "auto");
                            sonido.setAttribute("controls", "none");
                            sonido.style.display = "none"; // <-- oculto
                            document.body.appendChild(sonido);
                            return sonido;
                        };
                        /*----------------------------------- */
                        /*----------------------------------- */
                        const sonido = cargarSonido("./burbujas.mp3");
                        sonido.play();
                        score += 10;
                        
                    }
                }
            }
            animationstate = 1;
        }
        
        if (animationstate == 1) {
            // Pop bolas losa una a una
            var tilesleft = false;
            for (var i=0; i<cluster.length; i++) {
                var tile = cluster[i];
                
                if (tile.type >= 0) {
                    tilesleft = true;
                    
                    // Alpha animation
                    tile.alpha -= dt * 15;
                    if (tile.alpha < 0) {
                        tile.alpha = 0;
                    }

                    if (tile.alpha == 0) {
                        tile.type = -1;
                        tile.alpha = 1;
                    }
                }                
            }
            
            // soltar bolas
            for (var i=0; i<floatingclusters.length; i++) {
                for (var j=0; j<floatingclusters[i].length; j++) {
                    var tile = floatingclusters[i][j];
                    
                    if (tile.type >= 0) {
                        tilesleft = true;
                        
                        // Accelerate soltarped tiles
                        tile.velocity += dt * 700;
                        tile.shift += dt * tile.velocity;
                            
                        // Alpha animation
                        tile.alpha -= dt * 8;
                        if (tile.alpha < 0) {
                            tile.alpha = 0;
                        }

                        // Check if the bolas are past the bottom of the nivel
                        if (tile.alpha == 0 || (tile.y * nivel.rowheight + tile.shift > (nivel.rows - 1) * nivel.rowheight + nivel.tileheight)) {
                            tile.type = -1;
                            tile.shift = 0;
                            tile.alpha = 1;
                        }
                    }

                }
            }
            
            if (!tilesleft) {
                // Next bola
                nextbola();
                // Check for game over
                var tilefound = false
                for (var i=0; i<nivel.columns; i++) {
                    for (var j=0; j<nivel.rows; j++) {
                        if (nivel.tiles[i][j].type != -1) {
                            tilefound = true;
                            break;
                        }
                    }
                }
                
                if (tilefound) {
                    setGameState(gamestates.ready);
                } else {
                    // No tiles left, game over
                    setGameState(gamestates.gameover);
                }
            }
        }
    }
    
    // Snap bola to the grid
    function snapbola() {
        // Get the grid position
        var centerx = jugador.bola.x + nivel.tilewidth/2;
        var centery = jugador.bola.y + nivel.tileheight/2;
        var gridpos = getGridPosition(centerx, centery);

        // Make sure the grid position is valid
        if (gridpos.x < 0) {
            gridpos.x = 0;
        }
            
        if (gridpos.x >= nivel.columns) {
            gridpos.x = nivel.columns - 1;
        }

        if (gridpos.y < 0) {
            gridpos.y = 0;
        }
            
        if (gridpos.y >= nivel.rows) {
            gridpos.y = nivel.rows - 1;
        }

        // Check if the tile is empty
        var addtile = false;
        if (nivel.tiles[gridpos.x][gridpos.y].type != -1) {
            // Tile is not empty, shift the new tile downwards
            for (var newrow=gridpos.y+1; newrow<nivel.rows; newrow++) {
                if (nivel.tiles[gridpos.x][newrow].type == -1) {
                    gridpos.y = newrow;
                    addtile = true;
                    break;
                }
            }
        } else {
            addtile = true;
        }

        // Add the tile to the grid
        if (addtile) {
            // Hide the jugador bola
            jugador.bola.visible = false;
        
            // Set the tile
            nivel.tiles[gridpos.x][gridpos.y].type = jugador.bola.tiletype;
            
            // Check for game over
            if (checkGameOver()) {
                return;
            }
            
            // Find clusters
            cluster = findCluster(gridpos.x, gridpos.y, true, true, false);
            
            if (cluster.length >= 3) {
                // borrar the cluster
                setGameState(gamestates.borrarcluster);
                return;
            }
        }
        
        // No clusters found
        turncounter++;
        if (turncounter >= 5) {
            // Añadir fila de bolas
            addbolas();
            turncounter = 0;
            rowoffset = (rowoffset + 1) % 2;
            
            if (checkGameOver()) {
                return;
            }
        }

        // Siguiente bola
        nextbola();
        setGameState(gamestates.ready);
    }
    
    function checkGameOver() {
        // Chequear game over
        for (var i=0; i<nivel.columns; i++) {
            // Comprobar si hay bolas en la fila de abajo
            if (nivel.tiles[i][nivel.rows-1].type != -1) {
                // Game over
                nextbola();
                setGameState(gamestates.gameover);
                return true;
            }
        }
        //devolver algo en caso false
        return false;
    }
    
    function addbolas() {
        // Move the rows downwards
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows-1; j++) {
                nivel.tiles[i][nivel.rows-1-j].type = nivel.tiles[i][nivel.rows-1-j-1].type;
            }
        }
        
        // Add a new row of bolas at the top
        for (var i=0; i<nivel.columns; i++) {
            // Add ryom, existing, colors
            nivel.tiles[i][0].type = getExistingColor();
        }
    }
    
    // Find the remaining colors
    function findColors() {
        var foundcolors = [];
        var colortable = [];
        for (var i=0; i<bolacolors; i++) {
            colortable.push(false);
        }
        
        // Comprobar todas tiles
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows; j++) {
                var tile = nivel.tiles[i][j];
                if (tile.type >= 0) {
                    if (!colortable[tile.type]) {
                        colortable[tile.type] = true;
                        foundcolors.push(tile.type);
                    }
                }
            }
        }
        
        return foundcolors;
    }
    
    // Find cluster en la localizacion de losa (tile) especifica  
    function findCluster(tx, ty, matchtype, reset, skipborradas) {
        // Reset the processed flags
        if (reset) {
            resetProcessed();
        }
        
        // Get the target tile. Tile coord must be valid.
        var targettile = nivel.tiles[tx][ty];
        
        // Initialize the toprocess array with the specified tile
        var toprocess = [targettile];
        targettile.processed = true;
        var foundcluster = [];

        while (toprocess.length > 0) {
            // Pop the last element from the array
            var currenttile = toprocess.pop();
            
            // Skip processed y empty tiles
            if (currenttile.type == -1) {
                continue;
            }
            
            // Skip tiles with the borradas flag
            if (skipborradas && currenttile.borradas) {
                continue;
            }
            
            // Check if current tile has the right type, if matchtype is true
            if (!matchtype || (currenttile.type == targettile.type)) {
                // Add current tile to the cluster
                foundcluster.push(currenttile);
                
                // Get the neighbors of the current tile
                var neighbors = getNeighbors(currenttile);
                
                // Check the type of each neighbor
                for (var i=0; i<neighbors.length; i++) {
                    if (!neighbors[i].processed) {
                        // Add the neighbor to the toprocess array
                        toprocess.push(neighbors[i]);
                        neighbors[i].processed = true;
                    }
                }
            }
        }
        
        // Return the found cluster
        return foundcluster;
    }
    
    // Find floating clusters
    function findFloatingClusters() {
        // Reset the processed flags
        resetProcessed();
        
        var foundclusters = [];
        
        // Check all tiles
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows; j++) {
                var tile = nivel.tiles[i][j];
                if (!tile.processed) {
                    // Find all attached tiles
                    var foundcluster = findCluster(i, j, false, false, true);
                    
                    // There must be a tile in the cluster
                    if (foundcluster.length <= 0) {
                        continue;
                    }
                    
                    // Check if the cluster is floating
                    var floating = true;
                    for (var k=0; k<foundcluster.length; k++) {
                        if (foundcluster[k].y == 0) {
                            // Tile is attached to the roof
                            floating = false;
                            break;
                        }
                    }
                    
                    if (floating) {
                        // Found a floating cluster
                        foundclusters.push(foundcluster);
                    }
                }
            }
        }
        
        return foundclusters;
    }
    
    // Reset the processed flags
    function resetProcessed() {
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows; j++) {
                nivel.tiles[i][j].processed = false;
            }
        }
    }
    
    // Reset the borradas flags
    function resetborradas() {
        for (var i=0; i<nivel.columns; i++) {
            for (var j=0; j<nivel.rows; j++) {
                nivel.tiles[i][j].borradas = false;
            }
        }
    }
    
    // Get the neighbors of the specified tile
    function getNeighbors(tile) {
        var tilerow = (tile.y + rowoffset) % 2; // Even or odd row
        var neighbors = [];
        
        // Get the neighbor offsets for the specified tile
        var n = neighborsoffsets[tilerow];
        
        // Get the neighbors
        for (var i=0; i<n.length; i++) {
            // Neighbor coordinate
            var nx = tile.x + n[i][0];
            var ny = tile.y + n[i][1];
            
            // Make sure the tile is valid
            if (nx >= 0 && nx < nivel.columns && ny >= 0 && ny < nivel.rows) {
                neighbors.push(nivel.tiles[nx][ny]);
            }
        }
        
        return neighbors;
    }
    
    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);
            
            // Reset time y framecount
            fpstime = 0;
            framecount = 0;
        }
        
        // Increase time y framecount
        fpstime += dt;
        framecount++;
    }
    
    // Draw text that is centered
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width-textdim.width)/2, y);
    }
    
    // Render the game
    function render() {
        // Draw the frame around the game
        drawFrame();
        
        var yoffset =  nivel.tileheight/2;
        
        // Dibuja nivel background
        context.fillStyle = "#BEA4CC";
        context.fillRect(nivel.x - 4, nivel.y - 4, nivel.width + 8, nivel.height + 4 - yoffset);
        
        // Render losas (tiles)
        rendertiles();
        
        // Dibuja nivel bottom
        context.fillStyle = "#7E3895";
        context.fillRect(nivel.x - 4, nivel.y - 4 + nivel.height + 4 - yoffset, nivel.width + 8, 2*nivel.tileheight + 3);
        
        // Draw score
        context.fillStyle = "#ffffff";
        context.font = "20px Verdana";
        var scorex = nivel.x + nivel.width - 150;
        var scorey = nivel.y+nivel.height + nivel.tileheight - yoffset - 8;
        drawCenterText("Puntuacion:", scorex, scorey, 150);
        context.font = "24px Verdana";
        drawCenterText(score, scorex, scorey+30, 150);
    
        // Render cluster
        if (showcluster) {
            renderCluster(cluster, 255, 128, 128);
            
            for (var i=0; i<floatingclusters.length; i++) {
                var col = Math.floor(100 + 100 * i / floatingclusters.length);
                renderCluster(floatingclusters[i], col, col, col);
            }
        }
        
        
        // Render jugador bola
        renderjugador();
        

        // Game Over overlay
        if (gamestate == gamestates.gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(nivel.x - 4, nivel.y - 4, nivel.width + 8, nivel.height + 2 * nivel.tileheight + 8 - yoffset);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Se acabó!", nivel.x, nivel.y + nivel.height / 2 + 10, nivel.width);
            drawCenterText(score, nivel.x, nivel.y + nivel.height / 2 + 40, nivel.width);
            if (score > 1000){
                drawCenterText("Has hecho muchos puntos! Muy bien!", nivel.x, nivel.y + nivel.height / 2 + 70, nivel.width);
                drawCenterText("La persistencia y el esfuerzo nos hacen mejores", nivel.x, nivel.y + nivel.height / 2 + 100, nivel.width);
            } else{
                drawCenterText("Necesitas practicar una poco más, no te rindas!", nivel.x, nivel.y + nivel.height / 2 + 70, nivel.width);
            }
            insertGameUser();
            drawCenterText("Click para reiniciar",  nivel.x, nivel.y + nivel.height / 2 + 130, nivel.width);
            //canvas acabado
            //añadir lo que sea necesario para salir de aquí
            //añadimos sonido burbuja diferente al de borrar cluster
            const cargarSonido = function (fuente) {
                const sonido2 = document.createElement("audio");
                sonido2.src = fuente;
                sonido2.setAttribute("preload", "auto");
                sonido2.setAttribute("controls", "none");
                sonido2.style.display = "none"; // <-- oculto
                document.body.appendChild(sonido2);
                return sonido2;
            };
            /*----------------------------------- */
            const sonido2 = cargarSonido("./burbuja.mp3");
            //sonido2.play();
            //sonido2.pause();
        }
    }
    
    function insertGameUser() {
            const opciones = {
                method: 'POST',
                body: JSON.stringify({action: 'updateUserGame', score: score})
            }
            fetch('./bd.php', opciones)
            
        }

    // Draw a frame around the game
    function drawFrame() {
        // Draw background
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 79);
        
        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Balls shooter - GADI Games", 10, 37);
        
        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 57);
    }
    
    // Render tiles
    function rendertiles() {
        // Top to bottom
        for (var j=0; j<nivel.rows; j++) {
            for (var i=0; i<nivel.columns; i++) {
                // Get the tile
                var tile = nivel.tiles[i][j];
            
                // Get the shift of the tile for animation
                var shift = tile.shift;
                
                // Calculate the tile coordinates
                var coord = getTileCoordinate(i, j);
                
                // Check if there is a tile present
                if (tile.type >= 0) {
                    // Support transparency
                    context.save();
                    context.globalAlpha = tile.alpha;
                    
                    // Draw the tile using the color
                    drawbola(coord.tilex, coord.tiley + shift, tile.type);
                    
                    context.restore();
                }
            }
        }
    }
    
    // Render cluster
    function renderCluster(cluster, r, g, b) {
        for (var i=0; i<cluster.length; i++) {
            // Calculate the tile coordinates
            var coord = getTileCoordinate(cluster[i].x, cluster[i].y);
            
            // Draw the tile using the color
            context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            context.fillRect(coord.tilex+nivel.tilewidth/4, coord.tiley+nivel.tileheight/4, nivel.tilewidth/2, nivel.tileheight/2);
        }
    }
    
    // Render the jugador bola
    function renderjugador() {
        var centerx = jugador.x + nivel.tilewidth/2;
        var centery = jugador.y + nivel.tileheight/2;
        
        // Draw jugador background circle
        context.fillStyle = "#bea4cc";
        context.beginPath();
        context.arc(centerx, centery, nivel.radius+12, 0, 2*Math.PI, false);
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "#8c8c8c";
        context.stroke();

        // Draw angulo
        context.lineWidth = 2;
        context.strokeStyle = "#0000ff";
        context.beginPath();
        context.moveTo(centerx, centery);
        context.lineTo(centerx + 1.5*nivel.tilewidth * Math.cos(degToRad(jugador.angle)), centery - 1.5*nivel.tileheight * Math.sin(degToRad(jugador.angle)));
        context.stroke();
        
        // Dibuja next bola
        drawbola(jugador.nextbola.x, jugador.nextbola.y, jugador.nextbola.tiletype);
        
        // Dibuja bola visible
        if (jugador.bola.visible) {
            drawbola(jugador.bola.x, jugador.bola.y, jugador.bola.tiletype);
        }
        
    }
    
    // Obtener tile coordinate
    function getTileCoordinate(column, row) {
        var tilex = nivel.x + column * nivel.tilewidth;
        
        // X offset for odd or even rows
        if ((row + rowoffset) % 2) {
            tilex += nivel.tilewidth/2;
        }
        
        var tiley = nivel.y + row * nivel.rowheight;
        return { tilex: tilex, tiley: tiley };
    }
    
    // Obtener posicion en la graella mas cercana
    function getGridPosition(x, y) {
        var gridy = Math.floor((y - nivel.y) / nivel.rowheight);
        // Check for offset
        var xoffset = 0;
        if ((gridy + rowoffset) % 2) {
            xoffset = nivel.tilewidth / 2;
        }
        var gridx = Math.floor(((x - xoffset) - nivel.x) / nivel.tilewidth);
        
        return { x: gridx, y: gridy };
    }

    // Dibujar bola
    function drawbola(x, y, index) {
        if (index < 0 || index >= bolacolors)
            return;
        
        // Dibujar bola sprite
        context.drawImage(bolaimage, index * 40, 0, 40, 40, x, y, nivel.tilewidth, nivel.tileheight);
    }
    
    // Empezar nuevo juego
    // Para intentar hacerlo mejor
    function newGame() {
        // Reset score
        score = 0;
        const cargarSonido = function (fuente) {
            const sonido2 = document.createElement("audio");
            sonido2.src = fuente;
            sonido2.setAttribute("preload", "auto");
            sonido2.setAttribute("controls", "none");
            sonido2.style.display = "none"; // <-- oculto
            document.body.appendChild(sonido2);
            return sonido2;
        };
        const sonido2 = cargarSonido("./burbuja.mp3");
        //sonido2.play();
        sonido2.pause();
        turncounter = 0;
        rowoffset = 0;
        
        // Set the gamestate to ready
        setGameState(gamestates.ready);
        
        // Create the nivel
        createnivel();

        // Init the next bola y set the current bola
        nextbola();
        nextbola();
    }
    
    // Crear random nivel
    function createnivel() {
        // Crear nivel con tiles random
        for (var j=0; j<nivel.rows; j++) {
            var randomtile = ryRange(0, bolacolors-1);
            var count = 0;
            for (var i=0; i<nivel.columns; i++) {
                if (count >= 2) {
                    // Cambiar tile random
                    var newtile = ryRange(0, bolacolors-1);
                    // Asegurarse new tile es diferente a la previa tile
                    if (newtile == randomtile) {
                        newtile = (newtile + 1) % bolacolors;
                    }
                    randomtile = newtile;
                    count = 0;
                }
                count++;
                
                if (j < nivel.rows/2) {
                    nivel.tiles[i][j].type = randomtile;
                } else {
                    nivel.tiles[i][j].type = -1;
                }
            }
            //contador a partir de aqui
            let timeLeft = 180;
        }
        timeLeft = 180;
        let timer = setInterval(function(){
        const minutos = Math.floor(timeLeft / 60);
        const segundos = timeLeft % 60;
        timeLeft -= 1;
        // console.log(minutes + ':' + segundos);
        if(segundos < 10){
            if(minutos < 1){
                document.getElementById("base-timer-label").innerHTML = '0' + minutos + " : " + '0' + segundos;
            }else{
                document.getElementById("base-timer-label").innerHTML = minutos + " : " + '0' + segundos;
            }
            
        }else{
            document.getElementById("base-timer-label").innerHTML = minutos + " : " + segundos;
        }
        if(timeLeft <= 0){
            timeOver = true;
            setGameState(gamestates.gameover);
        }  
        }, 1100);
    }
    
    // Crear random bola para jugador
    function nextbola() {
        // Set bola actual
        jugador.tiletype = jugador.nextbola.tiletype;
        jugador.bola.tiletype = jugador.nextbola.tiletype;
        jugador.bola.x = jugador.x;
        jugador.bola.y = jugador.y;
        jugador.bola.visible = true;
        
        // Obtener tipo random de existing colors
        var nextcolor = getExistingColor();
        
        // Establecer siguiente bola
        jugador.nextbola.tiletype = nextcolor;
    }
    
    // Obtener random existing color
    function getExistingColor() {
        existingcolors = findColors();
        
        var bolatype = 0;
        if (existingcolors.length > 0) {
            bolatype = existingcolors[ryRange(0, existingcolors.length-1)];
        }
        
        return bolatype;
    }
    // Obtener random int entre low y high, inclusivamente
    function ryRange(low, high) {
        return Math.floor(low + Math.random()*(high-low+1));
    }
    
    // Shoot bola
    function shootbola() {
        // Shoot bola en la direccion del mouse
        jugador.bola.x = jugador.x;
        jugador.bola.y = jugador.y;
        jugador.bola.angle = jugador.angle;
        jugador.bola.tiletype = jugador.tiletype;

        // Set gamestate shootbola
        setGameState(gamestates.shootbola);
    }
    
    // Check if los dos circulos interseccionan
    function circleIntersection(x1, y1, r1, x2, y2, r2) {
        // Calcula la distancia entre los centros
        var dx = x1 - x2;
        var dy = y1 - y2;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < r1 + r2) {
            // Circulos interseccionan
            return true;
        }
        
        return false;
    }
    
    // Convertir radios a grados
    function radToDeg(angle) {
        return angle * (180 / Math.PI);
    }
    // Convertir grados a radios
    function degToRad(angle) {
        return angle * (Math.PI / 180);
    }
    // On mouse en movimiento
    function onMouseMove(e) {
        // Obtener mouse position
        var pos = getMousePos(canvas, e);

        // Obtener angulo mouse
        var mouseangle = radToDeg(Math.atan2((jugador.y+nivel.tileheight/2) - pos.y, pos.x - (jugador.x+nivel.tilewidth/2)));

        // Convertir rango de 0 a 360 grados
        if (mouseangle < 0) {
            mouseangle = 180 + (180 + mouseangle);
        }

        // Restrict angulo a 8, 172 grados
        var lbound = 8;
        var ubound = 172;
        if (mouseangle > 90 && mouseangle < 270) {
            // Left
            if (mouseangle > ubound) {
                mouseangle = ubound;
            }
        } else {
            // Right
            if (mouseangle < lbound || mouseangle >= 270) {
                mouseangle = lbound;
            }
        }
        // Establecer angulo jugador
        jugador.angle = mouseangle;
    }

    // On mouse button click
    function onMouseDown(e) {
        // Obtener mouse position
        var pos = getMousePos(canvas, e);
        
        if (gamestate == gamestates.ready) {
            shootbola();
        } else if (gamestate == gamestates.gameover) {
            newGame();
        }
    }
    // Obtener mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }
    
    // Llamamos al init para empezar el juego
    init();
    
};