const takeoff = [
    {
        40: 126,
        45: 126,
        50: 126,
        55: 128,
        60: 131,
        65: 136,
        70: 141,
        75: 146,
        80: 151,
        85: 155,
    }, // Conf 1 + F
    {
        40: 126,
        45: 126,
        50: 126,
        55: 126,
        60: 128,
        65: 131,
        70: 136,
        75: 141,
        80: 146,
        85: 151,
    }, // Conf 2
    {
        40: 125,
        45: 125,
        50: 125,
        55: 125,
        60: 125,
        65: 128,
        70: 132,
        75: 136,
        80: 140,
        85: 143,
    } // Conf 3
];

let V1Speed, V2Speed, VRSpeed;

function CalculateVSpeeds(availRunway, requiredRunway, Weight, Flaps, RunwayAlt, ASD = 1621){
    v2(Weight, Flaps, RunwayAlt);
    vr();
    v1(Weight, Flaps, RunwayAlt, availRunway, requiredRunway, ASD);
    return {
        v1: V1Speed, 
        vr: VRSpeed, 
        v2: V2Speed,
    };
}

function round5up(x) {
    return Math.ceil(x/5)*5;
}

function round5down(x) {
    return Math.floor(x/5)*5;
}

function distfrom5(x) {
    return x - round5down(x);
}

function f2corr(f, a){
    return (f==2) ? (Math.abs(a * 2e-4)) : 0;
}

function v2(w, f, a) {
    let v2 = takeoff[f-1][round5down(w)];
    if (w < 55) {
        return v2 + f2corr(f,a);
    }
    v2diff = (v2) - (takeoff[f-1][round5up(w)]);
    V2Speed = v2 + Math.ceil((v2diff/5)*distfrom5(w));
    return V2Speed;
}

function vr(w, f, a) {
    VRSpeed = (V2Speed != 0) ? V2Speed - 4 : v2(w, f, a) - 4;
    return VRSpeed;
}

function v1(w,f,a,ra,rr) {
    const v1 = ((asd / 2) - (ra - rr)) / 50;
    let vr = (VRSpeed > 0) ? VRSpeed : vr(w, f, a);
    V1Speed = (v1 > 0) ? vr - Math.ceil(v1) : vr;
    return V1Speed;
}
