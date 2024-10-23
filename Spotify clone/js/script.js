console.log("Let write JavaScript")
let currSong = new Audio();
let songs; // for storing array of songs
let currFolder; 

//converting seconds to min:sec format
function convertSecondsToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(seconds); // Ensure total seconds is an integer
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

//Getting the songs from the folder 
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/JavaScript/Spotify%20clone/${folder}`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    // console.log(as)

    //Insert song names in the songs array
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    //show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    
    //blank songlist for new song list
    songUl.innerHTML = ""

    //add songs to the playlist
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> 
        
                <img class="invert" src="svgs/music.svg" alt="">
                <div class="songinfo">${song.replaceAll("%20", " ")} </div>
                <div class="playnow">
                    <img class="invert" src="svgs/play.svg" alt="">
                    <span>play</span>
                </div>
        </li>`;
    }

    //attach an event listner to each song to show songname and play the song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".songinfo").innerHTML)
            playMusic(e.querySelector(".songinfo").innerHTML.trim())
        })
    })
}

const playMusic = (track) => {

    currSong.src = `/JavaScript/Spotify%20clone/${currFolder}/` + track
    currSong.play()
    play.src = "svgs/pause.svg"
    document.querySelector(".songname").innerHTML = track.replaceAll("%20", " ")
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

//display all albums
async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/JavaScript/Spotify%20clone/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    // Array.from(anchors).forEach(async e=>{ 
        // This is not working when we clicked on card because it is working asynchronously
        // we want it to work one by one
        // that's why I am using std for loop 
     
    let array = Array.from(anchors)  
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
    
        //for to not access .htaccess folder as songs
        if(e.href.includes("songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]

            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/JavaScript/Spotify%20clone/songs/${folder}/info.json`)
            let response = await a.json()
            
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">

                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50"
                                fill="none">
                                <circle cx="12" cy="12" r="12" fill="#1ed760" />
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="black" />
                            </svg>

                        </div>

                        <img src="songs/${folder}/cover.jpg" alt="">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            console.log("Playlist: " + item.currentTarget.dataset.folder)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            //.target works wherever you will click and currentTarget works on which class you are using as event listner
            playMusic(songs[0])
         
        })
    })
}

async function main() {

    songs = await getSongs("songs/Marathi")

    //display all the albums
    displayAlbums()

    //attach an event listner to each song for play/pause
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currSong.pause()
            play.src = "svgs/play.svg"
        }
    })

    //attch an event listner to update time and duration
    currSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinSec(currSong.currentTime)}/${convertSecondsToMinSec(currSong.duration)}`

        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%"

    })

    //attach an event listner to seekbar to move the circle

    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currSong.currentTime = (currSong.duration * percent) / 100
        //            100    =           (200     *     50%) / 100
    })

    //attach an event listner to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    //attach an event listner to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-138" + "%";
    })

    //attch an event listner to previous button
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index-1) >= 0) {
            playMusic(songs[index-1])
        }
    })

    //attch an event listner to next button
    next.addEventListener("click", () => {

        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index+1])
        }
    })
    
    //attach an event listner to volume/range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e=>{
        console.log("Volume: " + e.target.value)
        console.log(parseInt(e.target.value)/100)
        currSong.volume = parseInt(e.target.value)/100 // because the song volume is in range between 0 to 1.
        if(currSong.volume > 0){
            document.querySelector(".vol>img").src = document.querySelector(".vol>img").src.replace("mute.svg", "volume.svg")
        }
    })
    
    //add an event listner to volume for mute 
    document.querySelector(".vol>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    
}
main()
