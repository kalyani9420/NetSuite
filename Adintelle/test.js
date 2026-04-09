function uniqueWordsInSequence(input) {
    const words = input.split(' ');
    const seen = new Set();
    const result = [];
 
    for (const word of words) {
        if (!seen.has(word)) {
            seen.add(word);
            result.push(word);
        }
    }
 
    return result.join(' ');
}

let temp = uniqueWordsInSequence('10819 Siemens Ltd')
console.log(temp)