'use strict';

const aniListService = require('./src/services/dataGatherers/aniListService');

async function main() {
  // const bebop = await aniListService.getAniListData(1);

  // const sr = await aniListService.searchForSeries('Spice and Wolf');
  const tests = [
    'BALDR FORCE EXE Resolution',
    'Baka to Test to Shokanju Ni',
    'Bokutachi wa Benkyou ga Dekinai S2',
    'SSSS.Gridman',
    'Re Zero kara Hajimeru Isekai Seikatsu',
    'Karakai Jouzu no Takagi-san 2',
    'Himouto Umaru-chan R',
    'His And Her Circumstances',
    'Love Live! S2'
  ];

  let result;
  for (let i = 0; i < tests.length; ++i) {
    console.time(tests[i])
    result = await aniListService.smartSearch(tests[i]);
    // console.log(result);
    console.timeEnd(tests[i]);
  }
}

main();