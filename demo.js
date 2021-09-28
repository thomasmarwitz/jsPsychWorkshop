// declare
var x
let y
const z

// init
x = 10
y = "Hello" // verschiedene Typen, implizit, bestimmt die Operationen
// num + vs. string +


// Statements: syntaktische Einheit, die beschreibt, dass eine Operation ausgeführt wird
// Zuweisung, Call, return

// Compound Statements: if/else, Schleifen

// Expressions
// Zusammensetzung aus Werten und aus Funktionsaufrufen


// Auslagerung von Code, Wiederverwendbarkeit
function printTree() {
    console.log("*")
    console.log("**")
    console.log("***")
    console.log("****")
    console.log("*****")
}
// erstmal machen, dann Muster erkennen und auslagern

// wachsen ist ein Prozess: => Schleifen

let s = ""
for (let i = 0; i < 5; i++) { // Beschreibung + Ausführung
    s += "*"
    console.log(s)
}

// if else with function + return

function isAdult(age) {
    if (age >= 18) {
        return true
    } else {
        return false
    }
}

// expression -> boolean

function isAdult(age) {
    return age >= 18
}

// function stacking
function getAdultFunction(adultAge) {
    return function (age) { // anonyme Funktion
        return age >= adultAge ? "old enough" : "too young"
    }
}

// angenommen, ihr sammelt Daten (wie ist erstmal egal...)
// nicht einfach unendlich viele Variablen anlegen ?!
let liste = []
liste.push(1)
liste.push(42)
liste.pop()

liste.forEach((x) => {console.log(x**2)})

// objekte: Wörterbuch
// quasi wie liste, nur mit Strings als Zugriff
let obj = {}
obj["a"] = 1
obj.a = 9

// komplexes Beispiel zum Abschluss
const string = "Franz jagt im komplett verwahrlosten Taxi quer durch Bayern."
counter = {}
for (let char of string) {
    counter[char] = char[char] + 1 || 1
}


