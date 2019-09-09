// Comandos
        //  L - Liga os farois - OK
        //  B - Buzina - OK
        //  , - Seta para esquerda - OK
        //  . - Seta para direita - OK
    //  espaço - Freio de mão / drift
        // E - ligar carro - OK
        //  A - Marcha pra cima - OK
        //  Z - Marcha pra baixo - OK
        //  Seta esquerda - vira esquerda (Girar roda apenas) - OK
        //  Seta direita - vira direita (Girar roda apenas) - OK
        //  Seta cima - acelera - OK
        //  Seta baixo - freia -  OK

"use strict";
var socket = io.connect('http://localhost:3000');
var canvas = document.getElementById("tela");
var ctx = canvas.getContext("2d");
document.getElementById('tela').setAttribute('width', window.innerWidth)
document.getElementById('tela').setAttribute('height', window.innerHeight)

socket.on('id',(id)=>{
    console.log(id)
    localStorage.setItem('id', id)
})
var arrayVeiculos = [];
socket.on('carroMovido',(gameState)=>{
    for (let player in gameState.players) {
        drawPlayer(gameState.players[player])
      }
})
const drawPlayer = (player) => {
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2)
    // ctx.beginPath();
    
    ctx.fillRect(0, 0, 100,100);
    // ctx.fill();
    // ctx.closePath();
    ctx.restore();
  };
var x = 0, y = 0;
var ang = 0;
var teclas = [];
var farolAceso = false,
direcao = 0,
direcaoRodas = 0,
velocidade = 0,
marcha = 0,
ligado = false,
acelerando = false,
freiando = false,
setaEsquerda = false,
setaEsquerdaCount = 0,
setaDireita = false,
setaDireitaCount = 0,
freioDeMao = false,
escala = 1;
var ligarCarro = new Audio("ligar.mp3");
var buzinar = new Audio("buzinar.mp3");
for(var i = 0; i < 256; i++){
  teclas[i] = false;
}


function desenhar(){
    processaTeclas();
    ctx.clearRect(0,0,canvas.width,canvas.height);
    desenharCarro();
    socket.emit('moverCarro', 
        {'x': x,
         'y':y,
        'direcao':direcao,
        'farolAceso': farolAceso,
        'direcaoRodas': direcaoRodas,
        'velocidade': velocidade,
        'marcha': marcha,
        'ligado': ligado,
        'acelerando': acelerando,
        'freiando': freiando
        }
    );
    desenharPlayers();
    requestAnimationFrame(desenhar); 
}
requestAnimationFrame(desenhar);

function desenharPlayers(){
    console.log('desenhando')
    for (let player in arrayVeiculos.player) {
        // rawPlayer(gameState.players[player])
        console.log(player.x)
        ctx.save();
        ctx.fillRect(player.x,player.y,10,10)
        ctx.restore();
      }
}

