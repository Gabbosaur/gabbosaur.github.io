/*Copyright (c) 2020 by Tobias (https://codepen.io/Tbgse/pen/dYaJyJ)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

consoleText(['Hi there.', 'Thanks for stopping by.', 'So..', 'Let me introduce myself!', 'Who am I?'], 'text', ['#3267a3']);

function consoleText(words, id, colors) {

    if (colors === undefined) colors = ['#fff'];
    var visible = true;
    var con = document.getElementById('console');
    var letterCount = 1;
    var x = 1;
    var waiting = false;
    var target = document.getElementById(id)
    target.setAttribute('style', 'color:' + colors[0])

    var intervalId = window.setInterval(function () {
        if (letterCount === 0 && waiting === false) {
            waiting = true;
            target.innerHTML = words[0].substring(0, letterCount)
            window.setTimeout(function () {
                // var usedColor = colors.shift();
                // colors.push(usedColor);
                words.shift();
                // words.push(usedWord);
                x = 1; // scrivi lettera
                // target.setAttribute('style', 'color:' + colors[0])
                letterCount += x;

                waiting = false;
            }, 100) // pausa tra una stringa all'altra
        } else if (letterCount === words[0].length + 1 && waiting === false) {
            // pause
            waiting = true;
            window.setTimeout(function () {
                x = -1; // cancella lettera
                letterCount += x;
                waiting = false;
            }, 1000) // durata pausa dopo scritto
        } else if (waiting === false) {
            // backspace
            // aggiunge/toglie una lettera
            target.innerHTML = words[0].substring(0, letterCount)
            letterCount += x;

        } else if (words.length === 1) {
            // console.log("mi rimane 1 parola");
            window.clearInterval(intervalId);
            return 0;
        }
    }, 80) // letter per letter


    window.setInterval(function () {
        if (visible === true) {
            con.className = 'console-underscore hidden'
            visible = false;

        } else {
            con.className = 'console-underscore'
            visible = true;
        }
    }, 400)
}