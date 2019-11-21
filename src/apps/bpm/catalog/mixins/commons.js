export default {

  methods: {

    getNoun: function ( number, nounOneOrNouns, nounTwo, nounFive ) {
      let nounOne = ''
      if (Array.isArray(nounOneOrNouns)) {
        if (nounOneOrNouns[0]) {
          nounOne = nounOneOrNouns[0]
        }
        if (nounOneOrNouns[1]) {
          nounTwo = nounOneOrNouns[1]
        }
        if (nounOneOrNouns[2]) {
          nounFive = nounOneOrNouns[2]
        }
      } else {
        nounOne = nounOneOrNouns
      }

      let n = Math.abs(number);

      n %= 100;
      if (n >= 5 && n <= 20) {
        return nounFive;
      }

      n %= 10;
      if (n === 1) {
        return nounOne;
      }

      if (n >= 2 && n <= 4) {
        return nounTwo;
      }

      return nounFive;
    }, // getNoun

    moment: function () {
      return moment();
    },

    getHumanDateFromSec: function ( sec, format = "D MMMM YYYY, H:mm, dddd" ) {
      return moment( Number( sec ) * 1000 ).format( format )
    },

    serializeObject: function(obj, prefix) {
      var str = [], p;
      for(p in obj) {
        if (obj.hasOwnProperty(p)) {
          var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
          str.push(
            (v !== null && typeof v === "object")
              ? this.serializeObject(v, k)
              : encodeURIComponent(k) + "=" + encodeURIComponent(v)
          );
        }
      }
      return str.join("&");
    },

    getRandomInt: function ( maxVal = 100, minVal = 1 ) {
      return Math.floor( Math.random() * (maxVal - minVal + 1) + minVal )
    },

    getRandomArrayElement: function ( arr, activeFiltersMap = [] ) {
      let randomIndex = 0
      let allFilterStatesOff = true

      if (activeFiltersMap && Array.isArray(activeFiltersMap)) {
          allFilterStatesOff = Boolean(activeFiltersMap.length < 1)
      }

      if (allFilterStatesOff) {
        randomIndex = Math.floor( Math.random() * arr.length )
      } else {
        do {
          randomIndex = Math.floor( Math.random() * arr.length )
        } while (!activeFiltersMap.includes(arr[randomIndex]))
      }

      return arr[randomIndex];
    },

  } // methods

}
