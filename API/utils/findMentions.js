const fs = require('fs');

async function findMentions(targetEntity, targetField, query, data, getBalance) {
    var my_string = query;
    my_string = my_string.replace(/(\r\n|\n|\r)/gm, "");
    my_string = my_string.replace(/ +(?= )/g, '');
    my_string = my_string.replace("{", "  {");
    my_string = my_string.replace("}", " }");
    my_string = my_string.replace(": ", ":");
    my_string = my_string.replace(" (", "(");
    var salad = my_string.split(" ");
    var before = [];
    var found = [];
    var startSearch = false;
    for (var i = 0; i < salad.length; i += 1) {
        var x = salad[i];

        if (x === "{") {
            var word = salad[i - 1];

            if (word === "}") {
                word = "empty";
            }
            if (word) {
                before.push(word.replace(/ *\([^)]*\) */g, ""));
            }
        }

        if (x === "}") {
            before.pop();
        }

        if (x.includes(targetEntity)) {
            startSearch = true;
        }

        if (startSearch === true) {
            if (x === targetField) {
                before.push(targetField);
                let newArray = before.slice();
                found.push(newArray);
                before.pop();
            }
        }
    }
    for (var i = 0; i < found.length; i++) {
        console.log("Attempt number " + i);
        await recursive(found[i], data, getBalance);
    }
    // findObjectByLabel(data, 'currentBalance');
    // iterate(data);
    console.log(JSON.stringify(data));
    return found;
}

async function recursive(list, data, getBalance) {
    var listiq = list.slice();
    var current = list[0];
    listiq.shift();
    if (listiq.length == 0) {
        console.log('listiq is 0, should stop');
        data[current] = await getBalance(2); // this line changes the thing ! 
        var id = data[id]; 
        var thing = await getBalance(2);
        console.log("Trying to print the thing "+ thing);
        console.log(await getBalance(2));
    } else {
    console.log('Searching ' + current + ' in ' + JSON.stringify(data));
    if (current.endsWith('s')) {
        for (var i = 0; i < data[current].length; i++) {
            await recursive(listiq, data[current][i], getBalance);
        }
    } else {
        await recursive(listiq, data[current], getBalance);
    }
}
}
// function mapo(listiq, data) {
//     console.log({ 'mapo': data, 'list': listiq, 'data': data, 'word': word });
//     var word = listiq[0];
//     listiq.shift();
//     var next_word = listiq[0];
//     data[word].map(datum => {
//         if (typeof next_word !== 'undefined') {
//             if (next_word.endsWith('s')) {
//                 return mapo(listiq, datum);
//             } else {
//                 return singular(listiq, datum)
//             }
//         } else {
//             return 'found';
//         }
//     })
// }

// function singular(listiq, datum) {
//     if (listiq.length == 0) {
//         console.log('singular found', listiq, datum);

//         return 'found'
//     }
//     var word = listiq[0];
//     data = datum[word];
//     listiq.shift();
//     console.log({ 'singular': datum, 'word': word, 'next_word': next_word});
//     var next_word = listiq[0];
//     if (typeof next_word !== 'undefined') {
//         console.log(next_word+" is not yet undefined");
//         if (next_word.endsWith('s')) {
//             return mapo(listiq, data);
//         } else {
//             return singular(listiq, data);
//         }
//     } else {
//         console.log(next_word+" is  undefined");
//         console.log({'fBalance': datum[word]})
//         console.log("the end");
//         return 'found'
//     }
// }

module.exports = findMentions;