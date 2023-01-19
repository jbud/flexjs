const BARO_SEA = 1013; // 29.92 inhg

let a20n = {
  isaInc: 15,
  vrisa: 142,
  towt1isa: 50000,
  towt2isa: 75000,
  towt3isa: 85000,
  todist1: 1000,
  todist2: 1690,
  todist3: 2300,
  todist1isa: 1050,
  todist2isa: 1750,
  todist3isa: 2390,
  toaltAdj: 100,
  tmaxflex: 60,
  trefaice: 30,
  engThrust: 10031,
  f1: 10,
  f2: 1e-7,
  f3: -5,
  to2k: 1770,
  to4k: 1920,
  to6k: 2050,
  to8k: 2330
};

let a339 = {
    isaInc: 15,
    vrisa: 150,
    towt1isa: 170000,
    towt2isa: 200000,
    towt3isa: 230000,
    todist1: 1680,
    todist2: 1860,
    todist3: 2310,
    todist1isa: 1770,
    todist2isa: 1960,
    todist3isa: 2420,
    toaltAdj: 100,
    tmaxflex: 60,
    trefaice: 30,
    engThrust: 10032,
    f1: 10,
    f2: 1e-7,
    f3: -5,
    to2k: 1950,
    to4k: 2095,
    to6k: 2300,
    to8k: 2900
}

let currentAircraft = a20n;

let flex = 0;
let error = "";
let availRunway = 2995;
let requiredRunway = 0;
let windHeading = 170;
let windKts = 6;
let tow = 64000;
let isKG = true;
let isHP = true;
let isMeters = true;
let baro = 1022;
let oat = 11;
let flaps = 0;
let runwayHeading = 10;
let runwayAltitude = 31;
let antiIce = true;
let packs = false;


let v1offsele0; // "VR"

// do I still need to do this?
let flapWindAIPackCorrection = 112; // estimate initial value

function parseQNH(qnh,ishpa = true) {
  
  // workaround to allow decimal or not
  if((qnh - Math.floor(qnh)) !== 0)
    qnh *= 100;
  
  if (!ishpa){
    qnh /= 2.95360316; // convert inHg to hectopascels
  }
  return qnh;
}

function parseWeight(w, iskg = true) {
  let r = w;
  if (!iskg) {
    r = w / 2.20462262;
  }
  return r;
}

function parseDist(d, ism = true) {
  let r = d;
  if (!ism) {
    r = d / 3.2808399;
  }
  return r;
}

function calculateDensityCorrection(density, AltCorrectionsTable, perfDistDiffTable) {
    let densityCorrection;

    for (let i=0; i<AltCorrectionsTable; i++){
        densityCorrection += ((density > AltCorrectionsTable[i]) ? perfDistDiffTable[i] : (density / 200) * (perfDistDiffTable[i] / 100))
    }
    densityCorrection += ((density < AltCorrectionsTable[3]) ? 0 : ((density - AltCorrectionsTable[3]) / 200) * (perfDistDiffTable[4] / 100));

    return (densityCorrection >= 0) ? densityCorrection : 0;
}

