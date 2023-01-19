let inpSize = 100;
let textOffset = 275;

let iheading;
let ialtitude;
let ilength;
let iwinddir;
let iwindspeed;
let ioat;
let ibaro;
let itow;
let iantiice;
let ipacks;
let icalculate;

let iKG,iHP,iM, outf, outd;


function setup() {
  createCanvas(400, 400);
  let height = 180;
  background(0);
  fill('white');
  textSize(24);
  iheading = createInput("");
  iheading.style("background-color", color("grey"));
  iheading.position((width - inpSize) / 2, -50 + height / 2);
  iheading.size(inpSize);
  ialtitude = createInput("");
  ialtitude.style("background-color", color("grey"));
  ialtitude.position((width - inpSize) / 2, -20 + height / 2);
  ialtitude.size(inpSize);
  textSize(12);
  textSize(24);
  ilength = createInput("");
  ilength.style("background-color", color("grey"));
  ilength.position((width - inpSize) / 2, 10 + height / 2);
  ilength.size(inpSize);
  iwinddir = createInput("");
  iwinddir.style("background-color", color("grey"));
  iwinddir.position((width - inpSize) / 2, 40 + height / 2);
  iwinddir.size(inpSize);
  iwindspeed = createInput("");
  iwindspeed.style("background-color", color("grey"));
  iwindspeed.position((width - inpSize + inpSize * 2.9) / 2, 40 + height / 2);
  iwindspeed.size(inpSize/2);
  ioat = createInput("");
  ioat.style("background-color", color("grey"));
  ioat.position((width - inpSize) / 2, 70 + height / 2);
  ioat.size(inpSize);
  ibaro = createInput("");
  ibaro.style("background-color", color("grey"));
  ibaro.position((width - inpSize) / 2, 100 + height / 2);
  ibaro.size(inpSize);
  itow = createInput("");
  itow.style("background-color", color("grey"));
  itow.position((width - inpSize) / 2, 130 + height / 2);
  itow.size(inpSize);
  iantiice = createSelect();
  iantiice.position((width - inpSize) / 2, 160 + height / 2);
  iantiice.option("ON");
  iantiice.option("OFF");
  
  ipacks = createSelect();
  ipacks.position((width - inpSize) / 2, 190 + height / 2);
  ipacks.option("OFF");
  ipacks.option("ON");
  
  iKG = createCheckbox('KG', true);
  iKG.position((width - inpSize+textOffset-50) / 2, 130 + height / 2);
  iHP = createCheckbox('HP', true);
  iHP.position((width - inpSize+textOffset-50) / 2, 100 + height / 2);
  iM = createCheckbox('Meters', true);
  iM.position((width - inpSize+textOffset-50) / 2, 10 + height / 2);
  
  icalculate = createButton("Calculate");
  icalculate.position((width - inpSize) / 2,  height*2+10);
  icalculate.mousePressed(onUpdate);
}
function onUpdate(){
  
  isKG = iKG.value();
  isHP = iHP.value();
  isMeters = iM.value();
  
  availRunway = (isMeters) ? Number(ilength.value()) : Number(parseDist(ilength.value()));
  windHeading = Number(iwinddir.value());
  windKts = Number(iwindspeed.value());
  tow = (isKG) ? Number(itow.value()) : Number(parseWeight(itow.value));

  baro = (isHP) ? Number(ibaro.value()) : Number(parseQNH(ibaro.value()));
  oat = Number(ioat.value());
  flaps = 0;
  runwayHeading = Number(iheading.value());
  runwayAltitude = Number(ialtitude.value());
  antiIce = (iantiice.value()=="ON");
  packs = (ipacks.value()=="ON");

  isKG = true;
  isHP = true;
  isMeters = true;
  
  calculateFlexDist();
  
  
}

function draw() {
  let height = 180;
  background(0)
  fill('white');
  textSize(24);
  
  textSize(12);
  text("feet", (width - inpSize+textOffset-50) / 2, height / 2);
  textSize(20);
  text("@",(width - inpSize+textOffset-50) / 2, 60 + height / 2)
  textSize(24);
  text("Winds",(width - inpSize-textOffset) / 2, 60 + height / 2);
  text("Heading",(width - inpSize-textOffset) / 2, -30 + height / 2);
  text("Altitude",(width - inpSize-textOffset) / 2, -0 + height / 2);
  text("RWLength",(width - inpSize-textOffset) / 2, 30 + height / 2);
  text("OAT",(width - inpSize-textOffset) / 2, 90 + height / 2);
  text("Baro",(width - inpSize-textOffset) / 2, 120 + height / 2);
  text("Weight",(width - inpSize-textOffset) / 2, 150 + height / 2);
  text("Anti-Ice",(width - inpSize-textOffset) / 2, 180 + height / 2);
  text("Packs",(width - inpSize-textOffset) / 2, 210 + height / 2);
  
  let ftext = (flex > 0) ? flex : "";
  let dtext = (requiredRunway>0) ? Math.ceil(requiredRunway) + "m" : "";
  
  text("Flex to temp: " + ftext, (width - inpSize-textOffset) / 2, 240 + height / 2);
  text("Distance Used: " + dtext, (width - inpSize-textOffset) / 2, 270 + height / 2);
}