function desenharCarro(){
    
    // Define tamanho do carro (7% da tela)
    var largCarro = Math.round(canvas.width*0.04);
    var altCarro = Math.round(canvas.height*0.05);
    // var centroX = 0 - largCarro * .2
    var centroX = 0 - largCarro/2
    var centroY = 0 - altCarro/2
    var velocidadeFinal = velocidade*marcha*20;
    if(acelerando && marcha > 0){
        velocidade = velocidade + .001;
    }else if(acelerando && marcha < 0){
        if(velocidadeFinal < 20){
            velocidade = velocidade + .01;
        }
    }else if(freiando){
        if(velocidade > 0){
            velocidade = velocidade - .01;
        }
    }else{
        if(velocidade > 0){
            velocidade = velocidade - .001;
        }
    }
    if(velocidade < 0){
        velocidade = 0;
    }

    if(velocidade >= 0){
        if(marcha > 0 && velocidadeFinal > 0){
            if(velocidade == 0){
                // velocidade = 1;
                x -= (velocidade * marcha) * Math.cos(Math.PI/180 * direcao);
                y -= (velocidade * marcha) * Math.sin(Math.PI/180 * direcao);       
            }else{
                x -= (velocidade * marcha) * Math.cos(Math.PI/180 * direcao);
                y -= (velocidade * marcha) * Math.sin(Math.PI/180 * direcao);       
            }
        }else if(marcha < 0 && ligado){

            if(velocidade == 0){
                // velocidade =1;
                x += (velocidade * marcha) * Math.cos(Math.PI/180 * (-direcao ) );
                y += (velocidade * marcha) * Math.sin(Math.PI/180 * (-direcao) );    
            }else{
                x += (velocidade * -marcha) * Math.cos(Math.PI/180 * (-direcao ) );
                y += (velocidade * -marcha) * Math.sin(Math.PI/180 * (-direcao) );    
            }
        }

    }
    ctx.save();
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff"
    ctx.fillText('Velocidade: '+(velocidade*marcha*20), 10,16)
    ctx.fillText('Marcha: '+marcha, 10,32)
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.translate(canvas.width/2 - largCarro/2, canvas.height/2 - altCarro/2);
    ctx.scale(escala,escala);
    if(marcha >= 0){
        if(freioDeMao){
            // direcao = direcao*2
            ctx.rotate(Math.PI/180 * (direcao + (direcaoRodas*1.3)));
        }else{
            ctx.rotate(Math.PI/180 * direcao);
        }
    }
    else if(marcha < 0){
        console.log(direcao)
        if(direcao < 0){
            direcao + 180
        }else{
            direcao - 180
        }
        ctx.rotate(Math.PI/180 * (direcao));
    }else{
        ctx.rotate(Math.PI/180 * direcao);
    }
    
    // ctx.save();
    ctx.fillStyle = '#118032'
    ctx.fillRect(centroX,centroY,largCarro,altCarro)
    // console.log(x)
    // Rodas traseiras
    ctx.fillStyle = '#000'
    ctx.fillRect(centroX + largCarro * 0.75 - (largCarro * .12 /2),centroY + altCarro - .5, largCarro * .2,altCarro * 0.1)
    ctx.fillRect(centroX + largCarro * 0.75 - (largCarro * .12 /2),centroY - altCarro*.1 + .5, largCarro * .2,altCarro * 0.1)
    // Paralamas traseiros
    ctx.fillStyle = "#405728"
    ctx.fillRect(centroX + largCarro * .82 - (largCarro * .3 / 2),centroY + ((altCarro * .1) /2) * -1, largCarro* .3, altCarro * .4)
    ctx.fillRect(centroX + largCarro * .82 - (largCarro * .3 / 2),centroY + altCarro - (altCarro * .35)   , largCarro* .3, altCarro * .4)
    // capota traseira
    ctx.fillStyle = '#223013'
    var largCapota = largCarro * .45;
    ctx.fillRect(centroX + largCarro*0.55,centroY, largCapota ,altCarro)
    // janela capota
    ctx.fillStyle = "#171717"
    ctx.fillRect(centroX + largCarro*0.62, centroY +1,  largCapota * .25,altCarro * 0.1)
    ctx.fillRect(centroX + largCarro*0.82, centroY + 1, largCapota * .25,altCarro * 0.1)
    ctx.fillRect(centroX +largCarro*0.62,centroY + altCarro - altCarro * 0.1 -1 , largCapota * .25,altCarro * 0.1)
    ctx.fillRect(centroX +largCarro*0.82,centroY + altCarro - altCarro * 0.1 -1, largCapota * .25,altCarro * 0.1)
    // step traseiro
    ctx.fillStyle = '#000'
    ctx.fillRect(centroX +largCarro - (largCapota * .07 /2), centroY +altCarro / 2 - (altCarro * .3 / 2), largCapota * .15,altCarro * 0.3)
    // Rodas dianteiras
    ctx.font = "30px Arial";
    // ctx.fillText(direcaoRodas,10,10 )
        if(teclas[37]){
            //  rodas virando esquerda
            if(direcaoRodas > 0 && direcaoRodas <= 44){
                direcaoRodas--
            }else if(direcaoRodas <= 0 && direcaoRodas > -44){
                direcaoRodas--
            }
            ctx.save()
            ctx.translate(centroX + largCarro * 0.2,centroY + altCarro - 1)
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect(0 - largCarro *.2 /2, 2 - altCarro * .1 / 2 , largCarro * .2,altCarro * 0.1)
            ctx.restore();
            ctx.save();
            ctx.translate(centroX +largCarro * 0.2,centroY )
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect(0 - largCarro * .2 /2, -2 - altCarro * .1 /2, largCarro * .2,altCarro * 0.1)
            ctx.restore();
        }else if(teclas[39]){
            // rodas virando direita
            if(direcaoRodas >= 0 && direcaoRodas < 44){
                direcaoRodas++
            }else if(direcaoRodas < 0 && direcaoRodas >= -44){
                direcaoRodas++
            }
            ctx.save()
            ctx.translate(centroX +largCarro * 0.2, centroY +altCarro - 1)
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect(0 - largCarro *.2 /2, 2 - altCarro * .1 / 2 , largCarro * .2,altCarro * 0.1)
            ctx.restore();
            ctx.save();
            ctx.translate(centroX +largCarro * 0.2,centroY )
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect(0 - largCarro * .2 /2, -1 - altCarro * .1 /2, largCarro * .2,altCarro * 0.1)
            ctx.restore();
        }else{
            // rodas Retas
            if(teclas[38] || teclas[40]){
                if(direcaoRodas > 0 && direcaoRodas <= 44){
                    direcaoRodas--
                }else if(direcaoRodas < 0 && direcaoRodas >= -44){
                    direcaoRodas++
                }
            }
            ctx.save()
            ctx.translate(centroX + largCarro * 0.2,centroY + altCarro - 1)
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect(- largCarro *.2 /2, 2 - altCarro * .1 / 2 , largCarro * .2,altCarro * 0.1)
            ctx.restore();
            ctx.save();
            ctx.translate(centroX + largCarro * 0.2,centroY )
            ctx.rotate(direcaoRodas * Math.PI / 180)
            ctx.fillRect( -largCarro * .2 /2,  -1 - altCarro * .1 /2, largCarro * .2,altCarro * 0.1)
            ctx.restore();
        }
    // Paralamas dianteiros
    ctx.beginPath()
    ctx.fillStyle = "#405728"
    ctx.fillRect( centroX +largCarro * .02,  centroY +((altCarro * .1) /2) * -1, largCarro* .4, altCarro * .4)
    ctx.fillRect( centroX +largCarro * .02,  centroY +altCarro - (altCarro * .35)   , largCarro* .4, altCarro * .4)
    ctx.stroke();
    ctx.closePath();
    // Parachoque
    ctx.fillStyle = "#171717"
    ctx.fillRect( centroX -largCarro * .03, centroY +(altCarro * 0.025) , (largCarro * .08),  altCarro * 0.95 )
    // capô
    ctx.fillStyle = "#405728";
    ctx.strokeStyle = "#202e11";
    ctx.beginPath();
    ctx.lineTo( centroX +largCarro * .55, centroY)
    ctx.lineTo(centroX +largCarro * .02, centroY + altCarro * .3)
    ctx.lineTo(centroX +largCarro * .02, centroY +altCarro * .7)
    ctx.lineTo(centroX +largCarro * .55, centroY + altCarro )
    ctx.fill()
    ctx.stroke()
    ctx.closePath();
    // Parabrisas
    ctx.fillStyle = "#171717"
    ctx.fillRect(centroX +largCarro * 0.45 + (largCarro * .06 / 1.5 ),centroY, largCarro * .09,altCarro )
    ctx.fillStyle = "#000"
    ctx.fillRect(centroX +largCarro * 0.45 + (largCarro * .07 / 1.5 ),centroY + altCarro * .07, largCarro * .07,altCarro * 0.4)
    ctx.fillRect(centroX +largCarro * 0.45 + (largCarro * .07 / 1.5 ),centroY + altCarro / 2 * 1.07, largCarro * .07,altCarro * 0.4)
    // Farois Dianteiros
    ctx.fillStyle = "#636363";
    ctx.fillRect( centroX +(largCarro * .03), centroY + altCarro * .03, largCarro *.03,altCarro * .17)
    ctx.fillRect( centroX +(largCarro * .03),  centroY + altCarro - (altCarro * .03 + (altCarro * .17)) , largCarro *.03,altCarro * .17)
    // Create gradient
    var grd = ctx.createLinearGradient(0 , 0, largCarro, 0 );
    grd.addColorStop(0, "#ffffffe0");
    grd.addColorStop(1, "#ffffff40");
    ctx.fillStyle = grd;
    if(farolAceso){
        // Farois dianteiros direito aceso
        ctx.beginPath();
        ctx.lineTo( centroX + (largCarro * .03),  centroY + altCarro * 0.03 + (altCarro * .17 /2))
        ctx.lineTo( - (largCarro *1), centroY - altCarro * 0.4 + (altCarro * .17 /2))
        ctx.lineTo( - (largCarro *1), centroY + altCarro * 0.4 + (altCarro * .17 /2))
        ctx.fill();
        ctx.closePath();
        // Farois dianteiro esquerdo aceso
        ctx.beginPath();
        ctx.lineTo(centroX + (largCarro * .03), centroY + altCarro - (altCarro * .03 + (altCarro * .17)) + (altCarro * .17 /2))
        ctx.lineTo(- (largCarro * 1 ),centroY +  altCarro -  altCarro * .6 + (altCarro * .17 / 2) )
        ctx.lineTo(- (largCarro * 1 ), centroY + altCarro + (altCarro * .3 ) )
        ctx.fill();
        ctx.closePath();
    }
    // Setas dianteira
    if(setaEsquerda){
        setaEsquerdaCount++
        if(setaEsquerdaCount < 20){
            ctx.fillStyle = "yellow";
            ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.98 - (altCarro * .1), largCarro* .05, altCarro * .07)
        }else if(setaEsquerdaCount == 40 ){
            setaEsquerdaCount = 0
            ctx.fillStyle = "#636363";
            ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.98 - (altCarro * .1), largCarro* .05, altCarro * .07)
        }
        ctx.fillStyle = "#636363";
        ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.02, largCarro* .05, altCarro * .07)
    }else if(setaDireita){
        setaDireitaCount++
        if(setaDireitaCount < 20){
            ctx.fillStyle = "yellow";
            ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.02, largCarro* .05, altCarro * .07)
        }else if(setaDireitaCount == 40 ){
            setaDireitaCount = 0
            ctx.fillStyle = "#636363";
            ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.02, largCarro* .05, altCarro * .07)
        }
        ctx.fillStyle = "#636363";
        ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.98 - (altCarro * .1), largCarro* .05, altCarro * .07)
    }else{
        ctx.fillStyle = "#636363";
        ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.02, largCarro* .05, altCarro * .07)
        ctx.fillRect(centroX + largCarro * .17,centroY + altCarro*.98 - (altCarro * .1), largCarro* .05, altCarro * .07)
    }

    // Farois Traseiros
    if(freiando){
        ctx.fillStyle = "red";
    }else{
        ctx.fillStyle = "#ff9e9e";
    }
    ctx.fillRect(centroX + (largCarro * 1),centroY +altCarro * .04, largCarro *.02,altCarro * .17)
    ctx.fillRect(centroX + (largCarro * 1),centroY + altCarro - (altCarro * .04 + (altCarro * .17)) , largCarro *.02,altCarro * .17)
    if(marcha == -1){
        ctx.fillStyle = "#fff";
        ctx.fillRect(centroX + (largCarro * 1),centroY +altCarro * .04, largCarro *.02,altCarro * .17/2)
        ctx.fillRect(centroX + (largCarro * 1),centroY + altCarro - (altCarro * .04 + (altCarro * .17/2)) , largCarro *.02,altCarro * .17/2)
    }
    

    ctx.restore();
}

function desenharCruz(){
    ctx.strokeStyle = '#fff';
    ctx.beginPath()
    ctx.lineTo(-50,0)
    ctx.lineTo(50,0)
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath()
    ctx.lineTo(0,-50)
    ctx.lineTo(0,50)
    ctx.stroke();
    ctx.closePath()
    ctx.save();
    ctx.rotate((direcaoRodas + 90) * Math.PI /180)
    ctx.beginPath()
    ctx.lineTo(0,-100)
    ctx.lineTo(0,100)
    ctx.stroke();
    ctx.closePath()
    ctx.restore();
}

document.onkeydown = function (evt){
  teclas[evt.keyCode] = true;
  if(evt.keyCode == 76){
    if(farolAceso){
        farolAceso = false
    }else{
        farolAceso = true
    }
  }
  if(evt.keyCode == 65){
      if(marcha < 5){
            marcha++
      }
  }
  if(evt.keyCode == 90){
      if(marcha > -1){
        //   console.log(velocidadeFinal)
          if(marcha-1 == -1 && velocidade*marcha*20 == 0){
            velocidade = 0;  
            marcha--

          }else if(marcha -1 >= 0){
              marcha--
          }
      }
  }
  if(evt.keyCode == 69){
    if(ligado){
        ligado = !ligado

    }  else{
        ligarCarro.play()
        setTimeout(() => {
            ligarCarro.pause();
            ligado = !ligado;
        }, 4000);
    }
  }
  if(evt.keyCode == 72){
      buzinar.play()
  }
  if(evt.keyCode == 188){
      setaDireita = false;
      setaEsquerda = !setaEsquerda;
  }
  if(evt.keyCode == 190){
      setaEsquerda = false;
      setaDireita = !setaDireita;
  }
}