function calculateFlexDist(){
  
  let density = calculateDensityAlt();
  
  let towt1isa = currentAircraft.towt1isa;
  let towt2isa = currentAircraft.towt2isa;
  let towt3isa = currentAircraft.towt3isa;
  
  let TREF = currentAircraft.trefaice + (runwayAltitude / 1000 * 2);
  let ISA = calculateISA();
  let minFlex = (TREF > oat) ? Math.floor(TREF) : oat + 1;
  let maxFlex = currentAircraft.tmaxflex + oat - ISA;
  let ISAZero = 0 + oat - ISA;
  let ISAPlus = currentAircraft.isaInc + oat - ISA;
  let ISAPlus1 = ISAPlus + 1;
  let headwind = cos(radians(windHeading-(runwayHeading * 10))) * windKts;
  
  let flexTrendModifierTable = [
    oat,
    ISAZero,
    ISAPlus,
    ISAPlus1,
    minFlex,
    33,
    maxFlex,
    oat
  ];
  let AltCorrectionsTable = [
    2000,
    4000,
    6000,
    8000,
    10000
  ];
  
  let perfDistDiffTable = [
    currentAircraft.to2k - currentAircraft.todist2,
    currentAircraft.to4k - currentAircraft.to2k,
    currentAircraft.to6k - currentAircraft.to4k,
    currentAircraft.to8k - currentAircraft.to6k,
    (currentAircraft.to8k - currentAircraft.to6k) * 1.53
  ];

  let densityCorrection = calculateDensityCorrection(density, AltCorrectionsTable, perfDistDiffTable);
  
  let perfWeight = parseWeight(tow, isKG);

  let distanceByDensityBelowISA = densityCorrection-(densityCorrection-(densityCorrection/100*(perfWeight/(towt2isa / 100 )))) / 100 * currentAircraft.toaltAdj;
  let distanceByDensityAboveISA = distanceByDensityBelowISA; // force for now, we'll revisit
  
  let distanceByDensity = (perfWeight < towt2isa) ? distanceByDensityBelowISA : distanceByDensityAboveISA;
  
  // ARE YOU ON CRACK? 
  let seedModifier1 = (((perfWeight < towt2isa) ? (currentAircraft.todist2 - currentAircraft.todist1) / (towt2isa - towt1isa) * 
    (perfWeight-towt1isa) : (currentAircraft.todist2 - currentAircraft.todist1) / (towt2isa - towt1isa) * (towt2isa-towt1isa)) +
    ((perfWeight < towt2isa) ? 0 : (perfWeight<towt3isa) ? (currentAircraft.todist3 - currentAircraft.todist2) / (towt3isa - towt2isa) * 
    (perfWeight - towt2isa) : (currentAircraft.todist3 - currentAircraft.todist2) / (towt3isa - towt2isa) * (towt3isa-towt2isa)) +
    ((perfWeight < towt3isa) ? 0 : ((currentAircraft.todist3 - currentAircraft.todist2) / (towt3isa - towt2isa) * 1.5) * (perfWeight-towt3isa))) + 
    currentAircraft.todist1;
  
  let seedModifier2 = (((perfWeight<towt2isa) ? (currentAircraft.todist2isa - currentAircraft.todist1isa) / (towt2isa-towt1isa) * 
    (perfWeight - towt1isa) : (currentAircraft.todist2isa - currentAircraft.todist1isa) / (towt2isa-towt1isa) * (towt2isa - towt1isa)) + 
    ((perfWeight < towt2isa) ? 0 : (perfWeight<towt3isa) ? (currentAircraft.todist3isa - currentAircraft.todist2isa) / (towt3isa - towt2isa) * 
    (perfWeight - towt2isa) : (currentAircraft.todist3isa - currentAircraft.todist2isa) / (towt3isa - towt2isa) * (towt3isa-towt2isa)) +
    ((perfWeight < towt3isa) ? 0 : ((currentAircraft.todist3isa - currentAircraft.todist2isa) / (towt3isa - towt2isa) * 1.5) * (perfWeight-towt3isa))) + 
    currentAircraft.todist1isa;

  
  let growthSeed = [
    seedModifier1 + distanceByDensity, 
    seedModifier2 + distanceByDensity
  ];

  
  let growthTrend = growth(growthSeed, [flexTrendModifierTable[1], flexTrendModifierTable[2]], flexTrendModifierTable);

  let trendBase = [
    growthTrend[0], 
    growthTrend[1], 
    growthTrend[2], 
    Math.pow(growthTrend[3],(currentAircraft.engThrust/10000))
]; 
  
  let trendWithModifiers = trend(
    [
      trendBase[2],
      trendBase[3] 
    ], 
    [
      flexTrendModifierTable[2],
      flexTrendModifierTable[3] 
    ], 
    [
      flexTrendModifierTable[2],
      flexTrendModifierTable[3],
      flexTrendModifierTable[4],
      flexTrendModifierTable[5],
      flexTrendModifierTable[6],
      flexTrendModifierTable[7]
    ]
  );
 
  let isaCorrection = (ISA > currentAircraft.isaInc) ? trendWithModifiers[5] : growthTrend[0]; 
  
  let flapCorr = isaCorrection + (isaCorrection/100) * calculateFlapEffect();
  
  let windLen = (headwind > 0) ? 
    (flapCorr - ((flapCorr / 100) * (headwind / (currentAircraft.vrisa / 100))) / 2) : 
    flapCorr - ((flapCorr / 100)*(headwind / (currentAircraft.vrisa / 150)));
  
  let totDist = windLen;
  totDist += (antiIce) ? ((windLen /100)*3) : 0;
  totDist += (packs) ? ((windLen /100)*4) : 0;
  
  flapWindAIPackCorrection = totDist / (isaCorrection/100);
  
  // do i need this?
  trendBase[4] = (growthTrend[4]/100*flapWindAIPackCorrection);

  let distanceTrendTablePreFlex = [
    ((trendWithModifiers[0] / 100) * flapWindAIPackCorrection),
    ((trendWithModifiers[1] / 100) * flapWindAIPackCorrection), 
    ((trendWithModifiers[2] / 100) * flapWindAIPackCorrection), 
    ((trendWithModifiers[3] / 100) * flapWindAIPackCorrection), 
    ((trendWithModifiers[4] / 100) * flapWindAIPackCorrection),
    availRunway
  ];
  
  let flexTrendTable = trend(
    [
      flexTrendModifierTable[2], 
      flexTrendModifierTable[3], 
      flexTrendModifierTable[4], 
      flexTrendModifierTable[5],               
      flexTrendModifierTable[6]
    ], 
    [
      distanceTrendTablePreFlex[0],
      distanceTrendTablePreFlex[1],
      distanceTrendTablePreFlex[2],
      distanceTrendTablePreFlex[3],
      distanceTrendTablePreFlex[4]
    ], 
    distanceTrendTablePreFlex
  );
  
  //this will be our final flex number.
  flexTrendTable[6] = (flexTrendTable[5] < flexTrendTable[4]) ? Math.floor(flexTrendTable[5]) : Math.floor(flexTrendTable[4]);
  
  let TakeoffDistanceTrendTable = trend(
    [
        distanceTrendTablePreFlex[2], 
        distanceTrendTablePreFlex[3], 
        distanceTrendTablePreFlex[4]
    ], 
    [
        flexTrendTable[2], 
        flexTrendTable[3], 
        flexTrendTable[4]
    ], 
    [ 
        flexTrendTable[2], 
        flexTrendTable[3], 
        flexTrendTable[4], 
        flexTrendTable[5], 
        flexTrendTable[6] 
    ]
  );
  
  /*
  
  console.log(
    "availRunway " + availRunway + "\n" +
    "windHeading " + windHeading + "\n" +
    "windKts " + windKts + "\n" +
    "tow " + tow + "\n" +
    "baro " + baro + "\n" +
    "oat " + oat + "\n" +
    "flaps " + flaps + "\n" +
    "runwayHeading " + runwayHeading + "\n" +
    "runwayAltitude " + runwayAltitude + "\n" +
    "antiIce " + antiIce + "\n" +
    "packs " + packs + "\n"
  );
  
  
  console.log("Flex to temp "+ flex + "°")
  console.log("Distance of runway used: "+Math.ceil(requiredRunway) + "m")
  console.log("Available runway: " + availRunway+"m");
  
 */
  
  flex = flexTrendTable[6];
  requiredRunway = TakeoffDistanceTrendTable[4];
  
}

