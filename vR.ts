class vspeeds {

    private takeoff = [
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

    private v1: number = 0; 
    private vR: number = 0; 
    private v2: number = 0;

    public CalculateVSpeeds(availRunway: number, requiredRunway: number, Weight: number, Flaps: number, RunwayAlt: number, ASD = 1621){
        this.v2Speed(Weight, Flaps, RunwayAlt);
        this.vRSpeed();
        this.v1Speed(availRunway, requiredRunway, ASD);
        return {
            v1: this.v1, 
            vr: this.vR, 
            v2: this.v2
        };
    }

    private round5up(x: number) {
        return Math.ceil(x/5)*5;
    }

    private round5down(x: number) {
        return Math.floor(x/5)*5;
    }

    private distfrom5(x: number) {
        return x - this.round5down(x);
    }

    private altcorr(a: number){
        return Math.abs(a * 2e-4);
    }

    private v2Speed(w: number, f: number, a: number) {
        let v2 = this.takeoff[f-1][this.round5down(w)];
        if (w < 55) {
            this.v2 = v2 + this.altcorr(a);
            return;
        }
        const v2diff = (v2) - (this.takeoff[f-1][this.round5up(w)]);
        this.v2 = v2 + Math.ceil((v2diff/5)*this.distfrom5(w)) + this.altcorr(a);
    }

    private vRSpeed() {
        this.vR = this.v2 - 4;
    }

    // assumed ASD @ 1621m (no reversers, @ MTOW, MAX brake, wet runway)
    // TODO: implement ASD calculation.
    private v1Speed(a: number, r: number, asd = 1621) {
        const v1 = ((asd / 2) - (a - r)) / 50;
        return (v1 > 0) ? this.vR - Math.ceil(v1) : this.vR;
    }
}