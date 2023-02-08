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
let iflaps;
let iairframe;
let icg;
let irwcond;

let iKG,iHP,iM, outf, outd;
let inpoffsetw = 15;

let data = {};

function setup() {
  createCanvas(400, 420);
  let height = 134;
  background(0);
  fill('white');
  textSize(24);
  iheading = createInput("");
  iheading.style("background-color", color("grey"));
  iheading.position(((width - inpSize) / 2) + inpoffsetw, -50 + height / 2);
  iheading.size(inpSize);
  ialtitude = createInput("");
  ialtitude.style("background-color", color("grey"));
  ialtitude.position(((width - inpSize) / 2) + inpoffsetw, -20 + height / 2);
  ialtitude.size(inpSize);
  textSize(12);
  textSize(24);
  ilength = createInput("");
  ilength.style("background-color", color("grey"));
  ilength.position(((width - inpSize) / 2) + inpoffsetw, 10 + height / 2);
  ilength.size(inpSize);
  iwinddir = createInput("");
  iwinddir.style("background-color", color("grey"));
  iwinddir.position(((width - inpSize) / 2) + inpoffsetw, 40 + height / 2);
  iwinddir.size(inpSize);
  iwindspeed = createInput("");
  iwindspeed.style("background-color", color("grey"));
  iwindspeed.position(((width - inpSize + inpSize * 2.9) / 2) + inpoffsetw, 40 + height / 2);
  iwindspeed.size(inpSize/2);
  ioat = createInput("");
  ioat.style("background-color", color("grey"));
  ioat.position(((width - inpSize) / 2) + inpoffsetw, 70 + height / 2);
  ioat.size(inpSize);
  ibaro = createInput("");
  ibaro.style("background-color", color("grey"));
  ibaro.position(((width - inpSize) / 2) + inpoffsetw, 100 + height / 2);
  ibaro.size(inpSize);
  itow = createInput("");
  itow.style("background-color", color("grey"));
  itow.position(((width - inpSize) / 2) + inpoffsetw, 130 + height / 2);
  itow.size(inpSize);
  iantiice = createSelect();
  iantiice.position(((width - inpSize) / 2) + inpoffsetw, 160 + height / 2);
  iantiice.option("ON");
  iantiice.option("OFF");
  
  ipacks = createSelect();
  ipacks.position(((width - inpSize) / 2) + inpoffsetw, 190 + height / 2);
  ipacks.option("OFF");
  ipacks.option("ON");
  
  iflaps = createSelect();
  iflaps.position(((width - inpSize) / 2) + inpoffsetw, 220 + height / 2);
  iflaps.option("1 + F");
  iflaps.option("2");
  iflaps.option("3");
  iflaps.changed(flapsChange);

  icg = createInput("");
  icg.style("background-color", color("grey"));
  icg.position(((width - inpSize) / 2) + inpoffsetw, 250 + height / 2);
  icg.size(inpSize);
  icg.input(cgUpdate)


  irwcond = createSelect();
  irwcond.position(((width - inpSize) / 2) + inpoffsetw, 280 + height / 2);
  irwcond.option("Dry");
  irwcond.option("Wet");
  irwcond.option("Contaminated");
  irwcond.changed(rwcondChange);
  
  iairframe = createSelect();
  iairframe.position((width - inpSize) / 3,  (height + 80)*2 -45);
  iairframe.option("A320-200n");
  iairframe.option("A330-900n");
  
  iKG = createCheckbox('KG', true);
  iKG.position(((width - inpSize+textOffset-50) / 2) + inpoffsetw, 130 + height / 2);
  iHP = createCheckbox('HPA', true);
  iHP.position(((width - inpSize+textOffset-50) / 2) + inpoffsetw, 100 + height / 2);
  iM = createCheckbox('Meters', true);
  iM.position(((width - inpSize+textOffset-50) / 2) + inpoffsetw, 10 + height / 2);
  
  icalculate = createButton("Calculate");
  icalculate.position((width - inpSize +10) / 1.5,  (height + 80)*2 -50);
  icalculate.mousePressed(onUpdate);
  icalculate.class("myButton")
  
  //loadData();
}
function cgUpdate() {
  let cg320 = {
    CGMin: 17,
    CGMax: 40,
    TrimMin: -2.5,
    TrimMax: 3.8
  };
  let cg = icg.value();
  
  let magic1 = (cg320.TrimMin - cg320.TrimMax) / (cg320.CGMax - cg320.CGMin);

  let magic2 = cg320.TrimMax - cg320.CGMin * magic1;

  let CalculatedTrim = magic1 * cg + magic2;
  if (CalculatedTrim < 0) {
    Trim = Math.abs(CalculatedTrim.toFixed(1)) + "DN";
  } else {
    Trim = Math.abs(CalculatedTrim.toFixed(1)) + "UP";
  }
  document.getElementById("ths").innerHTML = Trim;
}

function rwcondChange(){
  if (irwcond.value() == "Contaminated")
    toga = true;
  else 
    toga = false;
}

function flapsChange(){
  switch(iflaps.value()){
    case "1 + F":
      document.getElementById("flaps").innerHTML = 1;
      break;
      default:
      document.getElementById("flaps").innerHTML = iflaps.value();
  }
}
function saveData(data){
  const serializedData = JSON.stringify(data);
  const compressedSerializedData = compressUrlSafe(serializedData);
  window.history.pushState("?"+compressedSerializedData, "", "?"+compressedSerializedData);

}

function loadData(){
  let compressedSerializedData = window.location.search;
  if (!compressedSerializedData) return false;
  if (compressedSerializedData.charAt(0)=="?") {
    compressedSerializedData = compressedSerializedData.substring(1);
    const serializedData = decompressUrlSafe(compressedSerializedData)
    data = JSON.parse(serializedData);
    
    iKG.checked(data.isKG);
    iHP.checked(data.isHP);
    iM.checked(data.isMeters);
    iantiice.value((data.antiIce) ? "ON" : "OFF");
    ipacks.value((data.packs) ? "ON" : "OFF");
    ilength.value(data.availRunway);
    iwinddir.value(data.windHeading);
    iwindspeed.value(data.windKts);
    itow.value(data.tow);
    ibaro.value(data.baro);
    ioat.value(data.oat);
    icg.value(data.icg);
    irwcond.value(data.irwcond);

    let f;
    switch(data.flaps){
      case 2:
        f = "2";
        break;
      case 3:
        f = "3";
        break;
      default:
      case 1:
        f = "1 + F";
    }

    iflaps.selected(f);
    iheading.value(data.runwayHeading);
    ialtitude.value(data.runwayAltitude);

    // TODO: Set values into forms.

    onUpdate();

    //calculateFlexDist();

  } else return false;
}

function onUpdate(){
  
  isKG = iKG.checked();
  isHP = iHP.checked();
  isMeters = iM.checked();
  
  availRunway = (isMeters) ? Number(ilength.value()) : Number(parseDist(ilength.value(),isMeters));
  
  windHeading = Number(iwinddir.value());
  windKts = Number(iwindspeed.value());
  tow = (isKG) ? Number(itow.value()) : Number(parseWeight(itow.value(),isKG));
  baro = (isHP) ? Number(ibaro.value()) : Number(parseQNH(ibaro.value(), isHP));

  oat = Number(ioat.value());
  flaps = 0;
  runwayHeading = Number(iheading.value());
  runwayAltitude = Number(ialtitude.value());
  antiIce = (iantiice.value()=="ON");
  packs = (ipacks.value()=="ON");
  
  switch(iflaps.value()){
    case "2":
      flaps = 2;
      break;
    case "3":
      flaps = 3;
      break;
    default:
    case "1 + F":
      flaps = 1;
  }

  switch(iairframe.value()){
    case "A330-900n":
      currentAircraft = a339;
      break;
    default:
    case "A320-200n":
      currentAircraft = a20n;
  }
  data = {
    "isKG": isKG,
    "isHP": isHP,
    "isMeters": isMeters,
    "availRunway": availRunway,
    "windHeading": windHeading,
    "windKts": windKts,
    "tow": tow,
    "baro": baro,
    "oat": oat,
    "flaps": flaps,
    "runwayHeading": runwayHeading,
    "runwayAltitude": runwayAltitude,
    "antiIce": antiIce,
    "packs": packs,
    "currentAircraft": currentAircraft,
    "icg": icg,
    "irwcond": irwcond,
  };

  //saveData(data);

  isKG = true;
  isHP = true;
  isMeters = true;
  
  calculateFlexDist();
  let vspeeds = CalculateVSpeeds(availRunway, requiredRunway, tow, flaps, runwayAltitude, 1621);
  document.getElementById("v1").innerHTML = vspeeds.v1;
  document.getElementById("v1f").className = "blue";
  document.getElementById("vr").innerHTML = vspeeds.vr;
  document.getElementById("vrf").className = "blue";
  document.getElementById("v2").innerHTML = vspeeds.v2;
  document.getElementById("v2f").className = "blue";
  document.getElementById("flex").innerHTML = flex;
  if (toga){
    document.getElementById("toga").style.visibility ="visible";
  } else {
    document.getElementById("toga").style.visibility ="hidden";
  }
  flapsChange();
}

function draw() {
  let height = 130;
  background(0)
  fill('white');
  textSize(24);
  
  textSize(12);
  text("feet", ((width - inpSize+textOffset-50) / 2) +inpoffsetw, height / 2);
  text("°C", ((width - inpSize+textOffset-50) / 2) + inpoffsetw, 90+height / 2);
  textSize(20);
  text("@",((width - inpSize+textOffset-50) / 2) + inpoffsetw, 60 + height / 2);
  text("Airframe:", (width - inpSize-textOffset) / 2, 325 + height / 2);
  textSize(24);
  text("Winds",(width - inpSize-textOffset) / 2, 60 + height / 2);
  text("RW Heading",(width - inpSize-textOffset) / 2, -30 + height / 2);
  text("Altitude",(width - inpSize-textOffset) / 2, -0 + height / 2);
  text("RW Length",(width - inpSize-textOffset) / 2, 30 + height / 2);
  text("OAT",(width - inpSize-textOffset) / 2, 90 + height / 2);
  text("Baro",(width - inpSize-textOffset) / 2, 120 + height / 2);
  text("Weight",(width - inpSize-textOffset) / 2, 150 + height / 2);
  text("Anti-Ice",(width - inpSize-textOffset) / 2, 180 + height / 2);
  text("Packs",(width - inpSize-textOffset) / 2, 210 + height / 2);
  text("Flaps",(width - inpSize-textOffset) / 2, 240 + height / 2);
  
  text("CG%", (width - inpSize-textOffset) / 2, 270 + height / 2);
  text("RW Cond.", (width - inpSize-textOffset) / 2, 300 + height / 2);
  
}