function calculateFlapEffect(){
  let fe;
  switch(flaps){
    default:
    case 1: 
      fe = currentAircraft.f1;
      break;
    case 2:
      fe = currentAircraft.f2;
      break;
    case 3:
      fe = currentAircraft.f3;
      break;
  }
  
  return fe;
}

// ported to js from https://stackoverflow.com/questions/7437660/
function trend(known_y, known_x, new_x)
{
    let [m,b] = lsft(known_y, known_x);

    let new_y = [];
    for (let j = 0; j < new_x.length; j++)
    {
        let y = (m * new_x[j]) + b;
        new_y.push(y);
    }

    return new_y;
}

// ported to js from https://stackoverflow.com/questions/7437660/
function lsft(known_y, known_x, offset_x = 0)
{
    if (known_y.length != known_x.length) return false; 
    
    var numPoints = known_y.length;
    var x1=0, y1=0, xy=0, x2=0, J, M, B;
    for (var i = 0; i < numPoints; i++)
    {
        known_x[i] -= offset_x;
        x1 = x1 + known_x[i];
        y1 = y1 + known_y[i];
        xy = xy + known_x[i] * known_y[i];
        x2 = x2 + known_x[i] * known_x[i];
    }

    J = (numPoints * x2) - (x1 * x1);
    if (J != 0.0)
    {
        M = ((numPoints * xy) - (x1 * y1)) / J;
        B = ((y1 * x2) - (x1 * xy)) / J;
    }
    return [M,B];
}

// https://stackoverflow.com/a/14163874
function growth ( known_y, known_x, new_x, use_const ) {
    let tbeta, talpha;
    // default values for optional parameters:
    if ( typeof( known_x ) == 'undefined' ) {
        known_x = [];
        for ( let i = 1; i <= known_y.length; i++ ) known_x.push(i);
    }
    if ( typeof( new_x ) == 'undefined' ) {
        new_x = [];
        for ( let i = 1; i <= known_y.length; i++ ) new_x.push(i);
    }
    if ( typeof( use_const ) == 'undefined' ) use_const = true;
 
    // calculate sums over the data:
    let n = known_y.length;
    let avg_x = 0; let avg_y = 0; let avg_xy = 0; let avg_xx = 0; 
    for ( let i = 0; i < n; i++ ) {
        let x = known_x[i]; let y = Math.log( known_y[i] );
        avg_x += x; avg_y += y; avg_xy += x*y; avg_xx += x*x;
    }
    avg_x /= n; avg_y /= n; avg_xy /= n; avg_xx /= n;
 
    // compute linear regression coefficients:
    if ( use_const ) {
        tbeta = (avg_xy - avg_x*avg_y) / (avg_xx - avg_x*avg_x);
        talpha = avg_y - tbeta*avg_x;
    } else {
        tbeta = avg_xy / avg_xx;
        talpha = 0;
    }
 
    // compute and return result array:
    let new_y = [];
    for ( let i = 0; i < new_x.length; i++ ) {
        new_y.push( Math.exp( talpha + tbeta * new_x[i] ) );
    }
    return new_y;
}

function calculateDensityAlt() {
  return (
    runwayAltitude +
    (BARO_SEA - baro) * 27 +
    (oat - (15 - (runwayAltitude / 1000) * 2)) * 120
  );
}

function calculateISA() {
  return oat - 15 + (runwayAltitude / 1000) * 1.98;
}