document.onkeyup = function (evt){
  teclas[evt.keyCode] = false;
}

function processaTeclas() {
    if(teclas[37]){
        if(acelerando || freiando || velocidade !== 0){
            var multiplicadorDirecao = velocidade * 2;
            if(multiplicadorDirecao > 1){
                multiplicadorDirecao = 1;
            }
            if(freioDeMao){
                direcao = direcao + (direcaoRodas*1.5)
                direcaoRodas = direcaoRodas *.5;
            }else{
                direcao = direcao + (direcaoRodas * multiplicadorDirecao)
                direcaoRodas = direcaoRodas *.5;
            }
        }
    }
    if(teclas[39]){
        if(acelerando || freiando    || velocidade !== 0){
            var multiplicadorDirecao = velocidade * 2;
            if(multiplicadorDirecao > 1){
                multiplicadorDirecao = 1;
            }
            direcao = direcao + (direcaoRodas * multiplicadorDirecao)
            direcaoRodas = direcaoRodas *.5;
            
        }
    }
    //   Seta Cima
    if(teclas[38]){
       acelerando = true;
    }else{
        acelerando = false
    }
    //   Seta Baixo
    if(teclas[40]){
        freiando = true;
    }else{
        freiando = false;
    }
    // espaco (freio de mão/ drift)
    if(teclas[32]){
        freioDeMao = true;
    }else{
        freioDeMao = false;
    }

    // zoom in
    if(teclas[107]){
        escala = escala + 0.1
    }
    if(teclas[109]){
        escala = escala - 0.1
    }
}


