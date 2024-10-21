// Kun kaikki DOM-elementit on ladattu, suoritetaan alla oleva koodi
document.addEventListener('DOMContentLoaded', () => {
    
    // Haetaan canvas-elementti, jolla peli piirretään
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d'); // Määritetään piirtokonteksti 2D-tilassa

    // Määritetään muut tarvittavat HTML-elementit
    const startButton = document.getElementById('start-button'); // Aloituspainike
    const endScreen = document.getElementById('end-screen'); // Pelin päättymisruutu
    const saveYesButton = document.getElementById('save-yes'); // "Kyllä" tallennusvaihtoehto
    const saveNoButton = document.getElementById('save-no'); // "Ei" tallennusvaihtoehto
    const playAgainButton = document.getElementById('play-again'); // "Pelaa uudelleen" -painike
    const scoreDisplay = document.getElementById('score-display'); // Elementti, johon pisteet näytetään
    const saveScoreDiv = document.getElementById('save-score'); // Div, johon tallennuskenttä ilmestyy
    const submitScoreButton = document.getElementById('submit-score'); // Tuloksen lähetyspainike
    const playerNameInput = document.getElementById('player-name'); // Pelaajan nimen syöttökenttä
    const scoreList = document.getElementById('score-list'); // Hall of Fame -listan elementti

    // Peliruudukon koko määritellään
    const gridSize = 20; // Yhden ruudun koko pikseleinä
    const boardSize = canvas.width / gridSize; // Pelikentän koko ruutuina

    // Matojen ja omenoiden alustus
    let snake1 = [{x: 10, y: 10}]; // Mato 1:n alkusijainti
    let snake2 = [{x: 20, y: 20}]; // Mato 2:n alkusijainti
    let snake1Direction = {x: 0, y: 0}; // Mato 1:n suunta (ei liiku alussa)
    let snake2Direction = {x: 0, y: 0}; // Mato 2:n suunta (ei liiku alussa)
    let apples = []; // Lista omenoiden sijainneista
    let score = 0; // Alkuperäinen pistetilanne
    let gameInterval; // Muuttuja pelisilmukan hallintaan

    // Pelin resetointifunktio, joka asettaa kaiken alkutilaan
    function resetGame() {
        snake1 = [{x: 10, y: 10}]; // Mato 1 palautetaan alkutilaan
        snake2 = [{x: 20, y: 20}]; // Mato 2 palautetaan alkutilaan
        snake1Direction = {x: 0, y: 0}; // Mato 1 ei liiku alussa
        snake2Direction = {x: 0, y: 0}; // Mato 2 ei liiku alussa
        apples = [{x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize)}]; // Luodaan satunnainen omena
        score = 0; // Nollataan pisteet
        clearInterval(gameInterval); // Pysäytetään mahdollinen edellinen pelisykli
        gameInterval = setInterval(gameLoop, 100); // Asetetaan pelisykli 100 millisekunnin välein
    }

    // Funktio, joka piirtää pelikentän ja pelielementit
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Tyhjennetään pelikenttä

        // Piirretään madot
        drawSnake(snake1, 'green'); // Mato 1 (vihreä)
        drawSnake(snake2, 'blue'); // Mato 2 (sininen)

        // Piirretään omenat
        apples.forEach(apple => {
            ctx.fillStyle = 'red'; // Omena on punainen
            ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize); // Piirretään omena ruudukkoon
        });
    }

    // Funktio, joka piirtää madon tietyllä värillä
    function drawSnake(snake, color) {
        ctx.fillStyle = color; // Asetetaan madon väri
        snake.forEach(part => {
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize); // Piirretään madon osat
        });
    }

    // Pelin pääsilmukka, joka päivittää tilan jokaisella syklillä
    function gameLoop() {
        moveSnake(snake1, snake1Direction); // Liikutetaan mato 1
        moveSnake(snake2, snake2Direction); // Liikutetaan mato 2

        // Tarkistetaan, tapahtuiko törmäys matojen välillä tai niiden kanssa
        if (checkCollision(snake1, snake2)) {
            endGame(); // Lopetetaan peli, jos törmäys tapahtui
        }

        // Tarkistetaan, söikö mato omenan
        apples.forEach((apple, index) => {
            if (snake1[0].x === apple.x && snake1[0].y === apple.y) {
                score++; // Lisää pisteitä
                snake1.push({}); // Mato 1 kasvaa
                apples.splice(index, 1); // Poista omena listasta
                generateNewApple(); // Luo uusi omena
            } else if (snake2[0].x === apple.x && snake2[0].y === apple.y) {
                score++; // Lisää pisteitä
                snake2.push({}); // Mato 2 kasvaa
                apples.splice(index, 1); // Poista omena listasta
                generateNewApple(); // Luo uusi omena
            }
        });

        draw(); // Piirretään päivitetty tilanne pelikentälle
    }

    // Funktio, joka liikuttaa matoa tiettyyn suuntaan
    function moveSnake(snake, direction) {
        const newHead = {x: snake[0].x + direction.x, y: snake[0].y + direction.y}; // Lasketaan uuden pään sijainti

        // Jos mato liikkuu kentän ulkopuolelle, se siirtyy vastakkaiselle puolelle
        newHead.x = (newHead.x + boardSize) % boardSize;
        newHead.y = (newHead.y + boardSize) % boardSize;

        snake.unshift(newHead); // Lisätään uusi pää madolle
        snake.pop(); // Poistetaan hännän osa, jotta madon pituus pysyy samana
    }

    // Funktio, joka tarkistaa törmäyksen joko madon itseensä tai toiseen matoon
    function checkCollision(snake1, snake2) {
        // Tarkista, törmääkö snake1 itseensä
        for (let i = 1; i < snake1.length; i++) {
            if (snake1[0].x === snake1[i].x && snake1[0].y === snake1[i].y) {
                return true; // Mato 1 törmää itseensä
            }
        }
        // Tarkista, törmääkö snake2 itseensä
        for (let i = 1; i < snake2.length; i++) {
            if (snake2[0].x === snake2[i].x && snake2[0].y === snake2[i].y) {
                return true; // Mato 2 törmää itseensä
            }
        }
        // Tarkista, törmääkö snake1 toiseen matoon (snake2)
        for (let i = 0; i < snake2.length; i++) {
            if (snake1[0].x === snake2[i].x && snake1[0].y === snake2[i].y) {
                return true; // Mato 1 törmää mato 2:een
            }
        }
        // Tarkista, törmääkö snake2 toiseen matoon (snake1)
        for (let i = 0; i < snake1.length; i++) {
            if (snake2[0].x === snake1[i].x && snake2[0].y === snake1[i].y) {
                return true; // Mato 2 törmää mato 1:een
            }
        }
        return false; // Ei törmäystä
    }
    

    // Funktio, joka päättää pelin
    function endGame() {
        clearInterval(gameInterval); // Lopetetaan pelisykli
        scoreDisplay.textContent = score; // Näytetään pisteet
        endScreen.style.display = 'block'; // Näytetään päätösruutu
    }

    // Funktio, joka luo uuden omenan satunnaiseen sijaintiin
    function generateNewApple() {
        apples.push({
            x: Math.floor(Math.random() * boardSize), // Satunnainen x-sijainti
            y: Math.floor(Math.random() * boardSize)  // Satunnainen y-sijainti
        });
    }

    // "Aloita" -painikkeen toiminnallisuus
    startButton.addEventListener('click', () => {
        document.getElementById('start-screen').style.display = 'none'; // Piilotetaan aloitusruutu
        resetGame(); // Aloitetaan peli alusta
    });

    // Kun pelaaja valitsee tallentaa tuloksen
    saveYesButton.addEventListener('click', () => {
        saveScoreDiv.style.display = 'block'; // Näytetään kenttä pelaajan nimen tallentamiseksi
    });

    // Kun pelaaja ei halua tallentaa tulosta
    saveNoButton.addEventListener('click', () => {
        playAgainButton.style.display = 'block'; // Näytetään "pelaa uudelleen" -painike
    });

    // Kun pelaaja lähettää tallennetun tuloksen
    submitScoreButton.addEventListener('click', () => {
        const playerName = playerNameInput.value; // Haetaan pelaajan syöttämä nimi
        if (playerName) {
            const scoreItem = document.createElement('li'); // Luodaan uusi listaelementti tulokselle
            scoreItem.textContent = `${playerName}: ${score} points`; // Asetetaan pelaajan nimi ja pisteet
            scoreList.appendChild(scoreItem); // Lisätään tulos Hall of Fame -listaan
            playAgainButton.style.display = 'block'; // Näytetään "pelaa uudelleen" -painike
            saveScoreDiv.style.display = 'none'; // Piilotetaan tallennuskenttä
        }
    });

    // "Pelaa uudelleen" -painikkeen toiminnallisuus
    playAgainButton.addEventListener('click', () => {
        endScreen.style.display = 'none'; // Piilotetaan päätösruutu
        resetGame(); // Aloitetaan peli uudelleen
    });

    // Näppäimistön painallusten käsittely matojen liikkumista varten
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'w': // Mato 1 liikkuu ylöspäin
                snake1Direction = {x: 0, y: -1};
                break;
            case 's': // Mato 1 liikkuu alaspäin
                snake1Direction = {x: 0, y: 1};
                break;
            case 'a': // Mato 1 liikkuu vasemmalle
                snake1Direction = {x: -1, y: 0};
                break;
            case 'd': // Mato 1 liikkuu oikealle
                snake1Direction = {x: 1, y: 0};
                break;
            case 'ArrowUp': // Mato 2 liikkuu ylöspäin
                snake2Direction = {x: 0, y: -1};
                break;
            case 'ArrowDown': // Mato 2 liikkuu alaspäin
                snake2Direction = {x: 0, y: 1};
                break;
            case 'ArrowLeft': // Mato 2 liikkuu vasemmalle
                snake2Direction = {x: -1, y: 0};
                break;
            case 'ArrowRight': // Mato 2 liikkuu oikealle
                snake2Direction = {x: 1, y: 0};
                break;
        }
    });
});
