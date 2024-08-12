
// play songs
document.addEventListener("DOMContentLoaded", function() {
    var audio = document.getElementById("PongSong");
    audio.play();
  });

  
const btnAudio = new Audio("./songs/button_click.mp3"); 

document.querySelectorAll("#btnAudio").forEach(button => {
  button.addEventListener("click", () => { 
    btnAudio.currentTime = 0; 
    btnAudio.play(); 
  });
});