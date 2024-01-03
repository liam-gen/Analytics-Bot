const JSONdb = require('simple-json-db');

class CacheManager
{
    clearAnalyses(){
        const cache = new JSONdb('cache/analyses.json');
        const data = cache.JSON();
        for (const [key, value] of Object.entries(data)) {
            let v = JSON.parse(value)
            if(dateDiffInDays(new Date(v["date"]), new Date()) >= 2){
                cache.delete(key)
            }
        }
        
    }

    clear(){
        this.clearAnalyses()
    }
}

module.exports = { CacheManager };

function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }