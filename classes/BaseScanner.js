class BaseScanner{
    constructor(){
        this.results = {};
        this.score = 0;
    }

    reset(){
        this.results = {};
        this.score = 0;
    }

    getScore(){
        return this.score;
    }
}

module.exports = {BaseScanner}